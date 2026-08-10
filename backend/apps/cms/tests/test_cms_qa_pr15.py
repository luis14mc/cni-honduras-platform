"""QA fixes for PR #15 — hero images, news publish, localized documents."""

from __future__ import annotations

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import BannerPlacement, Document, DocumentCategory, News, PublishStatus, SiteBanner
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.media_library.models import MediaAsset, MediaType


class HeroBannerImageTests(CMSAdminTestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient()
        asset = MediaAsset.objects.create(
            title="Hero desktop",
            file=SimpleUploadedFile("hero.webp", b"webp", content_type="image/webp"),
            media_type=MediaType.IMAGE,
        )
        SiteBanner.objects.create(
            title="Hero",
            title_es="Hero ES",
            placement=BannerPlacement.HOME_HERO,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
            priority=10,
            image=asset,
        )

    def test_home_hero_banner_includes_absolute_image_url(self):
        response = self.client.get("/api/v1/cms/banners/?placement=home_hero&lang=es")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()["results"]
        self.assertEqual(len(results), 1)
        image = results[0]["image"]
        self.assertIsNotNone(image)
        self.assertTrue(image["file_url"].startswith("http"))
        self.assertIn("/media/", image["file_url"])


class NewsPublishWithoutSlugTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_create_and_publish_without_explicit_slug(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Noticia sin slug explícito",
                "summary_es": "Resumen",
                "content_es": "<p>Contenido</p>",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        news_id = create.json()["id"]
        self.assertTrue(create.json()["slug"])

        pub = self.client.post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK, pub.content)
        body = pub.json()
        self.assertEqual(body["status"], PublishStatus.PUBLISHED)
        self.assertIsNotNone(body["published_at"])

        public = self.client.get("/api/v1/cms/news/?lang=es")
        slugs = [item["slug"] for item in public.json()["results"]]
        self.assertIn(body["slug"], slugs)


class DocumentLocalizedApiTests(CMSAdminTestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient()

    def test_lang_es_and_en_return_distinct_resources(self):
        doc = Document.objects.create(
            title="Guía",
            title_es="Guía ES",
            title_en="Guide EN",
            slug="guia-localized",
            external_url_es="https://example.com/es.pdf",
            external_url_en="https://example.com/en.pdf",
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        es = self.client.get(f"/api/v1/cms/documents/{doc.slug}/?lang=es").json()
        en = self.client.get(f"/api/v1/cms/documents/{doc.slug}/?lang=en").json()
        self.assertEqual(es["external_url"], "https://example.com/es.pdf")
        self.assertEqual(en["external_url"], "https://example.com/en.pdf")
        self.assertTrue(es["has_resource"])
        self.assertTrue(en["has_resource"])

    def test_en_without_resource_has_no_fallback_file(self):
        doc = Document.objects.create(
            title="Solo ES",
            title_es="Solo ES",
            slug="solo-es",
            external_url_es="https://example.com/es-only.pdf",
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        en = self.client.get(f"/api/v1/cms/documents/{doc.slug}/?lang=en").json()
        self.assertEqual(en["external_url"], "")
        self.assertFalse(en["has_resource"])

    def test_patch_en_preserves_es_fields(self):
        mixin = CMSAdminEditorialTestMixin()
        mixin.setUpTestData()
        mixin.setUp()
        mixin._login("editor", "pw-editor-123")
        token = mixin._csrf()
        create = mixin._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Doc ES",
                "external_url_es": "https://example.com/es.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        doc_id = create.json()["id"]
        res = mixin._patch(
            reverse("api-v1:cms-admin:documents-detail", args=[doc_id]),
            {"title_en": "Doc EN", "external_url_en": "https://example.com/en.pdf"},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = res.json()
        self.assertEqual(body["title_es"], "Doc ES")
        self.assertEqual(body["external_url_en"], "https://example.com/en.pdf")
