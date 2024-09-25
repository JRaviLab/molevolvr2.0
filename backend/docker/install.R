# install packages depended on by the molevolvr API server
install.packages(
    c(
        "plumber",              # REST API framework
        "DBI",                  # Database interface
        "RPostgres",            # PostgreSQL-specific impl. for DBI
        "dbplyr",               # dplyr for databases
        "box",                  # allows R files to be referenced as modules
        "R6",                   # allows us to create python-like classes
        "future.batchtools"     # allows us to run async jobs on a variety of backends
    ),
    Ncpus = 6
)
