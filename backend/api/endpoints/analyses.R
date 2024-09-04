# endpoints for submitting and checking information about analyses.
# included by the router aggregator in ./plumber.R; all these endpoints are
# prefixed with /analysis/ by the aggregator.

box::use(
  analyses = api/models/analyses,
  tibble[tibble],
  dplyr[select, any_of, mutate],
  dbplyr[`%>%`]
)

#* @apiTitle analysis Management

#* Query for all analyses
#* @tag Analyses
#* @serializer jsonExt list(verbose_checks=TRUE)
#* @get /
analysis_list <- function() {
  result <- analyses$db_get_analyses()

  # postprocess types in the result
  # result <- result %>%
  #   mutate(
  #     status = as.character(status),
  #     info = as.character(info)
  #   )

  result
}

#* Query the database for an analysis's status
#* @tag Analyses
#* @serializer jsonExt
#* @get /<id:str>/status
analysis_status <- function(id) {
  result <- analyses$db_get_analysis_by_id(id)
  result$status
}


#* Query the database for an analysis's complete information.
#* @tag Analyses
#* @serializer jsonExt
#* @get /<id:str>
analysis_by_id <- function(id){
  result <- analyses$db_get_analysis_by_id(id)
  # result is a tibble with one row, so just
  # return that row rather than the entire tibble
  result
}

#* Submit a new MolEvolvR analysis, returning the analysis ID
#* @tag Analyses
#* @serializer jsonExt
#* @post /
analysis_submit <- function(name, type) {
    # submit the analysis
    result <- analyses$db_submit_analysis(name, type)
    # the result is a scalar in a vector, so just return the scalar
    # result[[1]]
}
