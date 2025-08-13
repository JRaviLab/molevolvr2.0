# SETUP

- Create Google Cloud project
  - Give project descriptive name
  - Create service account with just permissions to build container images
  - Create service account with just permissions to run cloud funcs
  - Update `deploy.sh` vars as appropriate
- Generate GitHub fine-grained personal access token
  - Increase expiration as desired
  - Grant access to only one relevant repo
  - Grant write permissions for issues
  - Store in password vault
- Deploy cloud func
  - Create `.env.local` file in this folder, make sure it is NOT TRACKED BY GIT, and add contents `GITHUB_TOKEN=TOKENVALUE`
  - [Install `gcloud` CLI tool](https://cloud.google.com/sdk/docs/install)
  - [Authenticate CLI](https://cloud.google.com/docs/authentication/gcloud)
  - From this folder, run `./deploy.sh func-name`
  - Copy function URL into `frontend/src/api` as appropriate
