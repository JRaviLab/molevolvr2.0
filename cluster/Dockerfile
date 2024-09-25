# FROM --platform=linux/amd64 ubuntu:24.04
FROM --platform=linux/amd64 rocker/tidyverse:4.3 AS slurm-build


# ============================================================================
# === slurm preamble: set up users, get dependencies
# ============================================================================

# --- user setup, used by munge and slurm packages
# set up user IDs consistently across runs
ENV MUNGE_UID=981 \
    SLURM_UID=982 \
    WORKER_UID=1005
RUN groupadd -g $MUNGE_UID munge \
  && useradd  -m -c "MUNGE Uid 'N' Gid Emporium" -d /var/lib/munge -u $MUNGE_UID -g munge  -s /sbin/nologin munge \
  && groupadd -g $SLURM_UID slurm \
  && useradd  -m -c "Slurm workload manager" -d /var/lib/slurm -u $SLURM_UID -g slurm  -s /bin/bash slurm \
  && groupadd -g $WORKER_UID worker \
  && useradd  -m -c "Workflow user" -d /home/worker -u $WORKER_UID -g worker  -s /bin/bash worker

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


# ============================================================================
# === build and install slurm
# ============================================================================

# ----------------------
# option 1: slurm 24.05.1 from source
# ----------------------

# let's try installing slurm from source
RUN apt-get install -y wget gcc make bzip2 \
    && cd /tmp \
    && wget https://download.schedmd.com/slurm/slurm-24.05.1.tar.bz2 \
    && tar -xvf slurm-24.05.1.tar.bz2 \
    && cd slurm-24.05.1 \
    && ./configure \
        --with-lua \
        --sysconfdir=/etc/slurm/ \
        --with-systemdsystemunitdir=/usr/lib/systemd/system/ \
    && make && make install

# ----------------------
# option 2: slurm 21.08.5 from apt
# ----------------------

# install slurm from apt
# RUN apt-get install -y slurm-wlm slurmctld slurmd slurmdbd slurmrestd


# ============================================================================
# === install app-level dependencies, e.g. R libraries, other tools
# ============================================================================

# install dependencies into the image
COPY ./install.R /tmp/install.r
RUN   Rscript /tmp/install.r

# add curl, a useful tool for downloading stuff
# add a helper tool, 'stress', for putting load on the cluster
# docs: https://linux.die.net/man/1/stress
# add a helper tool suite, cgroup-tools, to retrieve container
# resource allocation info within the container
RUN apt-get update && apt-get install -y curl stress cgroup-tools cron

# install a more capable envsubst drop-in replacement, i.e. that supports
# default values. we use this to generate the actual slurm.conf and other config
# files from templates in the entrypoint script
RUN curl -L -o envsubst \
    "https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-$( uname -s )-$( uname -m )" && \
    chmod +x envsubst && \
    mv envsubst /usr/local/bin


# ============================================================================
# === bring in configuration, init scripts; setup entrypoint
# ============================================================================

# copy in templates for configuration files
# these will be interpolated with env vars by entrypoint.sh
COPY ./slurm-config/ /opt/templates/

# # move init scripts from /tmp/slurm-24.05.1/etc/init.d.<service> to /etc/init.d/
# # and make them executable
# RUN cp /tmp/slurm-24.05.1/etc/init.d.slurm /etc/init.d/slurm && \
#     cp /tmp/slurm-24.05.1/etc/init.d.slurmdbd /etc/init.d/slurmdbd && \
#     chmod +x /etc/init.d/slurm*

# copy in system v init scripts, defaults
COPY ./system-v/init.d/ /etc/init.d/
COPY ./system-v/default/ /etc/default/

# make folders slurm expects to see
RUN mkdir -p /var/spool/slurmd /var/spool/slurmctld

# copy in the entrypoint script and supporting scripts,
# then define it as the entrypoint
COPY ./entrypoint/ /var/slurm-init/
ENTRYPOINT ["/var/slurm-init/entrypoint.sh"]

# and keep the container running forever
CMD /bin/bash -c "trap : TERM INT; sleep infinity & wait"

# ----------------------
# --- slurm-controller stage
# ----------------------

FROM slurm-build AS slurm-controller
