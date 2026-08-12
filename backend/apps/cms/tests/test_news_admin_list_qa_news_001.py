"""QA-NEWS-001 — CMS-admin news list must not 500 on legacy / incomplete rows."""

from __future__ import annotations

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import News, PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.media_library.models import MediaAsset, MediaType


class NewsAdminListQANews001Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    """Reproduce staging 500 on GET /api/v1/cms-admin/news/?page=1&page_size=20."""

    def _list_url(self) -> str:
        return reverse("api-v1:cms-admin:news-list") + "?page=1&page_size=20"

    def _orphan_media(self, title: str = "Orphan featured") -> MediaAsset:
        """MediaAsset whose DB file name does not exist on disk (Render ephemeral media)."""
        asset = MediaAsset.objects.create(
            title=title,
            file=SimpleUploadedFile("hero.webp", b"webp-bytes", content_type="image/webp"),
            media_type=MediaType.IMAGE,
            alt_text="hero",
        )
        # Point at a path that storage cannot find — mimics lost blob after redeploy.
        asset.file.name = "media_assets/2099/01/qa-news-001-missing-on-disk.webp"
        asset.save(update_fields=["file"])
        return asset

    def test_news_admin_list_does_not_500_with_legacy_records(self):
        self._login("editor", "pw-editor-123")

        # Empty list first (baseline).
        empty = self.client.get(self._list_url())
        self.assertEqual(empty.status_code, status.HTTP_200_OK, empty.content)
        self.assertEqual(empty.json().get("count"), 0)

        orphan = self._orphan_media()

        # Legacy / incomplete mix that staging may hold.
        News.all_objects.create(
            title="Legacy sin bloques",
            title_es="Legacy sin bloques",
            slug="legacy-sin-bloques",
            status=PublishStatus.DRAFT,
            content_blocks_es=[],
            content_blocks_en=[],
            featured_image=None,
            created_by=None,
            updated_by=None,
        )
        News.all_objects.create(
            title="Con imagen huérfana",
            title_es="Con imagen huérfana",
            slug="con-imagen-huerfana",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
            content_blocks_es=[],
            content_blocks_en=[],
            featured_image=orphan,
            created_by=self.editor,
            updated_by=self.editor,
        )
        News.all_objects.create(
            title="Bloques con media huérfana",
            title_es="Bloques con media huérfana",
            slug="bloques-media-huerfana",
            status=PublishStatus.DRAFT,
            content_blocks_es=[
                {
                    "id": "img-1",
                    "type": "image",
                    "media_id": orphan.id,
                    "alt": "",
                },
                {"id": "p-1", "type": "paragraph", "html": "<p>OK</p>"},
            ],
            content_blocks_en=[],
            featured_image=None,
        )
        # Non-list JSON (legacy/corrupt shape) must not 500 the list.
        News.all_objects.create(
            title="Bloques forma rara",
            title_es="Bloques forma rara",
            slug="bloques-forma-rara",
            status=PublishStatus.DRAFT,
            content_blocks_es={"legacy": True},
            content_blocks_en="not-a-list",
            featured_image=None,
        )

        # Healthy row with a real file still present.
        ok_asset = MediaAsset.objects.create(
            title="OK hero",
            file=SimpleUploadedFile("ok.webp", b"ok", content_type="image/webp"),
            media_type=MediaType.IMAGE,
        )
        News.all_objects.create(
            title="Noticia sana",
            title_es="Noticia sana",
            slug="noticia-sana",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
            content_blocks_es=[{"id": "p", "type": "paragraph", "html": "<p>Hola</p>"}],
            content_blocks_en=[],
            featured_image=ok_asset,
            created_by=self.editor,
        )

        res = self.client.get(self._list_url())
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        body = res.json()
        self.assertEqual(body["count"], 5)
        self.assertEqual(len(body["results"]), 5)

        by_slug = {row["slug"]: row for row in body["results"]}

        legacy = by_slug["legacy-sin-bloques"]
        self.assertEqual(legacy["content_blocks_es"], [])
        self.assertEqual(legacy["content_blocks_en"], [])
        self.assertIsNone(legacy["featured_image"])
        self.assertIsNone(legacy["featured_image_detail"])

        orphan_row = by_slug["con-imagen-huerfana"]
        self.assertEqual(orphan_row["featured_image"], orphan.id)
        self.assertIsNotNone(orphan_row["featured_image_detail"])
        # Missing blob must not crash; size is unknown (hasattr/.size hit storage).
        self.assertIsNone(orphan_row["featured_image_detail"]["file_size_bytes"])

        blocks_row = by_slug["bloques-media-huerfana"]
        self.assertEqual(len(blocks_row["content_blocks_es"]), 2)
        self.assertEqual(blocks_row["content_blocks_en"], [])

        weird = by_slug["bloques-forma-rara"]
        self.assertEqual(weird["content_blocks_es"], [])
        self.assertEqual(weird["content_blocks_en"], [])

        healthy = by_slug["noticia-sana"]
        self.assertEqual(healthy["featured_image"], ok_asset.id)
        self.assertIsNotNone(healthy["featured_image_detail"]["file_url"])
