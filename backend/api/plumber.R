# plumber.R

box::use(
  plumber[...],
  api/support/custom_serializers[setup_custom_serializers]
)

# bring in custom serializers
setup_custom_serializers()

#* @apiTitle MolEvolvR 2.0 API
#* @apiTag Meta - Metadata about the API
#* @apiTag Analyses - Operations on analyses
#* @apiTag Statistics - Operations on the cluster as a whole

# allows cross-origin requests from anywhere
#* @filter cors
cors <- function(res) {
    res$setHeader("Access-Control-Allow-Origin", "*")
    plumber::forward()
}

#* An index of top-level endpoints in the API + metadata
#* @tag Meta
#* @get /
index <- function() {
  # return a list of endpoints
  list(
    analysis = "/analyses/",
    docs = "/__docs__/",
    stats = "/stats/",
    version = "2.0.0"
  )
}

# Define a custom error handler that includes a traceback
custom_error_handler <- function(req, res, err) {
  # Capture the traceback
  traceback <- paste(capture.output(traceback()), collapse = "\n")

  # Set the response status code and body
  res$status <- 500
  list(
    error = err$message,
    traceback = traceback
  )
}

#' @plumber
function(pr) {
  pr %>%
    pr_set_debug(TRUE) %>%
    pr_set_error(custom_error_handler) %>%
    pr_mount("/analyses", pr("./endpoints/analyses.R")) %>%
    pr_mount("/stats", pr("./endpoints/stats.R"))
}
