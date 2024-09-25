#!/usr/bin/env bash

# this script is included as a simple example of a job that could be run in the cluster;
# including it in the repo just saves me from having to create it.

# the folder is currently mapped into the slurm controller and worker nodes
# at the path /opt/test-jobs/

# TBC: perhaps use this as a test of whether the cluster can complete jobs?

echo "Hello from $( hostname ) at $( date )"
