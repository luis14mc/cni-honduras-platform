"""Media storage configuration (local filesystem vs S3-compatible object storage)."""

from __future__ import annotations

from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from environ import Env

S3_REQUIRED_ENV_VARS = (
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_STORAGE_BUCKET_NAME",
    "AWS_S3_ENDPOINT_URL",
    "AWS_S3_REGION_NAME",
)


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

    validate_s3_storage_env(env)

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
    if not use_s3_storage(env):
        return media_url

    custom_domain = env.str("AWS_S3_CUSTOM_DOMAIN", default="").strip()
    if custom_domain:
        return f"https://{custom_domain.rstrip('/')}/"

    endpoint = env.str("AWS_S3_ENDPOINT_URL", default="").strip().rstrip("/")
    bucket = env.str("AWS_STORAGE_BUCKET_NAME", default="").strip()
    if endpoint and bucket:
        return f"{endpoint}/{bucket}/media/"

    return media_url


def configure_media_storage(env: Env, base_dir: Path) -> dict:
    media_root = base_dir / env.path("DJANGO_MEDIA_ROOT_REL", default="media")
    media_url = env.str("DJANGO_MEDIA_URL", default="/media/")

    return {
        "STORAGES": build_storages(env, media_root=media_root, media_url=media_url),
        "MEDIA_ROOT": media_root,
        "MEDIA_URL": resolve_media_url(env, media_url=media_url),
    }
