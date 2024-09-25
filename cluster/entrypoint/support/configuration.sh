#!/usr/bin/env bash

# bring in common functions
source /var/slurm-init/support/common.sh

# the name of our local cluster
export CLUSTER_NAME=${CLUSTER_NAME:-localcluster}

# determine the cores mapped to slurm here in order to generate
# a correct CPUSpecList value for slurm.conf.
# (note: because the master and worker configs should match,
# we need to allocate the same cores to the master and worker nodes)
ALLOWED_CPUS=$(
    grep -i ^cpus_allowed_list /proc/self/status | \
    cut -d':' -f2- | xargs
)
export ALLOWED_CPUS

# split cpuset into first and last; e.g., '36-96' into 36 and 96
IFS=- read -r FIRST_CPU LAST_CPU <<< "${ALLOWED_CPUS}"
let TOTAL_CPUS="$LAST_CPU - $FIRST_CPU"
export TOTAL_CPUS

export FINAL_CPUSPECLIST=$(
    seq 0 ${TOTAL_CPUS} | awk '{print $1 * 2}' | paste -sd "," -
)

let TOTAL_CPU_CNT="$TOTAL_CPUS + 1"
export TOTAL_CPU_CNT

ls -l /opt/templates/

# generate slurm.conf, cgroup.conf from the template files
mkdir -p /etc/slurm/
envsubst -i /opt/templates/slurm.conf.template -o /etc/slurm/slurm.conf
envsubst -i /opt/templates/cgroup.conf.template -o /etc/slurm/cgroup.conf
envsubst -i /opt/templates/slurmdbd.conf.template -o /etc/slurm/slurmdbd.conf

# create a few more folders that services expect to exist
mkdir -p /var/spool/slurmctld/
mkdir -p /sys/fs/cgroup/system.slice

# slurmdbd insists on its config file being read-writeable by its owner, so
# make that the case now
chmod 0600 /etc/slurm/slurmdbd.conf
