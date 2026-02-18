#!/usr/bin/env bash

TARGET_DUMPFILE="${POSTGRES_DB}_$( date +%Y-%m-%d).dump"

if [ -f "${TARGET_DUMPFILE}" ]; then
    if  [ "${FORCE_OVERWRITE}" != "1" ]; then
        echo "* File ${TARGET_DUMPFILE} already exists, overwrite it?"
        read -p "  (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "* Aborting"
            exit 1
        fi
    else
        echo "* Overwriting existing file ${TARGET_DUMPFILE}"
    fi
fi

time pg_dump -F c -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "${TARGET_DUMPFILE}" \
    && echo "* Created db export ${TARGET_DUMPFILE}" \
    || echo "* Failed to create db export (code: $?)"
