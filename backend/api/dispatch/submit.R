box::use(
  analyses = api/models/analyses,
  api/cluster[dispatch]
)

#' Dispatch an analysis, i.e. create a record for it in the database and submit
#' it to the cluster for processing
#' @param name the name of the analysis
#' @param type the type of the analysis
#' @return the id of the new analysis
dispatchAnalysis <- function(name, type) {
    # create the analysis record
    analysis_id <- analyses$db_submit_analysis(name, type)

    # print to the error log that we're dispatching this
    cat("Dispatching analysis", analysis_id, "\n")

    # dispatch the analysis async (to slurm, or wherever)
    promise <- dispatch(function() {

        tryCatch({
            # do the analysis
            analyses$db_update_analysis_status(analysis_id, "analyzing")

            # FIXME: implement calls to the molevolvr package to perform the
            #  analysis. we may fire off additional 'dispatch()' calls if we
            #  need to parallelize things.

            # --- begin testing section which should be removed ---

            # for now, just do a "task"
            Sys.sleep(1) # pretend we're doing something

            # if type is "break", raise an error to test the handler
            if (type == "break") {
                stop("test error")
            }

            # --- end testing section ---

            # finalize when we're done
            analyses$db_update_analysis_status(analysis_id, "complete")
        }, error = function(e) {
            # on error, log the error and update the status
            analyses$db_update_analysis_status(analysis_id, "error", reason=e$message)
            cat("Error in analysis ", analysis_id, ": ", e$message, "\n")
            flush()
        })

        cat("Analysis", analysis_id, " completed\n")
    })

    return(analysis_id)
}

box::export(dispatchAnalysis)
