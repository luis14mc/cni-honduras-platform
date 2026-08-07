"""Upload validation for CMS editorial media.

Blocks dangerous extensions and enforces a configurable size limit. Used by
the cms-admin media API — never trust client-side checks alone.
"""

from __future__ import annotations

import mimetypes
import os

from django.conf import settings
from django.core.exceptions import ValidationError

# Extensions that must never be accepted as editorial uploads.
BLOCKED_EXTENSIONS = frozenset(
    {
        "exe",
        "bat",
        "cmd",
        "com",
        "js",
        "html",
        "htm",
        "php",
        "phtml",
        "sh",
        "bash",
        "ps1",
        "vbs",
        "msi",
        "scr",
        "dll",
    }
)

ALLOWED_IMAGE_EXTENSIONS = frozenset({"jpg", "jpeg", "png", "gif", "webp", "svg"})
ALLOWED_DOCUMENT_EXTENSIONS = frozenset({"pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip"})
ALLOWED_VIDEO_EXTENSIONS = frozenset({"mp4", "webm", "mov"})

ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

DEFAULT_MAX_BYTES = 25 * 1024 * 1024  # 25 MB

# MIME types that must never be accepted regardless of filename.
BLOCKED_MIME_TYPES = frozenset(
    {
        "application/javascript",
        "application/x-javascript",
        "text/javascript",
        "text/html",
        "application/xhtml+xml",
        "application/x-msdownload",
        "application/vnd.microsoft.portable-executable",
        "application/x-msdos-program",
        "application/x-sh",
        "application/x-php",
        "text/x-php",
        "application/x-httpd-php",
    }
)

BLOCKED_MIME_PREFIXES = (
    "text/html",
    "application/javascript",
    "text/javascript",
)

# Acceptable MIME types per extension (browsers may vary slightly).
EXTENSION_MIME_MAP: dict[str, frozenset[str]] = {
    "jpg": frozenset({"image/jpeg", "image/pjpeg"}),
    "jpeg": frozenset({"image/jpeg", "image/pjpeg"}),
    "png": frozenset({"image/png"}),
    "gif": frozenset({"image/gif"}),
    "webp": frozenset({"image/webp"}),
    "svg": frozenset({"image/svg+xml"}),
    "pdf": frozenset({"application/pdf"}),
    "doc": frozenset({"application/msword"}),
    "docx": frozenset(
        {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    ),
    "xls": frozenset({"application/vnd.ms-excel"}),
    "xlsx": frozenset(
        {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
    ),
    "ppt": frozenset({"application/vnd.ms-powerpoint"}),
    "pptx": frozenset(
        {"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
    ),
    "zip": frozenset({"application/zip", "application/x-zip-compressed"}),
    "mp4": frozenset({"video/mp4"}),
    "webm": frozenset({"video/webm"}),
    "mov": frozenset({"video/quicktime"}),
}

# Common generic fallbacks browsers use for binary uploads.
GENERIC_MIME_FALLBACKS = frozenset(
    {
        "application/octet-stream",
        "binary/octet-stream",
    }
)


def max_upload_bytes() -> int:
    return int(getattr(settings, "CMS_MAX_UPLOAD_BYTES", DEFAULT_MAX_BYTES))


def _extension(name: str) -> str:
    return os.path.splitext(name or "")[1].lstrip(".").lower()


def _normalize_mime(content_type: str) -> str:
    return (content_type or "").split(";")[0].strip().lower()


def _validate_mime(name: str, ext: str, content_type: str) -> None:
    normalized = _normalize_mime(content_type)
    if not normalized:
        return

    if normalized in BLOCKED_MIME_TYPES:
        raise ValidationError("Tipo MIME no permitido para archivos editoriales.")
    if any(normalized.startswith(prefix) for prefix in BLOCKED_MIME_PREFIXES):
        raise ValidationError("Tipo MIME no permitido para archivos editoriales.")

    expected = EXTENSION_MIME_MAP.get(ext)
    if not expected:
        return

    if normalized in expected or normalized in GENERIC_MIME_FALLBACKS:
        return

    guessed, _ = mimetypes.guess_type(name)
    if guessed and _normalize_mime(guessed) in expected and normalized in GENERIC_MIME_FALLBACKS:
        return

    raise ValidationError(
        f"El tipo MIME «{normalized}» no es compatible con la extensión .{ext}."
    )


def validate_upload_file(uploaded_file) -> None:
    """Raise ``ValidationError`` when the upload is not allowed."""

    name = getattr(uploaded_file, "name", "") or ""
    ext = _extension(name)
    if not ext:
        raise ValidationError("El archivo debe tener una extensión reconocida.")
    if ext in BLOCKED_EXTENSIONS:
        raise ValidationError(f"Tipo de archivo no permitido: .{ext}")
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f"Extensión no permitida para la biblioteca: .{ext}")

    size = getattr(uploaded_file, "size", None)
    limit = max_upload_bytes()
    if size is not None and size > limit:
        raise ValidationError(
            f"El archivo excede el límite de {limit // (1024 * 1024)} MB."
        )

    content_type = getattr(uploaded_file, "content_type", "") or ""
    _validate_mime(name, ext, content_type)


def infer_media_type(filename: str) -> str:
    ext = _extension(filename)
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    if ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    return "file"
