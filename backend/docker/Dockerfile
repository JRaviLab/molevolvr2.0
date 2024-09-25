# syntax=docker/dockerfile:1.7

# this Dockerfile should be used with the ./backend/ folder as the context
# and ./backend/docker/Dockerfile as the dockerfile

ARG PRIOR_LAYER=backend-base

# -----------------------------------------------------------------------------
# --- basic backend
# -----------------------------------------------------------------------------

FROM rocker/tidyverse:4.3 AS backend-base

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

# -----------------------------------------------------------------------------
# --- backend w/slurm support
# -----------------------------------------------------------------------------

FROM backend-base AS backend-slurm

# install a more capable envsubst drop-in replacement, i.e. that supports
# default values. we use this to generate the actual slurm.conf and other config
# files from templates in the entrypoint script
RUN curl -L -o envsubst \
    "https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-$( uname -s )-$( uname -m )" && \
    chmod +x envsubst && \
    mv envsubst /usr/local/bin

# install slurm client, munge, so we can submit jobs
# NOTE: we would ordinarily install it as a package since it's dramatically
# faster than building from source, but the slurm included in our version of
# ubuntu is *very* old, and the backport sources weren't working for me. leaving
# this here in case we do find a way to install it via apt.
# RUN apt-get install -y slurm-client

# ------

# set up munge user, because the package will create it with the wrong UID if
# it doesn't already exist
ENV MUNGE_UID=981
RUN groupadd -g $MUNGE_UID munge \
    && useradd  -m -c "MUNGE Uid 'N' Gid Emporium" -d /var/lib/munge -u $MUNGE_UID -g munge  -s /sbin/nologin munge

# just do one apt update rather than one per package
RUN apt-get update

# install the following deps for slurm functions:
# - munge + libmunge: an authentication broker that slurm uses to verify cluster
#   entities
# - lua + liblua: so we can run lua scripts in slurm
# - http-parser, json-c, yaml, jwt: build requirements for slurmrestd (yaml,
#   jwt add extra funcs)
# - mailutils: adds /bin/mail, so slurm can send notices via email
# - hwloc, libbpf-dev, libdbus-1-dev: enables cgroup support in slurm
# - libpam0g-dev: support for PAM (pluggable auth modules)
# - libreadline-dev: adds readline support to slurm commands
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y \
    munge libmunge-dev \
    lua5.4 liblua5.4-dev \
    libhttp-parser-dev libjson-c-dev libyaml-dev libjwt-dev \
    mailutils \
    hwloc libhwloc-dev \
    libmariadb-dev \
    libbpf-dev libdbus-1-dev \
    libpam0g-dev \
    libreadline-dev

# ----------------------
# slurm 24.05.1 from source
# ----------------------

# let's try installing slurm from source
RUN apt-get install -y wget gcc make bzip2 \
    && cd /tmp \
    && wget https://download.schedmd.com/slurm/slurm-24.05.1.tar.bz2 \
    && tar -xvf slurm-24.05.1.tar.bz2 \
    && cd slurm-24.05.1 \
    && ./configure \
        --sysconfdir=/etc/slurm/ \
        --enable-slurmd=no --enable-controller=no \
    && make && make install

# ------

# copy slurm config into the image
COPY ./cluster_config/slurm.conf.template /opt/config-templates/slurm.conf.template
RUN mkdir -p /etc/slurm/

# instructs the entrypoint to enable slurm
ENV USE_SLURM=1


# -----------------------------------------------------------------------------
# --- final backend layer: brings in app code, sets up entrypoint
# -----------------------------------------------------------------------------

FROM ${PRIOR_LAYER} AS backend-final

WORKDIR /app

# copy the app into the image
COPY . /app

# run the app
CMD ["/app/launch_api.sh"]
