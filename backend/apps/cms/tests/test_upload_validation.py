"""Unit tests for cms-admin upload validation."""

from __future__ import annotations

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings

from apps.cms.cms_admin.upload_validation import validate_upload_file


class UploadValidationTests(SimpleTestCase):
    def test_exe_rejected(self):
        upload = SimpleUploadedFile("malware.exe", b"MZ", content_type="application/octet-stream")
        with self.assertRaises(ValidationError):
            validate_upload_file(upload)

    def test_html_masquerading_as_png_rejected(self):
        upload = SimpleUploadedFile("photo.png", b"<html>", content_type="text/html")
        with self.assertRaises(ValidationError):
            validate_upload_file(upload)

    def test_javascript_mime_rejected(self):
        upload = SimpleUploadedFile(
            "photo.png", b"alert(1)", content_type="application/javascript"
        )
        with self.assertRaises(ValidationError):
            validate_upload_file(upload)

    def test_valid_png_accepted(self):
        upload = SimpleUploadedFile(
            "photo.png", b"\x89PNG\r\n\x1a\n", content_type="image/png"
        )
        validate_upload_file(upload)

    def test_valid_pdf_accepted(self):
        upload = SimpleUploadedFile("doc.pdf", b"%PDF-1.4", content_type="application/pdf")
        validate_upload_file(upload)

    def test_pdf_octet_stream_fallback_accepted(self):
        upload = SimpleUploadedFile(
            "doc.pdf", b"%PDF-1.4", content_type="application/octet-stream"
        )
        validate_upload_file(upload)

    @override_settings(CMS_MAX_UPLOAD_BYTES=512)
    def test_oversized_rejected(self):
        upload = SimpleUploadedFile("big.pdf", b"x" * 1024, content_type="application/pdf")
        with self.assertRaises(ValidationError):
            validate_upload_file(upload)

    def test_incompatible_mime_for_extension_rejected(self):
        upload = SimpleUploadedFile(
            "photo.png", b"\x89PNG\r\n\x1a\n", content_type="application/pdf"
        )
        with self.assertRaises(ValidationError):
            validate_upload_file(upload)
