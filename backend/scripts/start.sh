#!/usr/bin/env bash
set -e

if [ ! -f staticfiles/admin/css/base.css ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Synchronizing institutional links..."
python manage.py import_institutional_links

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
