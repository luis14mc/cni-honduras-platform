"""QA-MEDIA-001 — portable file_url generation across formats and storage modes."""

from __future__ import annotations

from types import SimpleNamespace

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIRequestFactory

from apps.cms.cms_admin.upload_validation import ALLOWED_IMAGE_EXTENSIONS
from apps.media_library.models import MediaAsset, MediaType
from apps.media_library.serializers import MediaAssetLiteSerializer, absolute_file_url


IMAGE_FIXTURES = (
    ("photo.jpg", "image/jpeg", b"\xff\xd8\xff"),
    ("photo.jpeg", "image/jpeg", b"\xff\xd8\xff"),
    ("photo.png", "image/png", b"\x89PNG"),
    ("photo.webp", "image/webp", b"RIFF"),
    ("photo.gif", "image/gif", b"GIF89a"),
    ("icon.svg", "image/svg+xml", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
)


class AbsoluteFileUrlUnitTests(SimpleTestCase):
    def test_absolute_http_url_unchanged(self):
        field = SimpleNamespace(url="https://cdn.example.com/media/a.webp")
        self.assertEqual(absolute_file_url(field), "https://cdn.example.com/media/a.webp")

    def test_relative_url_absolutized_with_request(self):
        field = SimpleNamespace(url="/media/a.webp")
        request = RequestFactory().get("/")
        url = absolute_file_url(field, {"request": request})
        self.assertTrue(url.startswith("http://"))
        self.assertTrue(url.endswith("/media/a.webp"))

    def test_mocked_s3_compatible_url(self):
        field = SimpleNamespace(
            url="https://bucket.s3.example.com/media/media_assets/2026/01/x.webp"
        )
        self.assertEqual(
            absolute_file_url(field),
            "https://bucket.s3.example.com/media/media_assets/2026/01/x.webp",
        )

    def test_orphan_storage_returns_none(self):
        class BrokenField:
            @property
            def url(self):
                raise FileNotFoundError("gone")

        self.assertIsNone(absolute_file_url(BrokenField()))

    def test_empty_field_returns_none(self):
        self.assertIsNone(absolute_file_url(None))
        self.assertIsNone(absolute_file_url(""))


class MediaAssetFileUrlFormatTests(TestCase):
    @override_settings(
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
                "OPTIONS": {
                    "location": "/tmp/cni-qa-media-001",
                    "base_url": "/media/",
                },
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        },
        MEDIA_URL="/media/",
    )
    def test_local_filesystem_file_url_for_supported_images(self):
        self.assertEqual(
            ALLOWED_IMAGE_EXTENSIONS,
            frozenset({"jpg", "jpeg", "png", "gif", "webp", "svg"}),
        )
        factory = APIRequestFactory()
        request = factory.get("/api/v1/cms-admin/media/")

        for filename, content_type, payload in IMAGE_FIXTURES:
            with self.subTest(filename=filename):
                asset = MediaAsset.objects.create(
                    title=filename,
                    file=SimpleUploadedFile(filename, payload, content_type=content_type),
                    media_type=MediaType.IMAGE,
                )
                data = MediaAssetLiteSerializer(asset, context={"request": request}).data
                self.assertIsNotNone(data["file_url"])
                self.assertTrue(
                    data["file_url"].startswith("http://")
                    or data["file_url"].startswith("https://"),
                    data["file_url"],
                )
                self.assertIn(filename.split(".")[-1], data["file_url"].lower())
                self.assertNotIn("api-test.cni.hn", data["file_url"])

    def test_orphan_media_file_url_tolerated(self):
        asset = MediaAsset.objects.create(
            title="orphan",
            file=SimpleUploadedFile("ok.webp", b"webp", content_type="image/webp"),
            media_type=MediaType.IMAGE,
        )
        asset.file.name = "media_assets/2099/01/missing-on-disk.webp"
        asset.save(update_fields=["file"])

        factory = APIRequestFactory()
        request = factory.get("/api/v1/cms-admin/media/")
        data = MediaAssetLiteSerializer(asset, context={"request": request}).data
        # URL may still resolve from the name; size must never crash callers.
        self.assertIn("file_url", data)
