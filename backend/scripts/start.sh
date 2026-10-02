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

echo "Synchronizing territorial regions (macro/sub/polo)..."
python manage.py import_territorial_regions || echo "WARN: import_territorial_regions falló; el servidor arranca igual"

echo "Synchronizing road corridors (OSM)..."
python manage.py import_road_corridors || echo "WARN: import_road_corridors falló; el servidor arranca igual"

# Carga editorial del portafolio CNI (17 oportunidades + 25 proyectos con imágenes).
# Activar UNA vez con IMPORT_PORTAFOLIO_CNI=true en Render; después quitar la variable
# para que los cambios hechos por el CNI en el admin no se sobrescriban en cada deploy.
if [[ "${IMPORT_PORTAFOLIO_CNI:-false}" == "true" ]]; then
  echo "Importing CNI portfolio (opportunities + project sheets)..."
  python manage.py import_portafolio_cni || echo "WARN: import_portafolio_cni falló; el servidor arranca igual"
fi

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
