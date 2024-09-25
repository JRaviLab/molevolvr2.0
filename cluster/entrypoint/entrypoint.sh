#!/usr/bin/env bash

# exit on any error
# set -exuo pipefail

# bring in common functions
source /var/slurm-init/support/common.sh

# ------------------------------------------------------------
# --- generate configuration files from environment, other pre-steps
# ------------------------------------------------------------

# investigates the environment to determine what resources are available
# generates slurm.conf, slurmdbd.conf, and other config files
source /var/slurm-init/support/configuration.sh

# ------------------------------------------------------------
# --- launch support services used by all nodes
# ------------------------------------------------------------

# run services based on the CLUSTER_ROLE env var
source /var/slurm-init/support/services.sh

# ------------------------------------------------------------
# --- final process
# ------------------------------------------------------------

# if we're the controller, gracefully shut down on exit
# (this is still a WIP; i have to do more research on what
# signals the container gets when it's being shut down)
cleanup() {
    is_in_role "controller" && (
        echo "Cleaning up..."
        scontrol shutdown
        sleep 10
    )
}
is_in_role "controller" && \
trap 'cleanup' SIGTERM EXIT

source /var/slurm-init/support/logtail.sh
