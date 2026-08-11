"""S2-T6 Documents language-row completeness: siblings, uniqueness, file PATCH."""

from __future__ import annotations

from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import Document, DocumentLanguage, PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin


class DocumentS2T6Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_unique_resource_key_language(self):
        Document.objects.create(
            title="ES",
            slug="uniq-es",
            language=DocumentLanguage.ES,
            resource_key="uniq-resource",
            status=PublishStatus.DRAFT,
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Document.objects.create(
                    title="ES dup",
                    slug="uniq-es-2",
                    language=DocumentLanguage.ES,
                    resource_key="uniq-resource",
                    status=PublishStatus.DRAFT,
                )

    def test_create_spanish_version_from_en(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title": "Tourism study",
                "slug": "tourism-study",
                "language": "en",
                "resource_key": "tourism-2026",
                "external_url": "https://example.com/en.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        en_id = create.json()["id"]

        sibling = self.client.post(
            reverse("api-v1:cms-admin:documents-detail", args=[en_id])
            + "create-spanish-version/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(sibling.status_code, status.HTTP_201_CREATED, sibling.content)
        body = sibling.json()
        self.assertEqual(body["language"], "es")
        self.assertEqual(body["resource_key"], "tourism-2026")
        self.assertEqual(body["status"], PublishStatus.DRAFT)
        self.assertFalse(body["file"])
        self.assertEqual(body["external_url"], "")
        self.assertEqual(body["title"], "")

        duplicate = self.client.post(
            reverse("api-v1:cms-admin:documents-detail", args=[en_id])
            + "create-spanish-version/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_without_file_preserves_upload(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        pdf = SimpleUploadedFile("guide.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        create = self.client.post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title": "Guía",
                "slug": "guia-patch",
                "language": "es",
                "resource_key": "guia-patch",
                "category": "institucional",
                "status": PublishStatus.DRAFT,
                "file": pdf,
            },
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        doc_id = create.json()["id"]
        self.assertTrue(create.json()["file_url"])

        patch = self._patch(
            reverse("api-v1:cms-admin:documents-detail", args=[doc_id]),
            {"title": "Guía actualizada", "description": "Nueva descripción"},
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        self.assertTrue(patch.json()["file_url"])
        self.assertEqual(patch.json()["title"], "Guía actualizada")

        news = Document.all_objects.get(pk=doc_id)
        self.assertTrue(news.has_uploaded_file())

    def test_switch_to_external_url_clears_file(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        pdf = SimpleUploadedFile("guide2.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        create = self.client.post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title": "Guía 2",
                "slug": "guia-switch",
                "language": "es",
                "resource_key": "guia-switch",
                "category": "institucional",
                "status": PublishStatus.DRAFT,
                "file": pdf,
            },
            format="multipart",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        doc_id = create.json()["id"]

        patch = self._patch(
            reverse("api-v1:cms-admin:documents-detail", args=[doc_id]),
            {
                "external_url": "https://example.com/switched.pdf",
                "clear_file": True,
            },
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        self.assertEqual(patch.json()["external_url"], "https://example.com/switched.pdf")
        self.assertFalse(patch.json()["file_url"])

    def test_publish_es_and_en_public_lang_isolation(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        es = Document.objects.create(
            title="Estudio ES",
            slug="estudio-lang-es",
            language=DocumentLanguage.ES,
            resource_key="estudio-lang",
            external_url="https://example.com/es.pdf",
            status=PublishStatus.DRAFT,
        )
        en = Document.objects.create(
            title="Study EN",
            slug="estudio-lang-en",
            language=DocumentLanguage.EN,
            resource_key="estudio-lang",
            external_url="https://example.com/en.pdf",
            status=PublishStatus.DRAFT,
        )

        for doc_id in (es.pk, en.pk):
            pub = self.client.post(
                reverse("api-v1:cms-admin:documents-detail", args=[doc_id]) + "publish/",
                format="json",
                HTTP_X_CSRFTOKEN=token,
            )
            self.assertEqual(pub.status_code, status.HTTP_200_OK, pub.content)
            self.assertEqual(pub.json()["status"], PublishStatus.PUBLISHED)
            self.assertIsNotNone(pub.json()["published_at"])

        public_es = self.client.get("/api/v1/cms/documents/?lang=es")
        self.assertEqual(public_es.status_code, status.HTTP_200_OK)
        es_slugs = [r["slug"] for r in public_es.json()["results"]]
        self.assertIn("estudio-lang-es", es_slugs)
        self.assertNotIn("estudio-lang-en", es_slugs)

        public_en = self.client.get("/api/v1/cms/documents/?lang=en")
        self.assertEqual(public_en.status_code, status.HTTP_200_OK)
        en_slugs = [r["slug"] for r in public_en.json()["results"]]
        self.assertIn("estudio-lang-en", en_slugs)
        self.assertNotIn("estudio-lang-es", en_slugs)

    def test_list_includes_sibling_metadata(self):
        self._login("editor", "pw-editor-123")
        Document.objects.create(
            title="Pair ES",
            slug="pair-meta-es",
            language=DocumentLanguage.ES,
            resource_key="pair-meta",
            external_url="https://example.com/es.pdf",
            status=PublishStatus.DRAFT,
            published_at=None,
        )
        Document.objects.create(
            title="Pair EN",
            slug="pair-meta-en",
            language=DocumentLanguage.EN,
            resource_key="pair-meta",
            external_url="https://example.com/en.pdf",
            status=PublishStatus.DRAFT,
        )
        listing = self.client.get(reverse("api-v1:cms-admin:documents-list") + "?language=es")
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        rows = listing.json()["results"]
        match = next(r for r in rows if r["resource_key"] == "pair-meta")
        self.assertEqual(sorted(match["sibling_languages"]), ["en", "es"])
        self.assertIsNotNone(match["sibling_id"])

    def test_content_save_does_not_unpublish(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        doc = Document.objects.create(
            title="Published doc",
            slug="pub-keep",
            language=DocumentLanguage.ES,
            resource_key="pub-keep",
            external_url="https://example.com/keep.pdf",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        patch = self._patch(
            reverse("api-v1:cms-admin:documents-detail", args=[doc.pk]),
            {"title": "Published doc updated"},
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        doc.refresh_from_db()
        self.assertEqual(doc.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(doc.published_at)
