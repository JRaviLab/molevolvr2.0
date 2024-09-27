#!/usr/bin/env bash


# ===========================================================================
# === user-overiddeable variables
# ===========================================================================

# if 1, skips pulling images for the target environment before running
SKIP_PULL=${SKIP_PULL:-0}

# if 1, skips building images for the target environment before running
SKIP_BUILD=${SKIP_BUILD:-0}

# if 1, opens the browser window to the app after launching the stack
DO_OPEN_BROWSER=${DO_OPEN_BROWSER:-1}

# the URL to open when we invoke the browser
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:5173"}


# ===========================================================================
# === helpers
# ===========================================================================

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
# === target env resolution and other env/cmd setup for launching the stack
# ===========================================================================

# if 1, clears the screen before running the post-launch command
DO_CLEAR="0"
# command to run after the stack has launched
POST_LAUNCH_CMD=":"

# source the .env file and export its contents
# among other things, we'll use the DEFAULT_ENV var in it to set the target env
set -a
source .env
set +a

# check if the first argument is a valid target env, and if not attempt
# to infer it
case $1 in
    "prod"|"dev")
        TARGET_ENV=$1
        shift
        echo "* Selected target environment: ${TARGET_ENV}"
        ;;
    *)
        # resolve the target env
        HOSTNAME=$(hostname)
        
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
        COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.slurm.yml -f docker-compose.prod.yml"
        DO_CLEAR="0"
        # never launch the browser in production
        DO_OPEN_BROWSER=0
        # watch the logs after, since we detached after bringing up the stack
        POST_LAUNCH_CMD="${COMPOSE_CMD} logs -f"
        ;;
    "dev")
        DEFAULT_ARGS="up -d"
        COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.slurm.yml -f docker-compose.dev.yml"
        DO_CLEAR="1"
        # watch the logs after, since we detached after bringing up the stack
        POST_LAUNCH_CMD="${COMPOSE_CMD} logs -f"
        ;;
    *)
        echo "ERROR: Unknown target environment: ${TARGET_ENV}"
        exit 1
esac


# vars that configure (and thus need to be visible to) docker-compose and other
# child processes
export TARGET_ENV=${TARGET_ENV}
export REGISTRY_PREFIX=${REGISTRY_PREFIX}
export IMAGE_TAG=$( [[ ${TARGET_ENV} = "prod" ]] && echo "latest" || echo ${TARGET_ENV} )

# image build controls:
# makes compose use the regular docker cli build command
export COMPOSE_DOCKER_CLI_BUILD=1
# makes docker use buildkit rather than the legacy build system
export DOCKER_BUILDKIT=1


# ===========================================================================
# === final argument processing, stack launch
# ===========================================================================

# if any arguments were specified after the target env, use those instead of the default
if [ $# -gt 0 ]; then
  DEFAULT_ARGS="$@"
  DO_CLEAR="0" # don't clear so we can see the output
fi

# check if a "control" command is the current first argument; if so, skip the build
if [[ "$1" =~ ^(down|restart|logs|build|pull|push|shell)$ ]]; then
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

# before building, attempt to pull the images for the target env
# the images now include the build cache, which should make rebuilding
# the final layers quick.
if [ "${SKIP_PULL}" != "1" ]; then
    echo "* Pulling images for ${TARGET_ENV} (tag: ${IMAGE_TAG})"
    ${COMPOSE_CMD} pull || fatal "Failed to pull images for ${TARGET_ENV}"
fi

# if SKIP_BUILD is 0 and we're not running a control command, build images for
# the target env.
# each built image is tagged with its target env, so they don't collide with
# each other; in the case of prod, the tag is "latest".
if [ "${SKIP_BUILD}" != "1" ]; then
    echo "* Building images for ${TARGET_ENV} (tag: ${IMAGE_TAG})"
    ${COMPOSE_CMD} build || fatal "Failed to build images for ${TARGET_ENV}"
fi

echo "Running: ${COMPOSE_CMD} ${DEFAULT_ARGS}"
${COMPOSE_CMD} ${DEFAULT_ARGS} && \
( [[ ${DO_CLEAR} = "1" ]] && clear || exit 0 ) && \
(
    [[ ${DO_OPEN_BROWSER} = "1" ]] \
        && open_browser "${FRONTEND_URL}" \
        || exit 0
) && \
${POST_LAUNCH_CMD}
