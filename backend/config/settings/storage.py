"""Media storage configuration (local filesystem vs S3-compatible object storage).

Provider-agnostic: works with AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces,
or any django-storages S3 backend. Selection is env-driven only — never by hostname
(Render, Vercel, etc.).
"""

from __future__ import annotations

import logging
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from environ import Env

logger = logging.getLogger("cni.media")

S3_REQUIRED_ENV_VARS = (
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_STORAGE_BUCKET_NAME",
    "AWS_S3_ENDPOINT_URL",
    "AWS_S3_REGION_NAME",
)

# AWS_* names come from django-storages conventions; the provider need not be AWS.


def use_s3_storage(env: Env) -> bool:
    return env.bool("USE_S3_STORAGE", default=False)


def validate_s3_storage_env(env: Env) -> None:
    missing = [
        name
        for name in S3_REQUIRED_ENV_VARS
        if not env.str(name, default="").strip()
    ]
    if missing:
        raise ImproperlyConfigured(
            "USE_S3_STORAGE is enabled but required environment variables are "
            f"missing: {', '.join(missing)}"
        )


def validate_s3_storage_config(env: Env) -> None:
    validate_s3_storage_env(env)


def warn_ephemeral_filesystem_storage(*, debug: bool, use_s3: bool) -> None:
    """Warn when non-local (DEBUG=false) still uses ephemeral FileSystemStorage."""
    if debug or use_s3:
        return
    logger.warning(
        "DEBUG is false but USE_S3_STORAGE is false: FileSystemStorage is ephemeral "
        "on most PaaS hosts. For staging/production set USE_S3_STORAGE=true with "
        "S3-compatible credentials (AWS_* env vars via django-storages)."
    )


def build_storages(env: Env, *, media_root: Path, media_url: str) -> dict:
    staticfiles_backend = "django.contrib.staticfiles.storage.StaticFilesStorage"

    if not use_s3_storage(env):
        return {
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
                "OPTIONS": {
                    "location": str(media_root),
                    "base_url": media_url,
                },
            },
            "staticfiles": {
                "BACKEND": staticfiles_backend,
            },
        }

    validate_s3_storage_config(env)

    options: dict = {
        "access_key": env("AWS_ACCESS_KEY_ID"),
        "secret_key": env("AWS_SECRET_ACCESS_KEY"),
        "bucket_name": env("AWS_STORAGE_BUCKET_NAME"),
        "endpoint_url": env("AWS_S3_ENDPOINT_URL"),
        "region_name": env("AWS_S3_REGION_NAME"),
        "location": "media",
        "querystring_auth": env.bool("AWS_QUERYSTRING_AUTH", default=False),
        "file_overwrite": env.bool("AWS_S3_FILE_OVERWRITE", default=False),
        "url_protocol": "https:",
    }

    custom_domain = env.str("AWS_S3_CUSTOM_DOMAIN", default="").strip()
    if custom_domain:
        options["custom_domain"] = custom_domain

    addressing_style = env.str("AWS_S3_ADDRESSING_STYLE", default="").strip()
    if addressing_style:
        options["addressing_style"] = addressing_style

    default_acl = env.str("AWS_DEFAULT_ACL", default="").strip()
    options["default_acl"] = default_acl or None

    return {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": options,
        },
        "staticfiles": {
            "BACKEND": staticfiles_backend,
        },
    }


def resolve_media_url(env: Env, *, media_url: str) -> str:
    """Public MEDIA_URL base for the active storage backend.

    Priority when USE_S3_STORAGE=true:
    1. AWS_S3_CUSTOM_DOMAIN (CDN / public bucket domain) → https://domain/
    2. AWS_QUERYSTRING_AUTH=true → keep DJANGO_MEDIA_URL; django-storages signs .url
    3. Else endpoint + bucket path-style public base (only if the endpoint serves reads)
    """
    if not use_s3_storage(env):
        return media_url

    validate_s3_storage_config(env)

    custom_domain = env.str("AWS_S3_CUSTOM_DOMAIN", default="").strip()
    if custom_domain:
        return f"https://{custom_domain.rstrip('/')}/"

    if env.bool("AWS_QUERYSTRING_AUTH", default=False):
        # Signed object URLs are absolute per file; MEDIA_URL remains a relative base.
        return media_url

    endpoint = env.str("AWS_S3_ENDPOINT_URL", default="").strip().rstrip("/")
    bucket = env.str("AWS_STORAGE_BUCKET_NAME", default="").strip()
    if endpoint and bucket:
        return f"{endpoint}/{bucket}/media/"

    return media_url


def configure_media_storage(env: Env, base_dir: Path) -> dict:
    media_root = base_dir / env.path("DJANGO_MEDIA_ROOT_REL", default="media")
    media_url = env.str("DJANGO_MEDIA_URL", default="/media/")
    use_s3 = use_s3_storage(env)
    debug = env.bool("DJANGO_DEBUG", default=False)

    warn_ephemeral_filesystem_storage(debug=debug, use_s3=use_s3)

    return {
        "STORAGES": build_storages(env, media_root=media_root, media_url=media_url),
        "MEDIA_ROOT": media_root,
        "MEDIA_URL": resolve_media_url(env, media_url=media_url),
        "USE_S3_STORAGE": use_s3,
    }
