from pathlib import Path
import os
from unittest.mock import patch

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, TestCase, override_settings
from environ import Env

from config.settings.storage import (
    S3_REQUIRED_ENV_VARS,
    build_storages,
    configure_media_storage,
    resolve_media_url,
    use_s3_storage,
    validate_s3_storage_env,
    warn_ephemeral_filesystem_storage,
)


class StorageSettingsUnitTests(SimpleTestCase):
    def test_local_filesystem_when_s3_disabled(self):
        env = Env(USE_S3_STORAGE=False)
        media_root = Path("/tmp/cni-media")

        storages = build_storages(env, media_root=media_root, media_url="/media/")

        self.assertEqual(
            storages["default"]["BACKEND"],
            "django.core.files.storage.FileSystemStorage",
        )
        self.assertEqual(storages["default"]["OPTIONS"]["location"], str(media_root))
        self.assertEqual(storages["default"]["OPTIONS"]["base_url"], "/media/")
        self.assertEqual(
            storages["staticfiles"]["BACKEND"],
            "django.contrib.staticfiles.storage.StaticFilesStorage",
        )

    def test_s3_storage_when_enabled_with_full_config(self):
        env = Env()
        s3_env = {
            "USE_S3_STORAGE": "true",
            "AWS_ACCESS_KEY_ID": "test-key",
            "AWS_SECRET_ACCESS_KEY": "test-secret",
            "AWS_STORAGE_BUCKET_NAME": "example-bucket",
            "AWS_S3_ENDPOINT_URL": "https://s3.example.com",
            "AWS_S3_REGION_NAME": "auto",
            "AWS_QUERYSTRING_AUTH": "false",
            "AWS_S3_FILE_OVERWRITE": "false",
            "AWS_S3_ADDRESSING_STYLE": "path",
            "AWS_DEFAULT_ACL": "",
        }
        with patch.dict(os.environ, s3_env, clear=False):
            storages = build_storages(env, media_root=Path("/tmp/media"), media_url="/media/")

        self.assertEqual(storages["default"]["BACKEND"], "storages.backends.s3.S3Storage")
        options = storages["default"]["OPTIONS"]
        self.assertEqual(options["bucket_name"], "example-bucket")
        self.assertEqual(options["location"], "media")
        self.assertFalse(options["querystring_auth"])
        self.assertFalse(options["file_overwrite"])
        self.assertEqual(options["addressing_style"], "path")
        self.assertIsNone(options["default_acl"])
        self.assertEqual(options["url_protocol"], "https:")

    def test_s3_missing_variables_raise_clear_error(self):
        env = Env()
        with patch.dict(
            os.environ,
            {
                "USE_S3_STORAGE": "true",
                "AWS_ACCESS_KEY_ID": "test-key",
                "AWS_SECRET_ACCESS_KEY": "test-secret",
            },
            clear=False,
        ):
            with self.assertRaises(ImproperlyConfigured) as exc:
                validate_s3_storage_env(env)

        message = str(exc.exception)
        self.assertIn("USE_S3_STORAGE is enabled", message)
        self.assertIn("AWS_STORAGE_BUCKET_NAME", message)
        self.assertNotIn("test-secret", message)

    def test_configure_media_storage_local(self):
        env = Env(USE_S3_STORAGE=False, DJANGO_DEBUG=True)
        config = configure_media_storage(env, Path("/tmp/backend"))

        self.assertEqual(config["MEDIA_URL"], "/media/")
        self.assertFalse(use_s3_storage(env))
        self.assertEqual(
            config["STORAGES"]["default"]["BACKEND"],
            "django.core.files.storage.FileSystemStorage",
        )

    def test_resolve_media_url_with_custom_domain(self):
        env = Env()
        s3_env = {
            "USE_S3_STORAGE": "true",
            "AWS_S3_CUSTOM_DOMAIN": "cdn.example.com",
            "AWS_ACCESS_KEY_ID": "k",
            "AWS_SECRET_ACCESS_KEY": "s",
            "AWS_STORAGE_BUCKET_NAME": "bucket",
            "AWS_S3_ENDPOINT_URL": "https://s3.example.com",
            "AWS_S3_REGION_NAME": "auto",
            "AWS_QUERYSTRING_AUTH": "false",
        }
        with patch.dict(os.environ, s3_env, clear=False):
            self.assertEqual(
                resolve_media_url(env, media_url="/media/"),
                "https://cdn.example.com/",
            )

    def test_signed_urls_keep_relative_media_url_base(self):
        env = Env()
        s3_env = {
            "USE_S3_STORAGE": "true",
            "AWS_ACCESS_KEY_ID": "test-key",
            "AWS_SECRET_ACCESS_KEY": "test-secret",
            "AWS_STORAGE_BUCKET_NAME": "example-bucket",
            "AWS_S3_ENDPOINT_URL": "https://s3.example.com",
            "AWS_S3_REGION_NAME": "auto",
            "AWS_QUERYSTRING_AUTH": "true",
        }
        with patch.dict(os.environ, s3_env, clear=False):
            self.assertEqual(resolve_media_url(env, media_url="/media/"), "/media/")

    def test_custom_domain_builds_storage_and_media_url(self):
        env = Env()
        s3_env = {
            "USE_S3_STORAGE": "true",
            "AWS_ACCESS_KEY_ID": "test-key",
            "AWS_SECRET_ACCESS_KEY": "test-secret",
            "AWS_STORAGE_BUCKET_NAME": "example-bucket",
            "AWS_S3_ENDPOINT_URL": "https://s3.example.com",
            "AWS_S3_REGION_NAME": "auto",
            "AWS_S3_CUSTOM_DOMAIN": "media.example.com",
            "AWS_QUERYSTRING_AUTH": "false",
            "AWS_S3_FILE_OVERWRITE": "false",
        }
        with patch.dict(os.environ, s3_env, clear=False):
            storages = build_storages(env, media_root=Path("/tmp/media"), media_url="/media/")
            media_url = resolve_media_url(env, media_url="/media/")

        self.assertEqual(storages["default"]["OPTIONS"]["location"], "media")
        self.assertEqual(storages["default"]["OPTIONS"]["custom_domain"], "media.example.com")
        self.assertEqual(media_url, "https://media.example.com/")

    def test_public_endpoint_without_custom_domain_derives_media_url(self):
        env = Env()
        s3_env = {
            "USE_S3_STORAGE": "true",
            "AWS_ACCESS_KEY_ID": "test-key",
            "AWS_SECRET_ACCESS_KEY": "test-secret",
            "AWS_STORAGE_BUCKET_NAME": "public-bucket",
            "AWS_S3_ENDPOINT_URL": "https://s3.example.com",
            "AWS_S3_REGION_NAME": "us-east-1",
            "AWS_QUERYSTRING_AUTH": "false",
        }
        with patch.dict(os.environ, s3_env, clear=False):
            media_url = resolve_media_url(env, media_url="/media/")

        self.assertEqual(media_url, "https://s3.example.com/public-bucket/media/")

    def test_no_provider_hostname_sniffing_helpers(self):
        import config.settings.storage as storage_mod

        self.assertFalse(hasattr(storage_mod, "is_r2_endpoint"))
        self.assertFalse(hasattr(storage_mod, "R2_ENDPOINT_HOST_SUFFIX"))

    def test_warns_when_debug_false_and_filesystem_storage(self):
        with self.assertLogs("cni.media", level="WARNING") as captured:
            warn_ephemeral_filesystem_storage(debug=False, use_s3=False)
        self.assertTrue(any("USE_S3_STORAGE" in line for line in captured.output))
        self.assertTrue(any("FileSystemStorage" in line for line in captured.output))

    def test_no_warning_when_debug_or_s3(self):
        with self.assertNoLogs("cni.media", level="WARNING"):
            warn_ephemeral_filesystem_storage(debug=True, use_s3=False)
            warn_ephemeral_filesystem_storage(debug=False, use_s3=True)

    def test_all_required_env_names_documented(self):
        self.assertEqual(len(S3_REQUIRED_ENV_VARS), 5)


