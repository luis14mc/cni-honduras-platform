from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.cms.models import PublishStatus
from apps.investment.models import Sector, SuccessStory


class SuccessStoryModelTests(TestCase):
    def _story(self, **kwargs):
        defaults = {
            "title": "Caso",
            "title_es": "Caso",
            "slug": "caso",
        }
        defaults.update(kwargs)
        return SuccessStory(**defaults)

    def test_published_requires_title_and_content(self):
        story = self._story(status=PublishStatus.PUBLISHED, title="", summary="", content="")
        with self.assertRaises(ValidationError):
            story.full_clean()

    def test_published_accepts_summary_only(self):
        story = self._story(
            status=PublishStatus.PUBLISHED,
            summary="Resumen mínimo",
            content="",
        )
        story.full_clean()

    def test_negative_investment_invalid(self):
        story = self._story(investment_amount=-1)
        with self.assertRaises(ValidationError):
            story.full_clean()

    def test_negative_jobs_invalid(self):
        story = self._story(jobs_generated=-1)
        with self.assertRaises(ValidationError):
            story.full_clean()


class SuccessStoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()
        self.sector = Sector.objects.create(
            name="Turismo",
            name_es="Turismo",
            slug="turismo",
            is_active=True,
        )

    def _published(self, **kwargs):
        defaults = {
            "status": PublishStatus.PUBLISHED,
            "published_at": self.now,
            "summary": "Resumen",
            "summary_es": "Resumen",
            "content": "Contenido",
            "content_es": "Contenido",
        }
        defaults.update(kwargs)
        return SuccessStory.objects.create(**defaults)

    def _list(self, **params):
        query = "&".join(f"{key}={value}" for key, value in params.items())
        suffix = f"?{query}" if query else ""
        return self.client.get(f"/api/v1/investment/success-stories/{suffix}")

    def _detail(self, slug, lang="es"):
        return self.client.get(f"/api/v1/investment/success-stories/{slug}/?lang={lang}")

    def test_published_visible(self):
        self._published(title="Publicado", title_es="Publicado", slug="publicado")
        response = self._list()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)

    def test_draft_hidden(self):
        SuccessStory.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador",
            status=PublishStatus.DRAFT,
            summary="Resumen",
            summary_es="Resumen",
        )
        response = self._list()
        self.assertEqual(len(response.json()["results"]), 0)

    def test_archived_hidden(self):
        self._published(
            title="Archivado",
            title_es="Archivado",
            slug="archivado",
            status=PublishStatus.ARCHIVED,
        )
        response = self._list()
        self.assertEqual(len(response.json()["results"]), 0)

    def test_future_hidden(self):
        self._published(
            title="Futuro",
            title_es="Futuro",
            slug="futuro",
            published_at=self.now + timezone.timedelta(days=1),
        )
        response = self._list()
        self.assertEqual(len(response.json()["results"]), 0)

    def test_sector_filter(self):
        self._published(
            title="Sector A",
            title_es="Sector A",
            slug="sector-a",
            sector=self.sector,
        )
        self._published(title="Sector B", title_es="Sector B", slug="sector-b")
        response = self._list(sector="turismo")
        results = response.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["slug"], "sector-a")

    def test_featured_filter(self):
        self._published(title="Normal", title_es="Normal", slug="normal", is_featured=False)
        self._published(title="Destacado", title_es="Destacado", slug="destacado", is_featured=True)
        response = self._list(featured="true")
        results = response.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["slug"], "destacado")

    def test_lang_en_returns_english_title(self):
        self._published(
            title="ES",
            title_es="Título ES",
            title_en="Title EN",
            slug="bilingual",
        )
        response = self._list(lang="en")
        self.assertEqual(response.json()["results"][0]["title"], "Title EN")

    def test_detail_by_slug(self):
        self._published(title="Detalle", title_es="Detalle", slug="detalle")
        response = self._detail("detalle")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["slug"], "detalle")

    def test_draft_detail_returns_404(self):
        SuccessStory.objects.create(
            title="Privado",
            title_es="Privado",
            slug="privado",
            status=PublishStatus.DRAFT,
            summary="Resumen",
            summary_es="Resumen",
        )
        response = self._detail("privado")
        self.assertEqual(response.status_code, 404)

    def test_ordering_by_featured_and_order(self):
        self._published(
            title="Bajo",
            title_es="Bajo",
            slug="bajo",
            order=5,
            is_featured=False,
        )
        self._published(
            title="Alto",
            title_es="Alto",
            slug="alto",
            order=5,
            is_featured=True,
        )
        response = self._list()
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs, ["alto", "bajo"])

    def test_bulk_publish_validation_blocks_empty_content(self):
        story = SuccessStory.objects.create(
            title="Sin contenido",
            title_es="Sin contenido",
            slug="sin-contenido",
            status=PublishStatus.DRAFT,
        )
        story.status = PublishStatus.PUBLISHED
        with self.assertRaises(ValidationError):
            story.full_clean()
