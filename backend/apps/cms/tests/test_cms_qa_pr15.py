"""QA coverage for language-row Documents and News content_blocks."""

from __future__ import annotations

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import (
    BannerPlacement,
    Document,
    DocumentCategory,
    DocumentLanguage,
    News,
    PublishStatus,
    SiteBanner,
)
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.media_library.models import MediaAsset, MediaType

BLOCKS_ES = [{"type": "paragraph", "text": "Bloque ES"}]
BLOCKS_EN = [{"type": "paragraph", "text": "Block EN"}]


def _block_content(blocks):
    """Compare block payloads ignoring auto-assigned ids and read-only preview_url."""
    cleaned = []
    for block in blocks or []:
        item = {k: v for k, v in block.items() if k not in {"id", "preview_url"}}
        cleaned.append(item)
    return cleaned


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


class DocumentLanguageRowApiTests(CMSAdminTestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient()

    def test_es_and_en_rows_share_resource_key_with_distinct_slugs(self):
        Document.objects.create(
            title="Guía ES",
            title_es="Guía ES",
            slug="guia-es",
            language=DocumentLanguage.ES,
            resource_key="guia",
            external_url="https://example.com/es.pdf",
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        Document.objects.create(
            title="Guide EN",
            title_en="Guide EN",
            slug="guia-en",
            language=DocumentLanguage.EN,
            resource_key="guia",
            external_url="https://example.com/en.pdf",
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )

        es = self.client.get("/api/v1/cms/documents/guia-es/?lang=es").json()
        en = self.client.get("/api/v1/cms/documents/guia-en/?lang=en").json()
        self.assertEqual(es["resource_key"], "guia")
        self.assertEqual(en["resource_key"], "guia")
        self.assertEqual(es["language"], "es")
        self.assertEqual(en["language"], "en")
        self.assertEqual(es["external_url"], "https://example.com/es.pdf")
        self.assertEqual(en["external_url"], "https://example.com/en.pdf")
        self.assertTrue(es["has_resource"])
        self.assertTrue(en["has_resource"])

    def test_lang_filter_excludes_other_language_rows(self):
        Document.objects.create(
            title="Solo ES",
            title_es="Solo ES",
            slug="solo-es",
            language=DocumentLanguage.ES,
            resource_key="solo-es",
            external_url="https://example.com/es-only.pdf",
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        missing = self.client.get("/api/v1/cms/documents/solo-es/?lang=en")
        self.assertEqual(missing.status_code, status.HTTP_404_NOT_FOUND)

        listed = self.client.get("/api/v1/cms/documents/?lang=en")
        slugs = [item["slug"] for item in listed.json()["results"]]
        self.assertNotIn("solo-es", slugs)


class DocumentSiblingAdminTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_patch_es_does_not_wipe_en_sibling(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        es = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Doc ES",
                "slug": "doc-pair-es",
                "language": "es",
                "resource_key": "doc-pair",
                "external_url": "https://example.com/es.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(es.status_code, status.HTTP_201_CREATED, es.content)
        es_id = es.json()["id"]

        en = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_en": "Doc EN",
                "title": "Doc EN",
                "slug": "doc-pair-en",
                "language": "en",
                "resource_key": "doc-pair",
                "external_url": "https://example.com/en.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(en.status_code, status.HTTP_201_CREATED, en.content)
        en_id = en.json()["id"]

        patch = self._patch(
            reverse("api-v1:cms-admin:documents-detail", args=[es_id]),
            {"title_es": "Doc ES actualizado", "external_url": "https://example.com/es-v2.pdf"},
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)

        en_refresh = self.client.get(
            reverse("api-v1:cms-admin:documents-detail", args=[en_id]),
        )
        self.assertEqual(en_refresh.status_code, status.HTTP_200_OK)
        en_body = en_refresh.json()
        self.assertEqual(en_body["resource_key"], "doc-pair")
        self.assertEqual(en_body["language"], "en")
        self.assertEqual(en_body["external_url"], "https://example.com/en.pdf")
        self.assertEqual(en_body["slug"], "doc-pair-en")

    def test_create_english_version_action(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Informe",
                "slug": "informe-es",
                "language": "es",
                "resource_key": "informe",
                "external_url": "https://example.com/informe.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        es_id = create.json()["id"]

        sibling = self.client.post(
            reverse("api-v1:cms-admin:documents-detail", args=[es_id])
            + "create-english-version/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(sibling.status_code, status.HTTP_201_CREATED, sibling.content)
        body = sibling.json()
        self.assertEqual(body["language"], "en")
        self.assertEqual(body["resource_key"], "informe")
        self.assertEqual(body["status"], PublishStatus.DRAFT)
        self.assertNotEqual(body["slug"], "informe-es")
        self.assertFalse(body["file"])
        self.assertEqual(body["external_url"], "")

        duplicate = self.client.post(
            reverse("api-v1:cms-admin:documents-detail", args=[es_id])
            + "create-english-version/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)


class NewsContentBlocksTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_content_blocks_es_and_en_independent(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Noticia bloques",
                "slug": "noticia-bloques",
                "summary_es": "Resumen",
                "content_es": "<p>Legacy</p>",
                "content_blocks_es": BLOCKS_ES,
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        created = create.json()
        news_id = created["id"]
        self.assertEqual(_block_content(created["content_blocks_es"]), BLOCKS_ES)
        es_id = created["content_blocks_es"][0]["id"]
        self.assertTrue(es_id)

        patch_en = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {"content_blocks_en": BLOCKS_EN},
            token=token,
        )
        self.assertEqual(patch_en.status_code, status.HTTP_200_OK, patch_en.content)
        patched_en = patch_en.json()
        self.assertEqual(_block_content(patched_en["content_blocks_es"]), BLOCKS_ES)
        self.assertEqual(patched_en["content_blocks_es"][0]["id"], es_id)
        self.assertEqual(_block_content(patched_en["content_blocks_en"]), BLOCKS_EN)
        en_id = patched_en["content_blocks_en"][0]["id"]
        self.assertTrue(en_id)

        # Re-save EN with its persisted id — id must remain stable
        patch_en_stable = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {
                "content_blocks_en": [
                    {"id": en_id, "type": "paragraph", "text": "Block EN"},
                ],
            },
            token=token,
        )
        self.assertEqual(patch_en_stable.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_en_stable.json()["content_blocks_en"][0]["id"], en_id)
        self.assertEqual(patch_en_stable.json()["content_blocks_es"][0]["id"], es_id)

        pub = self.client.post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK, pub.content)

        public_es = self.client.get("/api/v1/cms/news/noticia-bloques/?lang=es")
        self.assertEqual(public_es.status_code, status.HTTP_200_OK)
        self.assertEqual(_block_content(public_es.json()["content_blocks"]), BLOCKS_ES)

        public_en = self.client.get("/api/v1/cms/news/noticia-bloques/?lang=en")
        self.assertEqual(public_en.status_code, status.HTTP_200_OK)
        self.assertEqual(_block_content(public_en.json()["content_blocks"]), BLOCKS_EN)

        patch_es = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {
                "content_blocks_es": [
                    {"type": "paragraph", "text": "Bloque ES actualizado"},
                ],
            },
            token=token,
        )
        self.assertEqual(patch_es.status_code, status.HTTP_200_OK, patch_es.content)
        body = patch_es.json()
        self.assertEqual(
            _block_content(body["content_blocks_es"]),
            [{"type": "paragraph", "text": "Bloque ES actualizado"}],
        )
        self.assertEqual(_block_content(body["content_blocks_en"]), BLOCKS_EN)
        self.assertEqual(body["content_blocks_en"][0]["id"], en_id)

        news = News.all_objects.get(pk=news_id)
        self.assertEqual(_block_content(news.content_blocks_en), BLOCKS_EN)
        self.assertEqual(news.content_blocks_en[0]["id"], en_id)
