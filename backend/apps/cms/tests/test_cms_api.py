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

    def test_news_draft_not_listed(self):
        News.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador-noticia",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.DRAFT,
        )
        response = self.client.get("/api/v1/cms/news/")
        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertNotIn("borrador-noticia", slugs)

    def test_news_draft_detail_not_found(self):
        News.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador-detalle",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.DRAFT,
        )
        response = self.client.get("/api/v1/cms/news/borrador-detalle/")
        self.assertEqual(response.status_code, 404)

    def test_news_featured_ordering(self):
        now = timezone.now()
        News.objects.create(
            title="Reciente",
            title_es="Reciente",
            slug="reciente",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.PUBLISHED,
            published_at=now,
            is_featured=False,
        )
        News.objects.create(
            title="Destacada",
            title_es="Destacada",
            slug="destacada",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.PUBLISHED,
            published_at=now - timezone.timedelta(days=1),
            is_featured=True,
        )
        response = self.client.get("/api/v1/cms/news/")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs[0], "destacada")

    def test_news_featured_filter(self):
        now = timezone.now()
        News.objects.create(
            title="Normal",
            title_es="Normal",
            slug="normal",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.PUBLISHED,
            published_at=now,
            is_featured=False,
        )
        News.objects.create(
            title="Destacada filtro",
            title_es="Destacada filtro",
            slug="destacada-filtro",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            status=PublishStatus.PUBLISHED,
            published_at=now,
            is_featured=True,
        )
        response = self.client.get("/api/v1/cms/news/?featured=true")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs, ["destacada-filtro"])

    def test_news_category_filter(self):
        now = timezone.now()
        News.objects.create(
            title="Comunicado",
            title_es="Comunicado",
            slug="comunicado-test",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            category="press_release",
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        News.objects.create(
            title="Evento",
            title_es="Evento",
            slug="evento-test",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            category="event",
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        response = self.client.get("/api/v1/cms/news/?category=press_release")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs, ["comunicado-test"])

    def test_news_detail_by_slug(self):
        now = timezone.now()
        News.objects.create(
            title="Detalle ES",
            title_es="Detalle ES",
            title_en="Detail EN",
            slug="detalle-slug",
            summary="Resumen",
            summary_es="Resumen",
            summary_en="Summary",
            content="Contenido",
            content_es="Contenido",
            content_en="Content",
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        response = self.client.get("/api/v1/cms/news/detalle-slug/?lang=en")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Detail EN")

    def test_news_detail_not_found(self):
        response = self.client.get("/api/v1/cms/news/no-existe/")
        self.assertEqual(response.status_code, 404)

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
