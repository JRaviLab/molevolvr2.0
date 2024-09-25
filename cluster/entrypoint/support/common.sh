#!/usr/bin/env bash

# contains common functions for the entrypoint scripts

function is_in_role() {
    # returns true if the given role is in the CLUSTER_ROLE env var
    # note that the env var consists of comma-delimited strings
    local role=$1

    # [[ "${CLUSTER_ROLE,,}" == *"${role,,}"* ]]
    [[ ${CLUSTER_ROLE} =~ (^|,)"$role"(,|$) ]]
}
