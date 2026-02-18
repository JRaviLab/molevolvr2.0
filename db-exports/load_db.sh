#!/usr/bin/env bash

TARGET_DUMPFILE="${1?"Error: No dump file specified"}"

time pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc "${TARGET_DUMPFILE}" \
    && echo "* Loaded db export ${TARGET_DUMPFILE}" \
    || echo "* Failed to load db export (code: $?)"
