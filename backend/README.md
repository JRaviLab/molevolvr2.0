# MolEvolvR Backend

The backend is implemented as a RESTful API over the following entities:

- `User`: Represents a user of the system. At the moment logins aren't
required, so all regular users are the special "Anonymous" user. Admins
have individual accounts.
- `Analysis`: Represents an analysis submitted by a user. Each analysis has a unique ID
and is associated with a user. analyses contain the following sub-entities:
    - `Submission`: Represents the submission of a Analysis, e.g. the data
       itself as well the submission's parameters (both selected by the 
       user and supplied by the system).
    - `AnalysisStatus`: Represents the status of a Analysis. Each Analysis has a status
    associated with it, which is updated as the Analysis proceeds through its
    processing stages.
    - `AnalysisResult`: Represents the result of a Analysis.
- `Cluster`: Represents the status of the overall cluster, including
how many analyses have been completed, how many are in the queue,
and other statistics related to the processing of analyses.

## Implementation

The backend is implemented in Plumber, a package for R that allows for the
creation of RESTful APIs. The API is defined in the `api/router.R` file, which
contains the endpoints for the API. Supporting files are found in
`api/resources/`.

The API is then run using the `launch_api.R` file, which starts the Plumber
server.
