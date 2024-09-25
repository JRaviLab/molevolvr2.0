#!/usr/bin/env bash

# launches services specific to the type of node, as defined by the
# env var CLUSTER_ROLE; the CLUSTER_ROLE env var consists of a
# comma-separated list of roles, e.g., "controller,worker".
# possible values are:
# - controller: the controller (aka 'master') node, e.g. runs slurmctld and shouldn't run jobs
# - worker: a worker node, e.g. runs slurmd and can run jobs
# - dbd: runs the slurmdbd service

# bring in common functions
source /var/slurm-init/support/common.sh

# checks that a service is running, waiting up to 60 seconds for it to start
function wait_for_service() {
    local SERVICE_NAME=$1
    local CHECK_CMD=${2:-":"}

    TIMEOUT=60
    INTERVAL=5
    ELAPSED=0

    while [ ${ELAPSED} -lt ${TIMEOUT} ]; do
        if service ${SERVICE_NAME} status; then
            echo "${SERVICE_NAME} is running."
            return 0
        else
            echo "${SERVICE_NAME} is not running. Checking again in ${INTERVAL} seconds..."
            
            if [ "${CHECK_CMD}" != ":" ]; then
                eval ${CHECK_CMD}
            fi

            sleep ${INTERVAL}
            ELAPSED=$((ELAPSED + INTERVAL))
        fi
    done

    echo "Timeout reached. ${SERVICE_NAME} did not start within ${TIMEOUT} seconds."
    return 1
}

# start common services
service dbus start
service munge start
service cron start

# first, start slurmdbd and wait for it to be up
is_in_role "dbd" && service slurmdbd start && wait_for_service slurmdbd

# start services based on our roles
is_in_role "controller" && service slurmctld start

# check that the services are running
is_in_role "dbd" && ( wait_for_service slurmdbd || cat /var/log/slurmdbd.log )
is_in_role "controller" && ( wait_for_service slurmctld "service slurmctld start" || cat /var/log/slurmctld.log )

# the worker's a little complicated: it can fail if slurmctld hasn't started
# yet, so we'll repeatedly attempt to start it until it does
is_in_role "worker" && (
    while ! sinfo; do
        echo "* waiting for slurmctld to start before we start slurmd..."
        sleep 5
    done

    # ok, now try to start it
    service slurmd start

    wait_for_service slurmd "cat /var/log/slurmd.log"
)
