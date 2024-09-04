# endpoints for checking on the status of the cluster as a whole.
# included by the router aggregator in ./plumber.R; all these endpoints are
# prefixed with /cluster/ by the aggregator.

#* @apiTitle Cluster Management

#* Query for all jobs; since this is currently not allowed, returns an error
#* @tag Statistics
#* @get /
status <- function(res){
    res$status <- 405
    list(error = "Remains to be implemented")
}
