"""S2-T4: CMS QA hardening — dashboard pending, translations, public API smoke."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.cms_admin.roles import EDITOR
from apps.cms.models import Document, News, PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.investment.models import InvestmentOpportunity, Sector

User = get_user_model()


class CMSDashboardPendingS2T4Tests(CMSAdminTestCase):
    def setUp(self):
        super().setUp()
        self.staff = User.objects.create_user(
            username="editor", password="pw-editor-123", is_staff=True
        )
        Document.objects.create(
            title="Sin recurso",
            slug="sin-recurso",
            status=PublishStatus.DRAFT,
        )
        sector = Sector.objects.create(name="Agro", slug="agro-pending")
        InvestmentOpportunity.objects.create(
            title="Incompleta",
            slug="incompleta",
            sector=sector,
            summary="",
            description="",
        )

    def test_dashboard_pending_extended_fields(self):
        self.client.force_login(self.staff)
        res = self.client.get(reverse("api-v1:cms-admin:dashboard"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        pending = res.json()["pending"]
        self.assertIn("documents_without_resource", pending)
        self.assertIn("incomplete_opportunities", pending)
        self.assertGreaterEqual(pending["documents_without_resource"], 1)
        self.assertGreaterEqual(pending["incomplete_opportunities"], 1)


class CMSPartialTranslationS2T4Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_patch_en_preserves_es_title(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Título español",
                "title_en": "English title",
                "slug": "titulo-es",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        news_id = create.json()["id"]
        res = self._patch(
            reverse("api-v1:cms-admin:news-detail", args=[news_id]),
            {"title_en": "Updated EN only"},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = res.json()
        self.assertEqual(body["title_es"], "Título español")
        self.assertEqual(body["title_en"], "Updated EN only")


class CMSPublicIntegrationSmokeS2T4Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    def test_publish_news_visible_on_public_api(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:news-list"),
            {
                "title_es": "Smoke ES",
                "title_en": "Smoke EN",
                "slug": "smoke-s2t4-news",
                "summary_es": "Resumen",
                "summary_en": "Summary",
                "content_es": "<p>Contenido</p>",
                "content_en": "<p>Content</p>",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        news_id = create.json()["id"]
        pub = self.client.post(
            reverse("api-v1:cms-admin:news-publish", args=[news_id]),
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK)

        public = self.client.get("/api/v1/cms/news/?lang=es")
        self.assertEqual(public.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in public.json()["results"]]
        self.assertIn("smoke-s2t4-news", slugs)

    def test_publish_document_visible_on_public_api(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        create = self._post(
            reverse("api-v1:cms-admin:documents-list"),
            {
                "title_es": "Doc smoke",
                "slug": "smoke-s2t4-doc",
                "external_url": "https://example.com/smoke.pdf",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        doc_id = create.json()["id"]
        pub = self.client.post(
            reverse("api-v1:cms-admin:documents-detail", args=[doc_id]) + "publish/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK)

        public = self.client.get("/api/v1/cms/documents/")
        self.assertEqual(public.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in public.json()["results"]]
        self.assertIn("smoke-s2t4-doc", slugs)
