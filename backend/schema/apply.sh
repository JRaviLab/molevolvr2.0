#!/usr/bin/env bash

# this script should be executed from the app container

# connection string for the actual db
PG_CONN_STRING="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?search_path=public&sslmode=disable"

atlas migrate apply \
  --dir "file://migrations" \
  --url ${PG_CONN_STRING}
