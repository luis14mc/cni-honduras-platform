"""End-to-end News editorial flow: draft → ES/EN blocks → publish → public API."""

from __future__ import annotations

from django.urls import reverse
from rest_framework import status

from apps.cms.models import News, PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin


class NewsEndToEndTests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_create_draft_patch_locales_publish_public(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()

        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Noticia E2E operativa",
                "summary_es": "Resumen ES",
                "content_blocks_es": [
                    {"type": "heading", "level": 2, "text": "Sección ES"},
                    {"type": "paragraph", "html": "<p>Párrafo en español</p>"},
                ],
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        body = create.json()
        news_id = body["id"]
        self.assertEqual(body["status"], PublishStatus.DRAFT)
        self.assertTrue(body["slug"])
        self.assertEqual(len(body["content_blocks_es"]), 2)
        self.assertTrue(body["content_blocks_es"][0]["id"])

        # GET admin detail
        detail = self.client.get(reverse("api-v1:cms-admin:news-detail", args=[news_id]))
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

        # PATCH ES only — EN remains empty
        patch_es = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {
                "content_blocks_es": [
                    {"id": "es-1", "type": "paragraph", "html": "<p>ES actualizado</p>"},
                    {"id": "es-2", "type": "list", "style": "bullet", "items": ["Uno", "Dos"]},
                ],
            },
            token=token,
        )
        self.assertEqual(patch_es.status_code, status.HTTP_200_OK, patch_es.content)
        self.assertEqual(len(patch_es.json()["content_blocks_es"]), 2)
        self.assertEqual(patch_es.json()["content_blocks_es"][0]["id"], "es-1")
        self.assertEqual(patch_es.json().get("content_blocks_en") or [], [])

        # PATCH EN independently
        patch_en = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {
                "title_en": "E2E news EN",
                "content_blocks_en": [
                    {"id": "en-1", "type": "paragraph", "html": "<p>English paragraph</p>"},
                    {"id": "en-2", "type": "quote", "text": "Quoted", "attribution": "CNI"},
                ],
            },
            token=token,
        )
        self.assertEqual(patch_en.status_code, status.HTTP_200_OK, patch_en.content)
        en_body = patch_en.json()
        self.assertEqual(len(en_body["content_blocks_en"]), 2)
        self.assertEqual(en_body["content_blocks_en"][0]["id"], "en-1")
        self.assertEqual(len(en_body["content_blocks_es"]), 2)
        self.assertEqual(en_body["content_blocks_es"][0]["id"], "es-1")
        self.assertIn("ES actualizado", en_body["content_blocks_es"][0]["html"])

        # PATCH ES again must not wipe EN and must keep provided ids
        patch_es2 = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {
                "content_blocks_es": [
                    {"id": "es-1", "type": "paragraph", "html": "<p>ES final</p>"},
                ],
            },
            token=token,
        )
        self.assertEqual(patch_es2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(patch_es2.json()["content_blocks_en"]), 2)
        self.assertEqual(patch_es2.json()["content_blocks_en"][0]["id"], "en-1")
        self.assertEqual(patch_es2.json()["content_blocks_es"][0]["id"], "es-1")

        # Publish
        pub = self.client.post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK, pub.content)
        self.assertEqual(pub.json()["status"], PublishStatus.PUBLISHED)
        self.assertIsNotNone(pub.json()["published_at"])
        slug = pub.json()["slug"]

        # Public list ES
        public_list = self.client.get("/api/v1/cms/news/?lang=es")
        self.assertEqual(public_list.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in public_list.json()["results"]]
        self.assertIn(slug, slugs)

        # Public detail ES blocks
        public_es = self.client.get(f"/api/v1/cms/news/{slug}/?lang=es")
        self.assertEqual(public_es.status_code, status.HTTP_200_OK)
        es_blocks = public_es.json()["content_blocks"]
        self.assertEqual(len(es_blocks), 1)
        self.assertIn("ES final", es_blocks[0]["html"])

        # Public detail EN blocks
        public_en = self.client.get(f"/api/v1/cms/news/{slug}/?lang=en")
        self.assertEqual(public_en.status_code, status.HTTP_200_OK)
        en_blocks = public_en.json()["content_blocks"]
        self.assertEqual(len(en_blocks), 2)
        self.assertEqual(en_blocks[1]["type"], "quote")

    def test_publish_without_title_returns_field_error(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        news = News.objects.create(
            title="",
            title_es="",
            slug="sin-titulo-pub",
            status=PublishStatus.DRAFT,
        )
        pub = self.client.post(
            reverse("api-v1:cms-admin:news-publish", args=[news.pk]),
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_400_BAD_REQUEST, pub.content)
        payload = pub.json()
        self.assertTrue(
            "title" in payload or "title_es" in payload or "non_field_errors" in payload or payload,
        )

    def test_content_save_does_not_require_status_draft_on_published(self):
        """Regression: PATCH without status must not unpublish."""
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        from django.utils import timezone

        news = News.objects.create(
            title="Publicada",
            title_es="Publicada",
            slug="ya-publicada",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
            content_blocks_es=[{"id": "a", "type": "paragraph", "html": "<p>A</p>"}],
        )

        patch = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news.pk]),
            {
                "summary_es": "Nuevo resumen",
                "content_blocks_es": [
                    {"id": "a", "type": "paragraph", "html": "<p>Actualizado</p>"},
                ],
            },
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        news.refresh_from_db()
        self.assertEqual(news.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(news.published_at)
