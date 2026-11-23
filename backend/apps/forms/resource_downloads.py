"""Resolve published Strapi resources and sign downloads from a private bucket."""

import json
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from rest_framework.exceptions import APIException, NotFound


DOWNLOAD_TTL_SECONDS = 15 * 60
REMEMBER_TTL_SECONDS = 30 * 60
REMEMBER_SALT = "forms.gated-resource-download.v1"


class DownloadUnavailable(APIException):
    status_code = 503
    default_detail = "Resource downloads are temporarily unavailable."


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def get_gated_resource(document_id, locale):
    origin = settings.GATED_RESOURCE_STRAPI_URL.rstrip("/")
    parsed = urlsplit(origin)
    if not parsed.netloc or not settings.GATED_RESOURCE_STRAPI_TOKEN or (
        parsed.scheme != "https"
        and not (parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1", "::1"})
    ):
        raise DownloadUnavailable()

    query = urlencode({"locale": locale})
    req = Request(
        f"{origin}/api/gated-resources/{document_id}?{query}",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {settings.GATED_RESOURCE_STRAPI_TOKEN}",
        },
    )
    try:
        with build_opener(NoRedirect()).open(req, timeout=5) as response:
            data = json.load(response)
    except HTTPError as error:
        if error.code == 404:
            raise NotFound("Resource unavailable.") from error
        raise DownloadUnavailable() from error
    except (URLError, TimeoutError, ValueError) as error:
        raise DownloadUnavailable() from error

    if not isinstance(data, dict):
        raise DownloadUnavailable()
    title, key = data.get("title"), data.get("objectKey")
    if (
        not isinstance(title, str) or not title.strip() or not isinstance(key, str)
        or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_./-]{0,511}", key)
        or any(part in {"", ".", ".."} for part in key.split("/"))
    ):
        raise DownloadUnavailable()
    return title[:255], key


def sign_resource_download(key):
    config = settings.GATED_RESOURCE_STORAGE
    bucket = config.get("bucket")
    if not bucket or not config.get("access_key") or not config.get("secret_key"):
        raise DownloadUnavailable()

    try:
        storage = boto3.client(
            "s3",
            endpoint_url=config.get("endpoint") or None,
            region_name=config.get("region") or None,
            aws_access_key_id=config["access_key"],
            aws_secret_access_key=config["secret_key"],
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )
        return storage.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key, "ResponseContentDisposition": "attachment"},
            ExpiresIn=DOWNLOAD_TTL_SECONDS,
            HttpMethod="GET",
        )
    except (BotoCoreError, ClientError, ValueError) as error:
        raise DownloadUnavailable() from error
