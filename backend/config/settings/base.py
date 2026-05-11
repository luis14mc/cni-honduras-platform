"""
Base Django settings shared by all environments.

Environment variables are loaded with django-environ from ``backend/.env`` when present,
so Docker and local installs stay aligned with ``.env.example``.
"""

from pathlib import Path

import environ


BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()

_env_file = BASE_DIR / ".env"
if _env_file.exists():
    environ.Env.read_env(_env_file)

SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="unsafe-dev-only-change-me-in-.env",
)
DEBUG = env.bool("DJANGO_DEBUG", default=False)

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1"],
)

ENABLE_GIS = env.bool("DJANGO_ENABLE_GIS", default=True)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    *(["django.contrib.gis"] if ENABLE_GIS else []),
    # Third party
    "rest_framework",
    "corsheaders",
    # Local
    "apps.core",
    "apps.users",
    "apps.cms",
    "apps.geo",
    "apps.investment",
    "apps.media_library",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# PostGIS is the target DB. If Geo stack isn't ready on Windows yet, a TEMPORARY
# fallback is allowed for development by setting DJANGO_ENABLE_GIS=False.
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        engine=(
            "django.contrib.gis.db.backends.postgis"
            if ENABLE_GIS
            else "django.db.backends.postgresql"
        ),
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = env("DJANGO_LANGUAGE_CODE", default="es-hn")
TIME_ZONE = env("DJANGO_TIME_ZONE", default="America/Tegucigalpa")
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STATIC_URL = env("DJANGO_STATIC_URL", default="/static/")
STATIC_ROOT = BASE_DIR / env.path("DJANGO_STATIC_ROOT_REL", default="staticfiles")

_static_dir = BASE_DIR / "static"
STATICFILES_DIRS = [_static_dir] if _static_dir.is_dir() else []

MEDIA_URL = env("DJANGO_MEDIA_URL", default="/media/")
MEDIA_ROOT = BASE_DIR / env.path("DJANGO_MEDIA_ROOT_REL", default="media")

# GeoDjango on Windows/OSGeo: set DLL paths (optional — Linux/Docker normally find GDAL/GEOS in PATH).
_gdal_lib = env.str("DJANGO_GDAL_LIBRARY_PATH", default="").strip()
if _gdal_lib:
    GDAL_LIBRARY_PATH = _gdal_lib
_geos_lib = env.str("DJANGO_GEOS_LIBRARY_PATH", default="").strip()
if _geos_lib:
    GEOS_LIBRARY_PATH = _geos_lib

CSRF_TRUSTED_ORIGINS = env.list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)

CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=True)

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
