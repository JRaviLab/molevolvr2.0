#!/usr/bin/env bash

set -x

# this script should be executed from the app container

MIGRATION_NAME=${1?migration name not provided, aborting}

# conn string for the 'dev' db that atlas requires to stage changes
PG_DEV_CONN_STRING="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_DEV_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?search_path=public&sslmode=disable"

atlas migrate diff ${MIGRATION_NAME} \
  --dir "file://migrations" \
  --to "file://schema.pg.hcl" \
  --dev-url ${PG_DEV_CONN_STRING}
