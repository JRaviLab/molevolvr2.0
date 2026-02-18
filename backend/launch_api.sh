#!/usr/bin/env bash

cd /app/src/

# ensure we're up to date on migrations
echo "* Applying database migrations"
./manage.py migrate

# create the admin user if it doesn't exist
echo "* Creating superuser account if it doesn't exist"
DJANGO_SUPERUSER_PASSWORD="${DJANGO_ADMIN_PASSWORD}" \
./manage.py createsuperuser \
    --username "${DJANGO_ADMIN_USER}" \
    --email "${DJANGO_ADMIN_EMAIL}" \
    --noinput || true

# collect static files
echo "* Collecting static files"
./manage.py collectstatic --noinput

# launch the server
if [ "$DJANGO_DEBUG" = "1" ] ; then
    echo "* Serving via django runserver (debug mode)"
    ./manage.py runserver 0.0.0.0:8000
else
    echo "* Serving via gunicorn (production mode)"
    gunicorn molevolvr.wsgi:application --bind 0.0.0.0:8000 --workers 3
fi
