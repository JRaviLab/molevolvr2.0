# install packages needed to run molevolvr jobs
# (this will likely include the molevolvr package and its dependencies,
# as well as libraries we use for reporting to the app database and for
# running jobs on the cluster)
install.packages(
    c(
        "DBI",                  # Database interface
        "RPostgres",            # PostgreSQL-specific impl. for DBI
        "dbplyr",               # dplyr for databases
        "box",                  # allows R files to be referenced as modules
        "R6",                   # allows us to create python-like classes
        "future.batchtools"     # allows us to run async jobs on a variety of backends
    ),
    Ncpus = 6
)
