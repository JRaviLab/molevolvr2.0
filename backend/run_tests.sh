#!/bin/bash

# INSTRUCTIONS: run this script from within the backend container to recursively
# descend into each subdirectory of tests/testthat to run tests.
# it's expected to run into error messages like 'rlang::abort("No test files
# found")' when there aren't any tests to run in the target directory.

# set some colors and styles
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
WHITE='\033[1;37m'
GRAY='\033[1;30m'
BOLD='\033[1m'

# testthat::test_dir() does not recurse into subdirectories,
# since R packages can't contain subdirectories in their
# R/ folder anyway (?!)

# since we want our tests to mirror the structure of our code,
# and our code is organized into subdirectories, we'll recursively
# descend into each subdirectory and run tests there

trap "echo 'Exited test harness via interrupt'; exit;" SIGINT SIGTERM

function run_test_in_dir() {
  dir=$1
  echo -e "${GRAY}* Running tests in ${WHITE}${BOLD}$dir${GRAY}...${NC}"
  Rscript -e "testthat::test_dir('$dir')"
  echo ""
}

# if we're given a specific directory to test, only test that directory
if [ $# -eq 1 ]; then
  # run tests in the specified directory
  run_test_in_dir $1
  # and exit right after
  exit 0
fi

# find all directories in tests/testthat, including tests/testthat itself
for dir in $( find /app/api/tests/testthat -type d ); do
  # if the folder contains no R files, skip it
  if [ $(ls -1 $dir/*.R 2>/dev/null | wc -l) -eq 0 ]; then
    # echo -e "${WHITE}${BOLD}$dir${RED} contains no R files, continuing...${NC}"
    continue
  fi

  # run tests in each directory
  run_test_in_dir $dir
done