class StorageSettingsIntegrationTests(TestCase):
    def test_django_check_uses_local_storage_by_default(self):
        from django.core.management import call_command
        from io import StringIO

        out = StringIO()
        call_command("check", stdout=out)
        self.assertIn("no issues", out.getvalue().lower())

    @override_settings(
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
                "OPTIONS": {
                    "location": "/tmp/test-media",
                    "base_url": "/media/",
                },
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        }
    )
    def test_media_serializer_url_is_not_hardcoded(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        from apps.cms.models import Document, DocumentCategory, PublishStatus
        from apps.cms.serializers import DocumentSerializer
        from apps.media_library.models import MediaAsset
        from apps.media_library.serializers import MediaAssetLiteSerializer

        asset = MediaAsset.objects.create(
            title="Hero",
            file=SimpleUploadedFile("hero.jpg", b"image-bytes", content_type="image/jpeg"),
            alt_text="Hero",
            media_type="image",
        )
        asset_data = MediaAssetLiteSerializer(asset).data
        self.assertTrue(
            asset_data["file"].startswith("/media/") or asset_data["file"].startswith("http")
        )
        self.assertNotIn("api-test.cni.hn", asset_data["file"])

        document = Document.objects.create(
            title="Guía",
            title_es="Guía",
            slug="guia-test",
            file=SimpleUploadedFile("guia.pdf", b"pdf-bytes", content_type="application/pdf"),
            category=DocumentCategory.INSTITUCIONAL,
            status=PublishStatus.PUBLISHED,
        )
        doc_data = DocumentSerializer(document).data
        self.assertTrue(
            doc_data["file"].startswith("/media/") or doc_data["file"].startswith("http")
        )
        self.assertNotIn("api-test.cni.hn", doc_data["file"])
