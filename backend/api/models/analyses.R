box::use(
  dplyr[select, any_of, mutate, filter, collect, tbl],
  dbplyr[`%>%`],
  api/db[getCon, insert_get_id]
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
