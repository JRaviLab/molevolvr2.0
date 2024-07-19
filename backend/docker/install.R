# install packages depended on by the molevolvr API server
install.packages(
    c(
        "plumber",    # REST API framework
        "DBI",        # Database interface
        "RPostgres",  # PostgreSQL-specific impl. for DBI
        "dbplyr",     # dplyr for databases
        "box"         # allows R files to be referenced as modules
    ),
    Ncpus = 6
)
