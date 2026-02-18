#!/bin/bash

set -e

if [ "${SKIP_DB_LOAD}" = "1" ]; then
    echo "* Skipping db import, since SKIP_DB_LOAD=${SKIP_DB_LOAD}"
elif [ -d "/db-exports/" ]; then
    # find the most recent database dump /db-exports/*.dump in by using sort;
    # presumes that dumpfiles are named <label>_<timestamp>.dump
    TARGET_DUMPFILE=$(ls /db-exports/*.dump | sort -t '_' -k2 -r | head -n 1)

    # if no dump file found, exit
    if [ -z "${TARGET_DUMPFILE}" ]; then
        echo "* No db export files found in /db-exports/, skipping import"
        touch /tmp/initialized
        exit 0
    fi
    
    echo "* Found db export ${TARGET_DUMPFILE}"

    # drop and recreate the database
	echo "* Dropping and recreating database ${POSTGRES_DB}..."
    dropdb -U ${POSTGRES_USER} ${POSTGRES_DB}
    createdb -U ${POSTGRES_USER} -T template0 ${POSTGRES_DB}

	echo "* Restoring database from dump ${TARGET_DUMPFILE}..."
    time pg_restore -U ${POSTGRES_USER} -d ${POSTGRES_DB} "${TARGET_DUMPFILE}"

    echo "* Restored db export ${TARGET_DUMPFILE}"
else    
    echo "No db-exports directory found, skipping import"
fi

touch /tmp/initialized
