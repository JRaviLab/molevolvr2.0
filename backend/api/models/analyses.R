box::use(
  dplyr[select, any_of, mutate, filter, collect, tbl],
  dbplyr[`%>%`],
  api/db[getCon, insert_get_id]
)

statuses <- list(
  submitted="submitted",
  analyzing="analyzing",
  complete="complete",
  error="error"
)

#' submit a new analysis, which starts in the "submitted" state
#' @param name the name of the analysis
#' @param type the type of the analysis
#' @return the id of the new analysis
#' @export
db_submit_analysis <- function(name, type, con=NULL) {
  if (is.null(con)) {
    con <- getCon()
    on.exit(DBI::dbDisconnect(con))
  }

  # construct our new entry
  new_entry <- data.frame(
    name = name,
    type = type
  )

  return(insert_get_id("analyses", new_entry, con=con))
}

#' update an analysis' status field
#' @param id the id of the analysis to update
#' @param status the new status of the analysis
#' @export
#' @return the number of affected rows (typically 1, unless the analysis doesn't exist)
db_update_analysis_status <- function(id, status, reason=NULL, con=NULL) {
  if (is.null(con)) {
    con <- getCon()
    on.exit(DBI::dbDisconnect(con))
  }

  # check that status is in statuses
  if (!(status %in% names(statuses))) {
    stop("status must be one of: ", paste(names(statuses), collapse=", "))
  }

  # check that it's not 'submitted', since we can't revert to that status
  if (status == statuses$submitted) {
    stop("status cannot be set to 'submitted' after creation")
  }

  # update the record
  if (status == statuses$analyzing) {
    DBI::dbSendQuery(con, "UPDATE analyses SET status = $1, started = now() WHERE id = $2", params = list(status, id))
  }
  else if (status == statuses$complete) {
    DBI::dbSendQuery(con, "UPDATE analyses SET status = $1, completed = now() WHERE id = $2", params = list(status, id))
  }
  else if (status == statuses$error) {
    DBI::dbSendQuery(con, "UPDATE analyses SET status = $1, reason = $2, completed = now() WHERE id = $3", params = list(status, reason, id))
  }
  else {
    DBI::dbSendQuery(con, "UPDATE analyses SET status = $1 WHERE id = $2", params = list(status, id))
  }
}

#' query the 'analyses' table using dbplyr for all analyses
#' @return a data frame containing all analyses
#' @export
db_get_analyses <- function(con=NULL) {
  if (is.null(con)) {
    con <- getCon()
    on.exit(DBI::dbDisconnect(con))
  }

  analyses <- tbl(con, "analyses")
  result <- collect(analyses)

  return(result)
}

#' query the 'analyses' table using dbplyr
#' @export
db_get_analysis_by_id <- function(id, con=NULL) {
  if (is.null(con)) {
    con <- getCon()
    on.exit(DBI::dbDisconnect(con))
  }

  analyses <- tbl(con, "analyses")
  analyses %>%
    filter(id == !!id) %>%
    collect()

  # FIXME: perform a join against analysis_event
  # and then somehow tuck it into the 'events'
  # field. man, i wish i had a real ORM...
}
