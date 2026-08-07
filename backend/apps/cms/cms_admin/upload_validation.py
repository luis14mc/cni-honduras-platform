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


def max_upload_bytes() -> int:
    return int(getattr(settings, "CMS_MAX_UPLOAD_BYTES", DEFAULT_MAX_BYTES))


def _extension(name: str) -> str:
    return os.path.splitext(name or "")[1].lstrip(".").lower()


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
    if content_type:
        lowered = content_type.lower()
        if lowered.startswith(("text/html", "application/javascript", "text/javascript")):
            raise ValidationError("Tipo MIME no permitido para archivos editoriales.")
        guessed, _ = mimetypes.guess_type(name)
        if guessed and guessed != content_type and guessed.startswith("image/"):
            # Allow minor mismatches; block obvious HTML/JS masquerading as images.
            pass


def infer_media_type(filename: str) -> str:
    ext = _extension(filename)
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    if ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    return "file"
