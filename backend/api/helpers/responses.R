#' Helpers for returning error responses from the API

api_404_if_empty <- function(result, res, error_message="Not found") {
    if (isTRUE(nrow(result) == 0 || is.null(result) || length(result) == 0)) {
        cat("Returning 404\n")
        res$status <- 404
        return(error_message)
    }
    
    return(result)
}

box::export(api_404_if_empty)
