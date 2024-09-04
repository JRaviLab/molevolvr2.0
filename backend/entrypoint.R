options(box.path = "/app")

box::use(
  plumber[plumb],
  server/tcp_utils[wait_for_port]
)

# receive the target port as the env var API_PORT, or 9050 if unspecified
target_port <- as.integer(Sys.getenv("API_PORT", unset=9050))

# workaround for https://github.com/siegerts/drip/issues/3, in which
# reloading fails due to the port being in use. we just wait, polling
# occasionally, for up to 60 seconds for the port to become free.
if (wait_for_port(target_port, poll_interval = 1, verbose = FALSE)) {
  pr <- plumb("./api/plumber.R")$run(
    host="0.0.0.0",
    port=target_port,
    debug=TRUE
  )
}
else {
  stop(
    paste0("Failed to start the API server; port ", target_port, " still occupied after wait timeout exceeded"
  )
}
