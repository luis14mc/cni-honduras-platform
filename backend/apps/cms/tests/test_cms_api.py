from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.cms.models import Document, DocumentCategory, InstitutionalLink, LinkSection, News, PublishStatus, SiteBanner, BannerPlacement
from apps.investment.models import SuccessStory


class CmsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_news_pagination_and_lang(self):
        News.objects.create(
            title="Noticia ES",
            title_es="Noticia ES",
            title_en="News EN",
            slug="noticia-es",
            summary="Resumen",
            summary_es="Resumen",
            summary_en="Summary",
            content="Contenido",
            content_es="Contenido",
            content_en="Content",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        response = self.client.get("/api/v1/cms/news/?lang=en")
        self.assertEqual(response.status_code, 200)
        self.assertIn("results", response.json())
        self.assertEqual(response.json()["results"][0]["title"], "News EN")

    def test_integrations_forbidden_for_anonymous(self):
        response = self.client.get("/api/v1/integrations/webhook-events/")
        self.assertEqual(response.status_code, 403)

    def test_draft_document_not_listed(self):
        Document.objects.create(
            title="Privado",
            title_es="Privado",
            slug="privado",
            file=SimpleUploadedFile("test.pdf", b"pdf-content", content_type="application/pdf"),
            category=DocumentCategory.TECNICOS,
            status=PublishStatus.DRAFT,
        )
        response = self.client.get("/api/v1/cms/documents/?category=tecnicos")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_banner_window(self):
        now = timezone.now()
        SiteBanner.objects.create(
            title="Futuro",
            title_es="Futuro",
            placement=BannerPlacement.SITE_TOP,
            status=PublishStatus.PUBLISHED,
            published_at=now,
            starts_at=now + timezone.timedelta(days=1),
        )
        response = self.client.get("/api/v1/cms/banners/?placement=site_top")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_success_story_published_only(self):
        SuccessStory.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador",
            status=PublishStatus.DRAFT,
        )
        SuccessStory.objects.create(
            title="Publicado",
            title_es="Publicado",
            slug="publicado",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        response = self.client.get("/api/v1/investment/success-stories/")
        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn("publicado", slugs)
        self.assertNotIn("borrador", slugs)

    def test_institutional_links_section_filter_and_lang(self):
        InstitutionalLink.objects.create(
            section=LinkSection.HOME_INTEREST,
            icon="guia",
            title="Guía ES",
            title_es="Guía ES",
            title_en="Guide EN",
            url="https://example.com/guia",
            is_external=True,
            order=1,
            is_active=True,
        )
        InstitutionalLink.objects.create(
            section=LinkSection.FOOTER_EXTERNAL,
            icon="presidencia",
            title="Presidencia",
            title_es="Presidencia",
            title_en="Presidency",
            url="https://www.presidencia.gob.hn",
            is_external=True,
            order=1,
            is_active=True,
        )

        home_response = self.client.get("/api/v1/cms/institutional-links/?section=home_interest&lang=en")
        self.assertEqual(home_response.status_code, 200)
        home_results = home_response.json()["results"]
        self.assertEqual(len(home_results), 1)
        self.assertEqual(home_results[0]["title"], "Guide EN")
        self.assertEqual(home_results[0]["icon"], "guia")

        footer_response = self.client.get("/api/v1/cms/institutional-links/?section=footer_external")
        self.assertEqual(footer_response.status_code, 200)
        self.assertEqual(len(footer_response.json()["results"]), 1)

    def test_institutional_links_hide_inactive_and_order(self):
        InstitutionalLink.objects.create(
            section=LinkSection.HOME_INTEREST,
            icon="inactive",
            title="Inactivo",
            title_es="Inactivo",
            url="https://example.com/inactive",
            is_external=True,
            order=99,
            is_active=False,
        )
        InstitutionalLink.objects.create(
            section=LinkSection.HOME_INTEREST,
            icon="second",
            title="Segundo",
            title_es="Segundo",
            url="https://example.com/second",
            is_external=True,
            order=2,
            is_active=True,
        )
        InstitutionalLink.objects.create(
            section=LinkSection.HOME_INTEREST,
            icon="first",
            title="Primero",
            title_es="Primero",
            url="https://example.com/first",
            is_external=True,
            order=1,
            is_active=True,
        )

        response = self.client.get("/api/v1/cms/institutional-links/?section=home_interest")
        self.assertEqual(response.status_code, 200)
        titles = [item["title"] for item in response.json()["results"]]
        self.assertEqual(titles, ["Primero", "Segundo"])
        self.assertNotIn("Inactivo", titles)
