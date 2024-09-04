#' Provides a connection to the database

#' Gets a connection to the postgres database
#' @export
getCon <- function() {
  POSTGRES_HOST = Sys.getenv("POSTGRES_HOST", "db")
  POSTGRES_DB = Sys.getenv("POSTGRES_DB", "molevolvr")
  POSTGRES_USER = Sys.getenv("POSTGRES_USER")
  POSTGRES_PASSWORD = Sys.getenv("POSTGRES_PASSWORD")

  # raise an exception if user or password is unset
  if (POSTGRES_USER == "" || POSTGRES_PASSWORD == "") {
    stop("DB_USER and DB_PASSWORD must be set")
  }

  con <- DBI::dbConnect(
    RPostgres::Postgres(),
    dbname = POSTGRES_DB,
    host = POSTGRES_HOST,
    user = POSTGRES_USER,
    password = POSTGRES_PASSWORD
  )
  
  return(con)
}

# TODO: implement connection pooling?

# ----------------
# --- helpers
# ----------------

#' Insert a record into a table and return <id_col>
#' 
#' Note that this uses a postgres-specific feature, "INSERT ... RETURNING <col>",
#' to retrieve the generated UUID without having to make a separate query.
#' 
#' @param target_table The table into which to insert
#' @param new_record A named list of values to insert
#' @param id_col The name of the column to return (default: "id")
#' @param con An existing database connection to use; if NULL, creates a new one (default: NULL)
#' @return The value of the <id_col> column for the inserted record
#' @export
insert_get_id <- function(target_table, new_record, id_col="id", con=NULL) {
  if (is.null(con)) {
    con <- getCon()
    on.exit(DBI::dbDisconnect(con))
  }

  # Generate the INSERT statement using DBI
  # and append a postgres-specific feature, "RETURNING <col>",
  # so that we can retrieve the generated UUID without
  # having to make a separate query
  sql <- paste(
    DBI::sqlAppendTableTemplate(
      con, target_table, new_record,
      prefix="$", pattern="1", row.names=FALSE
    ), "RETURNING ", DBI::dbQuoteIdentifier(con, id_col)
  )

  # Execute the query and retrieve the generated UUID
  # from the first (hopefully only) resulting record
  result <- DBI::dbGetQuery(con, sql, params = unname(new_record))
  generated_uuid <- result[[id_col]][1]

  return(generated_uuid)
}
