FROM postgres:17

# copy initialization, post-init scripts
COPY ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/
COPY ./docker-entrypoint-postinit.d/ /docker-entrypoint-postinit.d/

RUN chmod ugo+rx \
    /docker-entrypoint-initdb.d/* \
    /docker-entrypoint-postinit.d/*

# copy patched entrypoint scripts, healthcheck script
COPY patched-docker-entrypoint-17.sh /usr/local/bin/docker-entrypoint.sh
COPY ./healthcheck.sh /opt/healthcheck.sh

RUN chmod ugo+rx \
    /usr/local/bin/docker-entrypoint.sh \
    /opt/healthcheck.sh
