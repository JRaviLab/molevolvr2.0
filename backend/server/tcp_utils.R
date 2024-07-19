#' Utility functions for working with TCP ports

#' Check if a port is in use
#' @param port The port to check
#' @param host The IP for which to check the port
#' @return TRUE if the port is in use, FALSE otherwise
is_port_in_use <- function(port, host = "127.0.0.1") {
  connection <- try(suppressWarnings(socketConnection(host = host, port = port, timeout = 1, open = "r+")), silent = TRUE)
  if (inherits(connection, "try-error")) {
    return(FALSE)  # Port is not in use
  } else {
    close(connection)
    return(TRUE)   # Port is in use
  }
}

#' Wait for a port to become free
#' @param port The port to wait for
#' @param timeout The maximum time to wait in seconds
#' @param poll_interval The interval between checks in seconds
#' @param host The IP for which to check the port
#' @param verbose Whether to print messages to the console
#' @return TRUE if the port is free, FALSE if the timeout is reached
wait_for_port <- function(port, timeout = 60, poll_interval = 5, host = "127.0.0.1", verbose = TRUE) {
  start_time <- Sys.time()
  end_time <- start_time + timeout
  
  while (Sys.time() < end_time) {
    if (!is_port_in_use(port, host)) {
      if (verbose) { cat("Port", port, "is now free\n") }
      return(TRUE)
    }
    if (verbose) { cat("Port", port, "is in use. Checking again in", poll_interval, "seconds...\n") }
    Sys.sleep(poll_interval)
  }
  
  if (verbose) { 
    cat(paste0("Timeout of ", timeout, "s reached, but port ", port, " is still in use, aborting\n"))
  }
  return(FALSE)
}
