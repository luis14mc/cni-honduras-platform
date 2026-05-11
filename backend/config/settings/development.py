"""Local development defaults (loaded via ``DJANGO_SETTINGS_MODULE`` from ``manage.py``)."""

from .base import *  # noqa: F401,F403

DEBUG = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
