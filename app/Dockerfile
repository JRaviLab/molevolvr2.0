# from https://bun.sh/guides/ecosystem/docker, with modifications
# to run a hot-reloading development server

# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app


# -----------------------------------------------------------
# install dependencies for dev and prod into temp directories
# this will cache them and speed up future builds
FROM base AS install

COPY package.json bun.lockb /temp/dev/
RUN --mount=type=cache,target=/tmp/bun \
    cd /temp/dev/ && \
    bun install --cache-dir /tmp/bun --frozen-lockfile

# install with --production (exclude devDependencies)
COPY package.json bun.lockb /temp/prod/
RUN --mount=type=cache,target=/tmp/bun \
    cd /temp/prod && \
    bun install --cache-dir /tmp/bun --frozen-lockfile --production


# -----------------------------------------------------------
# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build


# -----------------------------------------------------------
# copy node_modules from dev stage, copy entire app
# source into the image
FROM base AS dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
# run the app in hot-reloading development mode
# (this requires a new script, container-dev, in package.json that sets up vite
# to accept connections on any interface, e.g. from outside the container, and
# to always run on port 5713)
CMD ["bun", "run", "container-dev"]


# -----------------------------------------------------------
# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/main.tsx .
COPY --from=prerelease /app/package.json .

# run the app in production mode
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "main.ts" ]
