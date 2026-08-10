"""Critical tests for CMS-admin editorial API (S2-T2)."""

from __future__ import annotations

import io

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.cms.cms_admin.roles import AUTHOR, EDITOR, INVESTMENTS
from apps.cms.models import Document, News, PublishStatus, SiteBanner, BannerPlacement
from apps.cms.tests.base import CMSAdminTestCase
from apps.investment.models import SuccessStory
from apps.media_library.models import MediaAsset

User = get_user_model()


class CMSAdminEditorialTestMixin:
    @classmethod
    def setUpTestData(cls):
        call_command("seed_cms_roles")

    def setUp(self):
        super().setUp()
        self.client = APIClient(enforce_csrf_checks=True)
        self.editor = User.objects.create_user(
            username="editor", password="pw-editor-123", is_staff=True
        )
        self.author = User.objects.create_user(
            username="author", password="pw-author-123", is_staff=True
        )
        self.investments = User.objects.create_user(
            username="invest", password="pw-invest-123", is_staff=True
        )
        self._assign_role(self.editor, EDITOR)
        self._assign_role(self.author, AUTHOR)
        self._assign_role(self.investments, INVESTMENTS)

    def _assign_role(self, user, role_name: str):
        group = Group.objects.get(name=role_name)
        user.groups.add(group)
        user.user_permissions.set(group.permissions.all())

    def _csrf(self) -> str:
        res = self.client.get(reverse("api-v1:cms-admin:csrf"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        return res.json()["csrfToken"]

    def _login(self, username: str, password: str):
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:login"),
            {"username": username, "password": password},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        return self._csrf()

    def _post(self, url, data=None, token=None):
        return self.client.post(
            url,
            data or {},
            format="json",
            HTTP_X_CSRFTOKEN=token or self._csrf(),
        )

    def _patch(self, url, data, token=None):
        return self.client.patch(
            url,
            data,
            format="json",
            HTTP_X_CSRFTOKEN=token or self._csrf(),
        )


class CMSAdminMediaTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_anonymous_blocked(self):
        res = self.client.get(reverse("api-v1:cms-admin:media-list"))
        self.assertIn(res.status_code, (401, 403))

    def test_staff_can_upload(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        upload = SimpleUploadedFile(
            "photo.png", b"\x89PNG\r\n\x1a\n", content_type="image/png"
        )
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": "Foto", "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MediaAsset.objects.count(), 1)

    def test_invalid_extension_rejected(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        upload = SimpleUploadedFile("virus.exe", b"MZ", content_type="application/octet-stream")
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": "Bad", "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_html_masquerading_rejected(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        upload = SimpleUploadedFile(
            "photo.png",
            b"<html>bad</html>",
            content_type="text/html",
        )
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": "Fake PNG", "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_js_mime_rejected(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        upload = SimpleUploadedFile(
            "photo.png",
            b"alert(1)",
            content_type="application/javascript",
        )
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": "JS", "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_pdf_upload(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        upload = SimpleUploadedFile("doc.pdf", b"%PDF-1.4", content_type="application/pdf")
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"title": "PDF", "file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_non_staff_blocked(self):
        outsider = User.objects.create_user(username="out", password="pw-out-123")
        token = self._csrf()
        self.client.force_login(outsider)
        upload = SimpleUploadedFile("x.png", b"png", content_type="image/png")
        res = self.client.post(
            reverse("api-v1:cms-admin:media-list"),
            {"file": upload},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertIn(res.status_code, (401, 403))


class CMSAdminNewsTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_list_and_create_draft(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Noticia",
                "slug": "noticia-1",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        listing = self.client.get(reverse("api-v1:cms-admin:news-list"))
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(listing.json()["count"], 1)

    def test_publish_unauthorized_for_author(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {"title_es": "Draft", "slug": "draft-1", "status": PublishStatus.DRAFT},
            token=token,
        )
        news_id = create.json()["id"]
        res = self._post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            {},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_publish_authorized_for_editor(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {"title_es": "Publicar", "slug": "pub-1", "status": PublishStatus.DRAFT},
            token=token,
        )
        news_id = create.json()["id"]
        res = self._post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            {},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["status"], PublishStatus.PUBLISHED)

    def test_update_news(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {"title_es": "Original", "slug": "orig", "status": PublishStatus.DRAFT},
            token=token,
        )
        news_id = create.json()["id"]
        res = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {"title_en": "Updated title"},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["title_en"], "Updated title")


class CMSAdminDocumentTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_create_with_external_url(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Doc",
                "slug": "doc-1",
                "external_url_es": "https://example.com/file.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_draft_without_file_allowed(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Sin archivo",
                "slug": "doc-draft",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_file_and_external_url_rejected(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        upload = SimpleUploadedFile("a.pdf", b"%PDF", content_type="application/pdf")
        res = self.client.post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Ambos",
                "slug": "doc-both",
                "external_url_es": "https://example.com/a.pdf",
                "file_es": upload,
                "status": PublishStatus.DRAFT,
            },
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_published_without_source_rejected(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Publicado vacío",
                "slug": "doc-pub-empty",
                "status": PublishStatus.PUBLISHED,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_with_valid_pdf(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        upload = SimpleUploadedFile("report.pdf", b"%PDF-1.4", content_type="application/pdf")
        res = self.client.post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "PDF local",
                "slug": "doc-pdf",
                "file_es": upload,
                "status": PublishStatus.DRAFT,
            },
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_invalid_extension_rejected(self):
        self._login("author", "pw-author-123")
        token = self._csrf()
        upload = SimpleUploadedFile("bad.exe", b"MZ", content_type="application/octet-stream")
        res = self.client.post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Malicioso",
                "slug": "doc-bad",
                "file_es": upload,
                "status": PublishStatus.DRAFT,
            },
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_oversized_file_rejected(self):
        from django.test import override_settings

        self._login("author", "pw-author-123")
        token = self._csrf()
        upload = SimpleUploadedFile("big.pdf", b"x" * 2048, content_type="application/pdf")
        with override_settings(CMS_MAX_UPLOAD_BYTES=1024):
            res = self.client.post(
                reverse("api-v1:cms-admin:documents-list"),
                {
                    "title_es": "Grande",
                    "slug": "doc-big",
                    "file_es": upload,
                    "status": PublishStatus.DRAFT,
                },
                format="multipart",
                HTTP_X_CSRFTOKEN=token,
            )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_file_and_external_url_rejected(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        doc = Document.all_objects.create(
            title="X",
            slug="x-doc",
            external_url_es="https://example.com/a.pdf",
            status=PublishStatus.DRAFT,
        )
        upload = SimpleUploadedFile("a.pdf", b"%PDF", content_type="application/pdf")
        res = self.client.patch(
            reverse("api-v1:cms-admin:documents-detail", args=[doc.id]),
            {"file_es": upload, "external_url_es": "https://example.com/a.pdf"},
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class CMSAdminBannerTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_create_and_invalid_url(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:banners-list"),
            {
                "title_es": "Banner",
                "placement": BannerPlacement.SITE_TOP,
                "link_url": "javascript:alert(1)",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        ok = self._post(
            reverse("api-v1:cms-admin:banners-list"),
            {
                "title_es": "Banner OK",
                "placement": BannerPlacement.SITE_TOP,
                "link_url": "/invertir",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(ok.status_code, status.HTTP_201_CREATED)


class CMSAdminSuccessStoryTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_negative_metrics_rejected(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:success-stories-list"),
            {
                "title_es": "Caso",
                "investment_amount": "-100.00",
                "jobs_generated": -1,
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_success_story(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self._post(
            reverse("api-v1:cms-admin:success-stories-list"),
            {
                "title_es": "Caso exitoso",
                "summary_es": "Resumen",
                "investment_amount": "1000000.00",
                "jobs_generated": 50,
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SuccessStory.all_objects.filter(title_es="Caso exitoso").exists())
