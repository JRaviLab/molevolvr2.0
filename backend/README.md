# MolEvolvR Backend

The backend is implemented as a RESTful API. It currently provides endpoints for
just the `analysis` entity, but will be expanded to include other entities as
well.

## Usage

Run the `launch_api.sh` script to start API server in a hot-reloading development mode.
The server will run on port 9050, unless the env var `API_PORT` is set to another
value. Once it's running, you can access it at http://localhost:9050.

If the env var `USE_SLURM` is equal to 1, the script will create a basic SLURM
configuration and then launch `munge`, a client used to authenticate to the
SLURM cluster. The template that configures the backend's connection to SLURM
can be found at `./cluster_config/slurm.conf.template`.

The script then applies any outstanding database migrations via
[atlas](https://github.com/ariga/atlas). Finally the API server is started by
executing the `entrypoint.R` script via
[drip](https://github.com/siegerts/drip), which restarts the server whenever
there are changes to the code.

*(Side note: the entrypoint contains a bit of custom logic to
defer actually launching the server until the port it listens on is free, since
drip doesn't cleanly shut down the old instance of the server.)*

## Implementation

The backend is implemented in [Plumber](https://www.rplumber.io/index.html), a
package for R that allows for the creation of RESTful APIs. The API is defined
in the `api/plumber.R` file, which defines the router and some shared metadata
routes. The rest of the routes are brought in from the `endpoints/` directory.

Currently implemented endpoints:
- `POST /analyses`: Create a new analysis
- `GET  /analyses`: Get all analyses
- `GET  /analyses/:id`: Get a specific analysis by its ID
- `GET  /analyses/:id/status`: Get just the status field for an analysis by its ID

*(TBC: more comprehensive docs; see the [Swagger docs](http://localhost:9050/__docs__/) for now)*

## Database Schema

The backend uses a PostgreSQL database to store analyses. The database's schema
is managed by [atlas](https://github.com/ariga/atlas); you can find the current
schema definition at `./schema/schema.pg.hcl`. After changing the schema, you
can create a "migration", i.e. a set of SQL statements that will bring the
database up to date with the new schema, by running `./schema/makemigration.sh
<reason>`; if all is well with the schema, the new migration will be put in
`./schema/migrations/`.

Any pending migrations are applied automatically when the backend starts up, but
you can manually apply new migrations by running `./schema/apply.sh`.

## Testing

You can run the tests for the backend by running the `run_tests.sh` script. The
script will recursively search for all files with the pattern `test_*.R` in the
`tests/` directory and run them. Tests are written using the
[testthat](https://testthat.r-lib.org/) package.

Note that the tests currently depend on the stack's services being available, so
you should run the tests from within the backend container after having started
the stack normally. An easy way to do that is to execute `./run_stack.sh shell`
in the repo root, which will give you an interactive shell in the backend
container. Eventually, we'll have them run in their own environment, which the
`run_tests.sh` script will likely orchestrate.

## Implementation Details

### Domain Entities

*NOTE: the backend is as of now a work in progress, so expect this to change.*

The backend includes, or will include, the following entities:

- `User`: Represents a user of the system. At the moment logins aren't required,
so all regular users are the special "Anonymous" user. Admins have individual
accounts.
- `Analysis`: Represents an analysis submitted by a user. Each analysis has a
unique ID and is associated with a user. analyses contain the following
sub-entities:
    - `AnalysisSubmission`: Represents the submission of a Analysis, e.g. the
       data itself as well the submission's parameters (both selected by the
       user and supplied by the system).
    - `AnalysisStatus`: Represents the status of a Analysis. Each Analysis has a
    status associated with it, which is updated as the Analysis proceeds through
    its processing stages.
    - `AnalysisResult`: Represents the result of a Analysis.
- `Queue`: Represents the status of processing analyses, including how many
analyses have been completed, how many are in the queue, and other statistics.
- `System`: Represents the system as a whole, including the version of the
backend, the version of the frontend, and other metadata about the system.
Includes runtime statistics about the execution environment as well, such as RAM
and CPU usage. Includes cluster information, too, such as node uptime and
health.

### Job Processing

*NOTE: we use the term "job" here to indicate any asynchronous task that the
backend needs to perform outside of the request-response cycle. It's not related
to the app domain's terminology of a "job" (i.e. an analysis).*

The backend makes use of
[future.batchtools](https://future.batchtools.futureverse.org/), an extension
that adds [futures](https://future.futureverse.org/) support to
[batchtools](https://mllg.github.io/batchtools/index.html), a package for
processing asynchronous jobs. The package provides support for many
job-processing systems, including
[SLURM](https://slurm.schedmd.com/documentation.html); more details on
alternative systems can be found in the [`batchtools` package
documentation](https://mllg.github.io/batchtools/articles/batchtools.html).

In our case, we use SLURM; `batchtools` basically wraps SLURM's `sbatch` command
and handles producing a job script for an R callable, submitting the script to
the cluster for execution, and collecting the results to be returned to R. The
template for the job submission script can be found at
`./cluster_config/slurm.tmpl`.
