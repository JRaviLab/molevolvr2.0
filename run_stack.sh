#!/usr/bin/env bash

# NOTES:
# -------
# This script launches the molevolvr stack in the specified target environment.
# It's invoked as ./run_stack [target_env] [docker-compose args]; if
# [target_env] is not specified, it will attempt to infer it from the repo's
# directory name, and aborts with an error message if it doesn't find a match.
# the remainder of the arguments are passed along to docker compose.
#
# for example, to launch the stack in the "prod" environment with the "up -d"
# command, you would run: ./run_stack prod up -d
#
# the available environments differ in a variety of ways, including:
# - which services they run (prod runs 'nginx', for example, but the dev-y envs
#   don't)
# - cores and memory constraints that are applied to the SLURM containers, in
#   environments where the job scheduler is enabled
# - what external resources they mount as volumes into the container; for
#   example, each environment mounts a different job results folder, but
#   environments that process jobs use the same blast and iprscan folders, since
#   they're gigantic
#
# these differences between environments are implemented by invoking different
# sets of docker-compose.yml files. with the exception of the "app" environment,
# the "root" compose file, docker-compose.yml, is always used first, and then
# depending on the environment other compose files are added in, which merge
# with the root compose configuration. since the app environment only runs the
# app, it has a separate compose file, docker-compose.apponly.yml, rather than
# merging with the root and killing nearly all the services except the app
# service.
#
# see the following for details on the semantics of merging compose files:
# https://docs.docker.com/compose/multiple-compose-files/merge/
#
# the current environments are as follows (contact FSA for details):
# - prod: the production environment, which runs the full stack, including the
#   web app, the job scheduler, and the accounting database. it's the most
#   resource-intensive environment, and is intended for use in production.
# - dev/staging: these are effectively dev environments that specific users run
#   on the server for testing purposes.
# - app: a development environment that runs only the frontend and backend, and
#   not the job scheduler or the accounting database. it's intended for use in
#   frontend development, where you don't need to submit jobs or query the
#   accounting database.


# if 1, skips invoking ./build_images.sh before running the stack
SKIP_BUILD=${SKIP_BUILD:-0}

# command to run after the stack has launched, e.g.
# in cases where you want to tail some containers after launch
# (by default, it does nothing)
POST_LAUNCH_CMD=":"
# if 1, clears the screen before running the post-launch command
DO_CLEAR="0"
# if 1, opens the browser window to the app after launching the stack
DO_OPEN_BROWSER=${DO_OPEN_BROWSER:-1}

# the URL to open when we invoke the browser
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:5713"}

# helper function to print a message and exit with a specific code
# in one command
function fatal() {
    echo "${1:-fatal error, aborting}"
    exit ${2:-1}
}

# cross-platform helper function to open a browser window
function open_browser() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$1"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open "$1"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        start "$1"
    else
        echo "WARNING: Unsupported OS: $OSTYPE, unable to open browser"
    fi
}

# ===========================================================================
# === entrypoint
# ===========================================================================

# source the .env file and export its contents
# among other things, we'll use the DEFAULT_ENV var in it to set the target env
set -a
source .env
set +a

# check if the first argument is a valid target env, and if not attempt
# to infer it from the script's parents' directory name
case $1 in
    "prod"|"staging"|"dev"|"app")
        TARGET_ENV=$1
        shift
        echo "* Selected target environment: ${TARGET_ENV}"
        ;;
    *)
        # attempt to resolve the target env from the host environment
        # (e.g., the hostname, possibly the repo root directory name, etc.)

        # get the name of the script's parent directory
        PARENT_DIR=$(basename $(dirname $(realpath $0)))
        HOSTNAME=$(hostname)

        # check if the parent directory name contains a valid target env
        if [[ "${HOSTNAME}" = "jravilab" ]]; then
            TARGET_ENV="prod"
            STRATEGY="via hostname ${HOSTNAME}"
        elif [[ ! -z "${DEFAULT_ENV}" ]]; then
            TARGET_ENV="${DEFAULT_ENV}"
            STRATEGY="via DEFAULT_ENV"
        else
            echo -e \
                "ERROR: No valid target env specified, and could not infer" \
                "target environment from parent directory name:\n${PARENT_DIR}"
            exit 1
        fi

        echo "* Inferred target environment: ${TARGET_ENV} (${STRATEGY:-n/a})"
esac

case ${TARGET_ENV} in
    "prod")
        DEFAULT_ARGS="up -d"
        COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
        DO_CLEAR="0"
        # never launch the browser in production
        DO_OPEN_BROWSER=0
        # watch the logs after, since we detached after bringing up the stack
        POST_LAUNCH_CMD="${COMPOSE_CMD} logs -f"
        ;;
    "dev")
        DEFAULT_ARGS="up -d"
        COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.override.yml"
        DO_CLEAR="1"
        # watch the logs after, since we detached after bringing up the stack
        POST_LAUNCH_CMD="${COMPOSE_CMD} logs -f"
        ;;
    *)
        echo "ERROR: Unknown target environment: ${TARGET_ENV}"
        exit 1
esac

# ensure that docker compose can see the target env, so it can, e.g., namespace hosts to their environment
export TARGET_ENV=${TARGET_ENV}

# if any arguments were specified after the target env, use those instead of the default
if [ $# -gt 0 ]; then
  DEFAULT_ARGS="$@"
  DO_CLEAR="0" # don't clear so we can see the output
fi

# check if a "control" command is the current first argument; if so, skip the build
if [[ "$1" =~ ^(down|restart|logs|build|shell)$ ]]; then
    echo "* Skipping build, since we're running a control command: $1"
    SKIP_BUILD=1
    # also skip the post-launch command so we don't get stuck, e.g., tailing
    POST_LAUNCH_CMD=""
    # also skip opening a browser window
    DO_OPEN_BROWSER=0

    # if it's the shell command, also change COMPOSE_CMD to launch a shell instead
    if [ "$1" == "shell" ]; then
        DEFAULT_ARGS="exec backend /bin/bash"
    fi
fi

# if SKIP_BUILD is 0 and 'down' isn't the docker compose command, build images
# for the target env.
# each built image is tagged with its target env, so they don't collide with
# each other; in the case of prod, the tag is "latest".
if [ "${SKIP_BUILD}" -eq 0 ]; then
    if [ "${TARGET_ENV}" == "prod" ] || [ "${TARGET_ENV}" == "app" ]; then
        IMAGE_TAG="latest"
    else
        IMAGE_TAG="${TARGET_ENV}"
    fi

    echo "* Building images for ${TARGET_ENV} (tag: ${IMAGE_TAG})"
    # ./build_images.sh ${IMAGE_TAG} || fatal "Failed to build images for ${TARGET_ENV}"
    ${COMPOSE_CMD} build || fatal "Failed to build images for ${TARGET_ENV}"
fi

echo "Running: ${COMPOSE_CMD} ${DEFAULT_ARGS}"
${COMPOSE_CMD} ${DEFAULT_ARGS} && \
( [[ ${DO_CLEAR} = "1" ]] && clear || exit 0 ) && \
(
    [[ ${DO_OPEN_BROWSER} = "1" ]] \
        && open_browser "${FRONTEND_URL}" \
        || exit 0
) &&
${POST_LAUNCH_CMD}
