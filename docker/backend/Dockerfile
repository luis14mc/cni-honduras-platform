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

COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt

COPY . .

# Run entrypoint or gunicorn in production
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
