#!/usr/bin/env bash
set -Eeuo pipefail

if [ ! -f staticfiles/admin/css/base.css ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

echo "Applying database migrations..."
python manage.py migrate --noinput

# One-time geographic bootstrap for environments without an interactive shell.
# Enable for one deploy only, verify the counts, then remove the variable.
if [[ "${IMPORT_HONDURAS_GEO:-false}" == "true" ]]; then
  echo "Importing Honduras geographic boundaries..."
  python manage.py import_honduras_geo
fi

echo "Synchronizing strategic infrastructure..."
python manage.py import_strategic_infrastructure

# Temporary bootstrap only: set CREATE_DJANGO_SUPERUSER=true in Render for the first
# deploy/login, then remove it or set to false after confirming admin access.
if [[ "${CREATE_DJANGO_SUPERUSER:-false}" == "true" ]]; then
  echo "Ensuring Django superuser from environment..."
  python manage.py ensure_superuser
fi

echo "Synchronizing institutional links..."
python manage.py import_institutional_links

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
