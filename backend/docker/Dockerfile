# syntax=docker/dockerfile:1.7

# this Dockerfile should be used with the ./backend/ folder as the context
# and ./backend/docker/Dockerfile as the dockerfile

FROM rocker/tidyverse:4.3

# install ccache, a compiler cache
RUN apt-get update && apt-get install -y ccache

# install some common cmd line tools
RUN apt-get update && apt-get install -y curl

# acquire drip, a plumber auto-reloader, and install
ENV DRIP_URL="https://rdrip.netlify.app/builds/drip_0.1.0_linux_amd64.zip"
RUN mkdir -p /tmp/software/ && \
    wget -L -O /tmp/software/drip.zip ${DRIP_URL} && \
    unzip /tmp/software/drip.zip -d /tmp/software && \
    mv /tmp/software/drip /usr/local/bin && \
    chmod +x /usr/local/bin/drip

# acquire atlas, a schema manager
RUN curl -sSf https://atlasgo.sh | sh

# configure ccache env vars
ENV PATH="/usr/lib/ccache:${PATH}"
ENV CCACHE_DIR="/tmp/ccache"

# install dependencies into the image
COPY ./docker/install.R /tmp/install.r
RUN   Rscript /tmp/install.r

# RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
#     Rscript /tmp/install.r

WORKDIR /app

# copy the app into the image
COPY . /app

# run the app
CMD ["/app/launch_api.sh"]
