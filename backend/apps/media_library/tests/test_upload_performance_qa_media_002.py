"""QA-MEDIA-002 — persist upload metadata, storage 503, no N+1 storage.size on list."""

from __future__ import annotations

from unittest.mock import patch

from botocore.exceptions import BotoCoreError, ClientError
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status

from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.media_library.models import MediaAsset, MediaType
from apps.media_library.storage_errors import MEDIA_STORAGE_ERROR_CODE

IMAGE_UPLOADS = (
    ("photo.jpg", "image/jpeg", b"\xff\xd8\xff"),
    ("photo.jpeg", "image/jpeg", b"\xff\xd8\xff"),
    ("photo.png", "image/png", b"\x89PNG\r\n\x1a\n"),
    ("photo.webp", "image/webp", b"RIFF....WEBP"),
    ("photo.gif", "image/gif", b"GIF89a"),
    ("icon.svg", "image/svg+xml", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
)


class MediaUploadQaMedia002Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def _auth(self) -> str:
        self._login("editor", "pw-editor-123")
        return self._csrf()

    def _post_file(self, token: str, name: str, payload: bytes, content_type: str):
        upload = SimpleUploadedFile(name, payload, content_type=content_type)
        return self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": name, "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )

    def test_upload_persists_size_mime_and_file_url_for_supported_images(self):
        token = self._auth()
        for name, content_type, payload in IMAGE_UPLOADS:
            with self.subTest(name=name):
                res = self._post_file(token, name, payload, content_type)
                self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.content)
                body = res.json()
                asset = MediaAsset.objects.get(pk=body["id"])
                self.assertEqual(asset.file_size_bytes, len(payload))
                self.assertEqual(asset.mime_type, content_type)
                self.assertEqual(asset.original_filename, name)
                self.assertEqual(body["file_size_bytes"], len(payload))
                self.assertEqual(body["mime_type"], content_type)
                self.assertTrue(body["file_url"])
                self.assertTrue(
                    body["file_url"].startswith("http://")
                    or body["file_url"].startswith("https://")
                    or body["file_url"].startswith("/media/"),
                    body["file_url"],
                )
                self.assertNotIn("AWS_SECRET", str(body))
                self.assertNotIn("test-secret", str(body))

    def test_storage_client_error_returns_503_without_orphan(self):
        token = self._auth()
        error = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "PutObject",
        )
        with patch.object(default_storage, "save", side_effect=error):
            res = self._post_file(token, "photo.png", b"\x89PNG", "image/png")
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE, res.content)
        body = res.json()
        self.assertEqual(body["code"], MEDIA_STORAGE_ERROR_CODE)
        self.assertIn("almacenar", body["detail"].lower())
        self.assertNotIn("AccessDenied", str(body))
        self.assertNotIn("AWS", str(body))
        self.assertEqual(MediaAsset.objects.count(), 0)

    def test_storage_boto_core_error_returns_503_without_orphan(self):
        token = self._auth()
        with patch.object(default_storage, "save", side_effect=BotoCoreError()):
            res = self._post_file(token, "photo.webp", b"RIFF", "image/webp")
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE, res.content)
        self.assertEqual(res.json()["code"], MEDIA_STORAGE_ERROR_CODE)
        self.assertEqual(MediaAsset.objects.count(), 0)

    def test_media_list_does_not_call_storage_size(self):
        token = self._auth()
        for i in range(20):
            MediaAsset.objects.create(
                title=f"asset-{i}",
                file=SimpleUploadedFile(f"a{i}.png", b"png", content_type="image/png"),
                media_type=MediaType.IMAGE,
                file_size_bytes=3,
                mime_type="image/png",
            )

        def explode(*args, **kwargs):
            raise AssertionError("storage.size must not be called during media list")

        with patch.object(default_storage, "size", side_effect=explode):
            res = self.client.get(
                reverse("api-v1:cms-admin:media-list") + "?page=1&page_size=20",
                HTTP_X_CSRFTOKEN=token,
            )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        body = res.json()
        self.assertEqual(body["count"], 20)
        self.assertEqual(len(body["results"]), 20)
        self.assertEqual(body["results"][0]["file_size_bytes"], 3)

    def test_legacy_null_metadata_list_uses_local_mime_guess_only(self):
        token = self._auth()
        asset = MediaAsset.objects.create(
            title="legacy",
            file=SimpleUploadedFile("legacy.webp", b"webp", content_type="image/webp"),
            media_type=MediaType.IMAGE,
            file_size_bytes=None,
            mime_type="",
            original_filename="legacy.webp",
        )

        def explode(*args, **kwargs):
            raise AssertionError("storage.size must not be called for legacy list")

        with patch.object(default_storage, "size", side_effect=explode):
            res = self.client.get(
                reverse("api-v1:cms-admin:media-list") + "?page=1&page_size=20",
            )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        row = next(r for r in res.json()["results"] if r["id"] == asset.pk)
        self.assertIsNone(row["file_size_bytes"])
        self.assertEqual(row["mime_type"], "image/webp")
