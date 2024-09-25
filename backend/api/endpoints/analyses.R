# endpoints for submitting and checking information about analyses.
# included by the router aggregator in ./plumber.R; all these endpoints are
# prefixed with /analyses/ by the aggregator.

box::use(
  analyses = api/models/analyses,
  api/dispatch/submit[dispatchAnalysis],
  api/helpers/responses[api_404_if_empty],
  tibble[tibble],
  dplyr[select, any_of, mutate, pull],
  dbplyr[`%>%`]
)

#* @apiTitle analysis Management

#* Query for all analyses
#* @tag Analyses
#* @serializer jsonExt list(verbose_checks=TRUE)
#* @get /
analysis_list <- function() {
  result <- analyses$db_get_analyses()

  # NOTE: this is 'postprocessing' is required when jsonlite's force param is
  # FALSE, because it can't figure out how to serialize the types otherwise.
  # while we just set force=TRUE now, i don't know all the implications of that
  # choice, so i'll leave this code here in case we need it.
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
#* @response 404 error_message="Analysis with id '...' not found"
analysis_status <- function(id, res) {
  api_404_if_empty(
    analyses$db_get_analysis_by_id(id) %>% pull(status), res,
     error_message=paste0("Analysis with id '", id, "' not found")
  )
}


#* Query the database for an analysis's complete information.
#* @tag Analyses
#* @serializer jsonExt list(auto_unbox=TRUE)
#* @get /<id:str>
#* @response 200 schema=analysis
#* @response 404 error_message="Analysis with id '...' not found"
analysis_by_id <- function(id, res) {
  # below we return the analysis object; we have to unbox it again
  # because auto_unbox only unboxes length-1 lists and vectors, not
  # dataframes
  api_404_if_empty(
    jsonlite::unbox(analyses$db_get_analysis_by_id(id)),
    res, error_message=paste0("Analysis with id '", id, "' not found")
  )
}

#* Submit a new MolEvolvR analysis, returning the analysis ID
#* @tag Analyses
#* @serializer jsonExt
#* @post /
#* @param name:str A friendly name for the analysis chosen by the user
#* @param type:str Type of the analysis (e.g., "FASTA")
analysis_submit <- function(name, type) {
  # submits the analysis, which handles:
  # - inserting the analysis into the database
  # - dispatching the analysis to the cluster
  # - returning the analysis ID
  analysis_id <- dispatchAnalysis(name, type)

  # NOTE: unboxing (again?) gets it return a single string rather than a list
  # with a string in it. while it works, it's a hack, and i should figure out
  # how to make the serializer do this for me.
  return(
    jsonlite::unbox(analyses$db_get_analysis_by_id(analysis_id))
  )
}
