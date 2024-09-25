# contains shared state for interacting with the job dispatch system

box::use(
    batchtools[makeRegistry],
    future.batchtools[...],
    future[plan, future, value]
)

.on_load <- function(ns) {
    options(future.cache.path = "/opt/shared-jobs/.future", future.delete = TRUE)

    # create a registry
    dir.create("/opt/shared-jobs/jobs-scratch", recursive = TRUE, showWarnings = FALSE)
    # reg <- makeRegistry(file.dir = NA, work.dir = "/opt/shared-jobs/jobs-scratch")
    # call plan()
    plan(
        batchtools_slurm,
        template = "/app/cluster_config/slurm.tmpl",
        resources = list(nodes = 1, cpus = 1, walltime=2700, ncpus=1, memory=1000)
    )
}

#' Takes in a block of code and runs it asynchronously, returning the future
#' @param callable a function that will be run asynchronously in a slurm job
#' @param work.dir the directory to run the code in, which should be visible to worker nodes
#' @return a future object representing the asynchronous job
dispatch <- function(callable, work.dir="/opt/shared-jobs/jobs-scratch") {
    # ensure we run jobs in a place where slurm nodes can access them, too
    setwd(work.dir)
    future(callable())
}

box::export(dispatch)
