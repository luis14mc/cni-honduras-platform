"""Map S3-compatible storage failures to a controlled API error.

Never include credentials, endpoints-with-secrets, or provider internals in
the client payload. Log the real exception server-side for Render.
"""

from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger("cni.media")

MEDIA_STORAGE_ERROR_CODE = "media_storage_error"
MEDIA_STORAGE_ERROR_DETAIL = (
    "No fue posible almacenar el archivo en el servicio multimedia."
)

_STORAGE_ERROR_TYPES: tuple[type[BaseException], ...] = (OSError, TimeoutError)

try:
    from botocore.exceptions import (
        BotoCoreError,
        ClientError,
        ConnectionClosedError,
        EndpointConnectionError,
    )

    _STORAGE_ERROR_TYPES = _STORAGE_ERROR_TYPES + (
        BotoCoreError,
        ClientError,
        ConnectionClosedError,
        EndpointConnectionError,
    )
except ImportError:  # pragma: no cover - boto is a project dependency
    pass

try:
    from boto3.exceptions import S3UploadFailedError

    _STORAGE_ERROR_TYPES = _STORAGE_ERROR_TYPES + (S3UploadFailedError,)
except ImportError:  # pragma: no cover
    pass


def is_media_storage_error(exc: BaseException) -> bool:
    return isinstance(exc, _STORAGE_ERROR_TYPES)


def media_storage_error_response(exc: BaseException) -> Response:
    logger.exception("Media storage upload failed")
    return Response(
        {
            "detail": MEDIA_STORAGE_ERROR_DETAIL,
            "code": MEDIA_STORAGE_ERROR_CODE,
        },
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )
