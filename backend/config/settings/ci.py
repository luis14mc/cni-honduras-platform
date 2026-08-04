"""
Isolated settings for GitHub Actions and other CI runners.

Uses the ephemeral PostGIS service container — never Neon or local .env secrets.
"""

import os

from .base import *  # noqa: F401,F403

DEBUG = False
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "ci-only-not-for-production")
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

ENABLE_GIS = True

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.environ.get("POSTGRES_DB", "cni_test"),
        "USER": os.environ.get("POSTGRES_USER", "cni"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "cni"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
