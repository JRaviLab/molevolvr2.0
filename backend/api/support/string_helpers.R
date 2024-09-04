#' Helper functions for string manipulation

#' Convert a named vector/list to a string, showing both the names and values
#' @param nvl The named vector or list
#' @return A string representation of the input in the form "key=value, ..."
inline_str_list <- function(nvl) {
    # if it's not a list, wrap it in a list
    if (!is.list(nvl)) {
        nvl <- list(nvl)
    }
    
    paste(names(nvl), nvl, sep = "=", collapse = ", ")
}
