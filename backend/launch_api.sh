#!/bin/bash

# write slurm.conf from template
if [ "${USE_SLURM}" = "1" ]; then
    echo "* Slurm enabled, configuring..."

    # write slurm config from template
    envsubst < /opt/config-templates/slurm.conf.template > /etc/slurm/slurm.conf
    # ensure munge is running so we can auth to the cluster
    service munge start
fi

# run schema migrations via ./schema/apply.sh
(
    echo "* Running schema migrations, if any are available..."
    cd schema
    ./apply.sh
)

# pass off to drip to control serving and reloading the API
drip
