from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.cms.admin import DocumentAdmin, NewsAdmin
from apps.cms.models import (
    DOCUMENT_MAX_BYTES,
    Document,
    DocumentCategory,
    News,
    NewsCategory,
    PublishStatus,
)


def pdf_file(name: str = "test.pdf", size: int = 12) -> SimpleUploadedFile:
    return SimpleUploadedFile(name, b"x" * size, content_type="application/pdf")


def make_document(**overrides) -> Document:
    data = {
        "title": "Documento",
        "title_es": "Documento",
        "slug": "documento",
        "file": pdf_file(),
        "category": DocumentCategory.INSTITUCIONAL,
        "status": PublishStatus.PUBLISHED,
        "published_at": timezone.now(),
    }
    data.update(overrides)
    return Document.objects.create(**data)


class DocumentModelTests(TestCase):
    def test_publish_requires_file_or_external_url(self):
        doc = Document(
            title="Sin archivo",
            slug="sin-archivo",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        with self.assertRaises(ValidationError):
            doc.full_clean()

    def test_draft_allows_missing_file_and_url(self):
        doc = Document(title="Borrador", slug="borrador", status=PublishStatus.DRAFT)
        doc.full_clean()

    def test_rejects_file_and_external_url_together(self):
        doc = Document(
            title="Doble fuente",
            slug="doble-fuente",
            file=pdf_file(),
            external_url="https://example.com/doc.pdf",
            status=PublishStatus.DRAFT,
        )
        with self.assertRaises(ValidationError):
            doc.full_clean()

    def test_external_url_only_sets_file_type_from_extension(self):
        doc = Document(
            title="Externo",
            slug="externo",
            external_url="https://example.com/report.pdf",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        doc.full_clean()
        doc.save()
        doc.refresh_from_db()
        self.assertEqual(doc.file_type, "pdf")
        self.assertIsNone(doc.file_size_bytes)

    def test_rejects_oversized_file(self):
        doc = Document(
            title="Grande",
            slug="grande",
            file=pdf_file(size=DOCUMENT_MAX_BYTES + 1),
            status=PublishStatus.DRAFT,
        )
        with self.assertRaises(ValidationError):
            doc.full_clean()

    def test_rejects_invalid_extension(self):
        doc = Document(
            title="Exe",
            slug="exe",
            file=SimpleUploadedFile("bad.exe", b"x", content_type="application/octet-stream"),
            status=PublishStatus.DRAFT,
        )
        with self.assertRaises(ValidationError):
            doc.full_clean()


class DocumentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_draft_document_not_listed(self):
        Document.objects.create(
            title="Privado",
            title_es="Privado",
            slug="privado",
            file=pdf_file(),
            category=DocumentCategory.TECNICOS,
            status=PublishStatus.DRAFT,
        )
        response = self.client.get("/api/v1/cms/documents/?category=tecnicos")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_future_published_document_not_listed(self):
        Document.objects.create(
            title="Futuro",
            title_es="Futuro",
            slug="futuro",
            file=pdf_file(),
            category=DocumentCategory.BIBLIOTECA,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now() + timezone.timedelta(days=1),
        )
        response = self.client.get("/api/v1/cms/documents/")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertNotIn("futuro", slugs)

    def test_published_document_visible(self):
        make_document(slug="visible", title="Visible", title_es="Visible")
        response = self.client.get("/api/v1/cms/documents/")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn("visible", slugs)

    def test_detail_by_slug(self):
        make_document(
            slug="detalle-doc",
            title="Detalle ES",
            title_es="Detalle ES",
            title_en="Detail EN",
            description_en="Summary EN",
        )
        response = self.client.get("/api/v1/cms/documents/detalle-doc/?lang=en")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Detail EN")

    def test_detail_not_found(self):
        response = self.client.get("/api/v1/cms/documents/no-existe/")
        self.assertEqual(response.status_code, 404)

    def test_draft_detail_not_found(self):
        Document.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador-detalle",
            file=pdf_file(),
            status=PublishStatus.DRAFT,
        )
        response = self.client.get("/api/v1/cms/documents/borrador-detalle/")
        self.assertEqual(response.status_code, 404)

    def test_category_filter(self):
        make_document(slug="inst", category=DocumentCategory.INSTITUCIONAL)
        make_document(slug="tec", category=DocumentCategory.TECNICOS)
        response = self.client.get("/api/v1/cms/documents/?category=institucional")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs, ["inst"])

    def test_featured_filter(self):
        make_document(slug="normal", is_featured=False)
        make_document(slug="destacado", is_featured=True)
        response = self.client.get("/api/v1/cms/documents/?featured=true")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs, ["destacado"])

    def test_ordering_by_manual_order(self):
        now = timezone.now()
        make_document(slug="segundo", order=2, published_at=now)
        make_document(slug="primero", order=1, published_at=now)
        response = self.client.get("/api/v1/cms/documents/")
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertEqual(slugs[:2], ["primero", "segundo"])

    def test_external_url_document_exposed(self):
        Document.objects.create(
            title="Externo",
            title_es="Externo",
            slug="externo-api",
            external_url="https://example.com/study.pdf",
            category=DocumentCategory.ESTUDIOS,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        response = self.client.get("/api/v1/cms/documents/externo-api/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["external_url"], "https://example.com/study.pdf")
        self.assertFalse(payload["file"])
        self.assertEqual(payload["file_type"], "pdf")

    def test_internal_file_document_exposed(self):
        doc = make_document(slug="interno-api")
        response = self.client.get("/api/v1/cms/documents/interno-api/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["file"])
        self.assertEqual(payload["external_url"], "")


def admin_request(user):
    factory = RequestFactory()
    request = factory.get("/admin/cms/document/")
    request.user = user
    middleware = SessionMiddleware(lambda req: None)
    middleware.process_request(request)
    request.session.save()
    request._messages = FallbackStorage(request)
    return request


class DocumentAdminPublishTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_superuser(
            username="editor",
            email="editor@example.com",
            password="secret",
        )
        self.document_admin = DocumentAdmin(Document, admin.site)
        self.request = admin_request(self.user)

    def _publish(self, queryset):
        self.document_admin.make_published(self.request, queryset)

    def test_cannot_publish_without_file_or_url(self):
        doc = Document.objects.create(
            title="Sin fuente",
            title_es="Sin fuente",
            slug="sin-fuente",
            status=PublishStatus.DRAFT,
        )
        self._publish(Document.objects.filter(pk=doc.pk))
        doc.refresh_from_db()
        self.assertEqual(doc.status, PublishStatus.DRAFT)
        self.assertIsNone(doc.published_at)

    def test_can_publish_with_file(self):
        doc = Document.objects.create(
            title="Con archivo",
            title_es="Con archivo",
            slug="con-archivo",
            file=pdf_file(),
            status=PublishStatus.DRAFT,
        )
        self._publish(Document.objects.filter(pk=doc.pk))
        doc.refresh_from_db()
        self.assertEqual(doc.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(doc.published_at)
        self.assertEqual(doc.updated_by, self.user)

    def test_can_publish_with_external_url(self):
        doc = Document.objects.create(
            title="Externo",
            title_es="Externo",
            slug="externo-admin",
            external_url="https://example.com/study.pdf",
            status=PublishStatus.DRAFT,
        )
        self._publish(Document.objects.filter(pk=doc.pk))
        doc.refresh_from_db()
        self.assertEqual(doc.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(doc.published_at)

    def test_cannot_publish_with_both_sources(self):
        doc = Document.objects.create(
            title="Doble fuente",
            title_es="Doble fuente",
            slug="doble-fuente-admin",
            file=pdf_file(),
            external_url="https://example.com/doc.pdf",
            status=PublishStatus.DRAFT,
        )
        self._publish(Document.objects.filter(pk=doc.pk))
        doc.refresh_from_db()
        self.assertEqual(doc.status, PublishStatus.DRAFT)

    def test_mixed_selection_publishes_valid_only(self):
        valid_file = Document.objects.create(
            title="Valido archivo",
            title_es="Valido archivo",
            slug="valido-archivo",
            file=pdf_file(),
            status=PublishStatus.DRAFT,
        )
        valid_url = Document.objects.create(
            title="Valido url",
            title_es="Valido url",
            slug="valido-url",
            external_url="https://example.com/report.pdf",
            status=PublishStatus.DRAFT,
        )
        invalid = Document.objects.create(
            title="Invalido",
            title_es="Invalido",
            slug="invalido",
            status=PublishStatus.DRAFT,
        )
        self._publish(Document.objects.filter(
            pk__in=[valid_file.pk, valid_url.pk, invalid.pk],
        ))

        valid_file.refresh_from_db()
        valid_url.refresh_from_db()
        invalid.refresh_from_db()

        self.assertEqual(valid_file.status, PublishStatus.PUBLISHED)
        self.assertEqual(valid_url.status, PublishStatus.PUBLISHED)
        self.assertEqual(invalid.status, PublishStatus.DRAFT)

        stored_messages = [str(message) for message in self.request._messages]
        self.assertTrue(any("2 documento(s) publicado(s)" in message for message in stored_messages))
        self.assertTrue(any("1 documento(s) no se publicaron" in message for message in stored_messages))


class NewsAdminPublishTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_superuser(
            username="news-editor",
            email="news@example.com",
            password="secret",
        )
        self.news_admin = NewsAdmin(News, admin.site)
        self.request = admin_request(self.user)

    def test_news_bulk_publish_still_works(self):
        news = News.objects.create(
            title="Borrador",
            title_es="Borrador",
            slug="borrador-news-admin",
            summary="Resumen",
            summary_es="Resumen",
            content="Contenido",
            content_es="Contenido",
            category=NewsCategory.NEWS,
            status=PublishStatus.DRAFT,
        )
        self.news_admin.make_published(self.request, News.objects.filter(pk=news.pk))
        news.refresh_from_db()
        self.assertEqual(news.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(news.published_at)
