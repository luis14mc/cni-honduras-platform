FROM python:3.11-slim

# Install system dependencies for PostGIS/GeoDjango
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    python3-gdal \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt

COPY backend/ .

RUN chmod +x scripts/start.sh

ENV DJANGO_SETTINGS_MODULE=config.settings.production
ENV DATABASE_URL=sqlite:////tmp/collectstatic.db
ENV DJANGO_SECRET_KEY=build-collectstatic-only-not-for-runtime
RUN python manage.py collectstatic --noinput

CMD ["./scripts/start.sh"]
