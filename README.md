# MolEvolvR Stack

This repo contains the implementation of the MolEvolvR stack, consisting of:
- `frontend`: the frontend web app, written in React
- `backend`: a backend written in [Plumber](https://www.rplumber.io/index.html)
- `cluster`: the containerized SLURM "cluster" on which jobs are run
- `services`: a collection of services on which the stack relies:
    - `postgres`: configuration for a PostgreSQL database, which stores job information

Most of the data processing is accomplished via the `MolEvolvR` package, available at https://github.com/JRaviLab/molevolvr.
The stack provides a user-friendly interface for accepting and monitoring job progress, and orchestrates running the jobs on SLURM.
The jobs themselves call methods of the package at each stage of processing.

## Prerequisites

To run the stack, you'll need to [install Docker and Docker Compose](https://www.docker.com/).

## Setup

1. Clone this repository:
`git clone https://github.com/JRaviLab/molevolvr2.0.git`
then `cd molevolvr2.0` to move into your cloned directory.

2. Copy  `.env.TEMPLATE` to `.env` and fill in the necessary values.
You should supply a random password for the `POSTGRES_PASSWORD` variable and any other `_PASSWORD` fields that are blank.
Of note is the `DEFAULT_ENV` variable, which gives `run_stack.sh` a default environment in which to operate; in development, this should be set to `dev`.
