# MariaDB Configuration

This folder contains configuration for the MariaDB instance that runs
alongside Slurm; Slurm populates the instance with job accounting
and completion data.

Note that we would just use the existing PostgreSQL instance that's
used for the rest of the app, but Slurm requires MySQL/MariaDB and
sets up its own schema in the database.

See https://slurm.schedmd.com/accounting.html for details
about Slurm's accounting system and use of the database.
