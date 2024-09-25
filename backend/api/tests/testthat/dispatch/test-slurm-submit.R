test_that("slurm jobs run on the cluster", {
    # skip the test if the env var USE_SLURM != 1
    skip_if(!identical(Sys.getenv("USE_SLURM"), "1"), message="SLURM disabled, skipping SLURM tests")

    options(box.path = "/app")

    box::use(
        api/cluster[dispatch],
        future[value]
    )

    # test that the dispatch function works
    job <- dispatch(function() {
        "done"
    })

    expect_equal(value(job), "done")

    # test that we can run a second job, too
    job2 <- dispatch(function() {
        "done, again"
    })

    expect_equal(value(job2), "done, again")
})

test_that("multiple slurm jobs run concurrently on the cluster", {
    # skip the test if the env var USE_SLURM != 1
    skip_if(!identical(Sys.getenv("USE_SLURM"), "1"), message="SLURM disabled, skipping SLURM tests")

    options(box.path = "/app")

    box::use(
        api/cluster[dispatch],
        future[value]
    )

    # fire off job 1 and 2
    job <- dispatch(function() { "done" })
    job2 <- dispatch(function() { "done, again" })

    # collect the results of each job
    expect_equal(value(job), "done")
    expect_equal(value(job2), "done, again")
})

test_that("nested jobs complete as expected", {
    # skip the test if the env var USE_SLURM != 1
    skip_if(!identical(Sys.getenv("USE_SLURM"), "1"), message="SLURM disabled, skipping SLURM tests")
    
    options(box.path = "/app")

    box::use(
        api/cluster[dispatch],
        future[value]
    )

    # create a job which contains a second job
    job <- dispatch(function() {
        inside_job <- dispatch(function() {
            "it was an inside job"
        })
        value(inside_job)
    })

    # collect the results of each job
    expect_equal(value(job), "it was an inside job")
})
