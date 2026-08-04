"""
Isolated settings for GitHub Actions and other CI runners.

Uses the ephemeral PostGIS service container — never Neon or local .env secrets.
"""

import os

_db = os.environ.get("POSTGRES_DB", "cni_test")
_user = os.environ.get("POSTGRES_USER", "cni")
_password = os.environ.get("POSTGRES_PASSWORD", "cni")
_host = os.environ.get("POSTGRES_HOST", "localhost")
_port = os.environ.get("POSTGRES_PORT", "5432")

os.environ.setdefault(
    "DATABASE_URL",
    f"postgis://{_user}:{_password}@{_host}:{_port}/{_db}",
)

from .base import *  # noqa: E402,F401,F403

DEBUG = False
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "ci-only-not-for-production")
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

ENABLE_GIS = True

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
