#!/usr/bin/env bash

# this script sets up log tailing; which logs are tailed depends on the node

echo ""
echo "==================================================================="
echo "=== Slurm setup complete! monitoring logs forever..."
echo "==================================================================="
echo ""

# the code below gathers logs from the various slurm processes and cats them
# forever to stdout along with whatever command was passed to the container as
# its CMD.

# first, create a named pipe that we'll use to combine all the
# stdout output we want to show in the docker logs
COMBINED_OUT_FIFO="/var/combined-stdout"
mkfifo ${COMBINED_OUT_FIFO}

# capture the log with a long-running tail process
# so it gets interleaved into the output from the CMD.
# the log we output will depend on the 
is_in_role "controller" && ( tail -f /var/log/slurmctld.log > ${COMBINED_OUT_FIFO} ) &
is_in_role "worker" && ( tail -f /var/log/slurmd.log > ${COMBINED_OUT_FIFO} ) &

# run the container CMD (just sleeping forever by default), writing it
# to the combined out
( exec "$@" > ${COMBINED_OUT_FIFO} ) &

# tail the combined stdout log forever
cat ${COMBINED_OUT_FIFO}
