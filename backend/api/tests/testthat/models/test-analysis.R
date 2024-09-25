test_that("analyses can be coerced to JSON", {
  options(box.path = "/app")

  box::use(
    api/db[getCon],
    api/models/analyses[db_submit_analysis, db_get_analyses]
  )

  con <- getCon()

  # perform the test within a transaction
  DBI::dbBegin(con)

  # submit analyses and get it back
  db_submit_analysis("hey", "there", con=con)
  analyses <- db_get_analyses(con=con)

  expect_error({
    jsonlite::toJSON(analyses, force = TRUE)
  }, NA)

  # and revert so we don't affect the database
  DBI::dbRollback(con)
  DBI::dbDisconnect(con)
})

test_that("submitted analyses can be retrieved and matches submission", {
  options(box.path = "/app")

  box::use(
    api/db[getCon],
    api/models/analyses[db_submit_analysis, db_get_analyses, db_get_analysis_by_id]
  )

  con <- getCon()

  # perform the test within a transaction
  DBI::dbBegin(con)

  # submit analyses and get it back
  code <- db_submit_analysis("hey", "there", con=con)
  analyses <- db_get_analyses(con=con)

  # just get the last element from the tibble
  last_analysis <- analyses[nrow(analyses),]

  # check specific fields for equality
  # (things like the timestamps aren't going to be the same)
  expect_equal( last_analysis$id, code )
  expect_equal( last_analysis$name, "hey" )
  expect_equal( last_analysis$type, "there" )
  expect_equal( toString(last_analysis$status), "submitted" )

  # wait for a bit, then quwry and check the status again
  Sys.sleep(10)
  result <- db_get_analysis_by_id(code, con=con)
  expect_equal( toString(result$status), "submitted" )

  # and revert so we don't affect the database
  DBI::dbRollback(con)
  DBI::dbDisconnect(con)
})
