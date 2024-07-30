# MolEvolvR Stack

This repo contains the implementation of the MolEvolvR stack, i.e.:
- `app`: the frontend webapp, written in React
- `backend`: a backend written in [Plumber](https://www.rplumber.io/index.html)
- `cluster`: the containerized SLURM "cluster" on which jobs are run
- `services`: a collection of services on which the stack relies:
    - `postgres`: configuration for a PostgreSQL database, which stores job information

Most of the data processing is accomplished via the `MolEvolvR` package, which
is currently available at https://github.com/JRaviLab/molevol_scripts. The stack
simply provides a user-friendly interface for accepting and monitoring the
progress of jobs, and orchestrates running the jobs on SLURM. The jobs
themselves call methods of the package at each stage of processing.

## Running the Stack in Development

To run the stack, you'll need to [install Docker and Docker Compose](https://www.docker.com/).

First, copy `.env.TEMPLATE` to `.env` and fill in the necessary values. You
should supply a random password for the `POSTGRES_PASSWORD` variable. Of note
is the `DEFAULT_ENV` variable, which gives `run_stack.sh` a default environment
in which to operate; in development, this should be set to `dev`.

Then, you can run the following command to bring up the stack:

```bash
./run_stack.sh
```

This will start the stack in development mode, which automatically reloads the
backend or frontend when there are changes to their source.

You should then be able to access the frontend at `http://localhost:5173`.

## Production

To run the stack in production, you can run the following

```bash
./run_stack.sh prod
```

This will start the stack in production mode.
