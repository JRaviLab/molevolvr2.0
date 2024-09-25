# from https://bun.sh/guides/ecosystem/docker, with modifications
# to run a hot-reloading development server

# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app


# -----------------------------------------------------------
# install dependencies for dev and prod into temp directories
FROM base AS install

COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev/ && \
    bun install --frozen-lockfile

# FA: the production-only install is currently commented out since we always
# require the dev dependencies, specifically vite, to run *or* build the app.
# i'm leaving it here because perhaps someday we'll think of a reason why we
# want just the production dependencies.

# # install with --production (exclude devDependencies)
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && \
#     bun install --frozen-lockfile --production

# -----------------------------------------------------------
# copy node_modules from dev stage, copy entire app
# source into the image
FROM base AS dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
# run the app in hot-reloading development mode
# set up vite to accept connections on any interface, e.g. from outside the
# container, and to always run on port 5713)
CMD [ "vite", "--host", "--port", "5713" ]


# -----------------------------------------------------------
# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# produce a bundle that'll then be served via a reverse http proxy, e.g. nginx
# (you'll want /app/dist to be mapped to a volume that's served by the reverse
# http proxy)
CMD [ "vite", "build" ]
 