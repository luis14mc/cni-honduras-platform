"""S2-T7 Success Stories CMS + public media/publish completeness."""

from __future__ import annotations

from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.investment.models import SuccessStory
from apps.media_library.models import MediaAsset, MediaType


def _image_asset(title: str) -> MediaAsset:
    return MediaAsset.objects.create(
        title=title,
        file=SimpleUploadedFile(f"{title}.webp", b"webpdata", content_type="image/webp"),
        media_type=MediaType.IMAGE,
    )


class SuccessStoryS2T7Tests(CMSAdminEditorialTestMixin, CMSAdminTestCase):
    """Success stories are managed by the Inversiones role (not Editor)."""

    def _login_investments(self) -> str:
        return self._login("invest", "pw-invest-123")

    def _grant_publish(self) -> None:
        """Inversiones can edit stories; publishing still needs cms.can_publish."""
        perm = Permission.objects.get(codename="can_publish")
        self.investments.user_permissions.add(perm)

    def test_create_draft_with_distinct_media(self):
        token = self._login_investments()
        logo = _image_asset("logo")
        featured = _image_asset("featured")
        person = _image_asset("person")

        create = self._post(
            reverse("api-v1:cms-admin:success-stories-list"),
            {
                "title_es": "Caso Hotel",
                "title_en": "Hotel Case",
                "company_name": "Hotel Group",
                "summary_es": "Resumen ES",
                "summary_en": "Summary EN",
                "content_es": "<p>Contenido ES</p>",
                "content_en": "<p>Content EN</p>",
                "logo": logo.id,
                "featured_image": featured.id,
                "person_photo": person.id,
                "person_name": "Ana Pérez",
                "person_role": "CEO",
                "status": PublishStatus.DRAFT,
            },
            token=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        body = create.json()
        self.assertEqual(body["status"], PublishStatus.DRAFT)
        self.assertEqual(body["logo"], logo.id)
        self.assertEqual(body["featured_image"], featured.id)
        self.assertEqual(body["person_photo"], person.id)
        self.assertNotEqual(body["logo"], body["featured_image"])
        self.assertNotEqual(body["featured_image"], body["person_photo"])

    def test_patch_es_does_not_wipe_en_and_keeps_media(self):
        token = self._login_investments()
        logo = _image_asset("logo2")
        featured = _image_asset("featured2")
        person = _image_asset("person2")
        story = SuccessStory.objects.create(
            title="Caso",
            title_es="Caso ES",
            title_en="Case EN",
            slug="caso-media",
            summary_es="Resumen",
            summary_en="Summary",
            content_es="ES",
            content_en="EN",
            logo=logo,
            featured_image=featured,
            person_photo=person,
            status=PublishStatus.DRAFT,
        )

        patch = self._patch(
            reverse("api-v1:cms-admin:success-stories-detail", args=[story.pk]),
            {
                "title_es": "Caso ES actualizado",
                "summary_es": "Resumen nuevo",
            },
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        body = patch.json()
        self.assertEqual(body["title_es"], "Caso ES actualizado")
        self.assertEqual(body["title_en"], "Case EN")
        self.assertEqual(body["summary_en"], "Summary")
        self.assertEqual(body["content_en"], "EN")
        self.assertEqual(body["logo"], logo.id)
        self.assertEqual(body["featured_image"], featured.id)
        self.assertEqual(body["person_photo"], person.id)

        patch_en = self._patch(
            reverse("api-v1:cms-admin:success-stories-detail", args=[story.pk]),
            {"title_en": "Case EN updated", "summary_en": "Summary updated"},
            token=token,
        )
        self.assertEqual(patch_en.status_code, status.HTTP_200_OK, patch_en.content)
        en_body = patch_en.json()
        self.assertEqual(en_body["title_es"], "Caso ES actualizado")
        self.assertEqual(en_body["title_en"], "Case EN updated")

    def test_publish_and_public_payload_includes_media(self):
        self._grant_publish()
        token = self._login_investments()
        featured = _image_asset("pub-featured")
        logo = _image_asset("pub-logo")
        person = _image_asset("pub-person")
        story = SuccessStory.objects.create(
            title="Publicable",
            title_es="Publicable",
            slug="publicable-caso",
            summary_es="Resumen listo",
            content_es="<p>Contenido</p>",
            logo=logo,
            featured_image=featured,
            person_photo=person,
            person_name="Luis",
            person_role="Director",
            status=PublishStatus.DRAFT,
        )

        pub = self.client.post(
            reverse("api-v1:cms-admin:success-stories-detail", args=[story.pk]) + "publish/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_200_OK, pub.content)
        self.assertEqual(pub.json()["status"], PublishStatus.PUBLISHED)
        self.assertIsNotNone(pub.json()["published_at"])

        public_list = self.client.get("/api/v1/investment/success-stories/?lang=es")
        self.assertEqual(public_list.status_code, status.HTTP_200_OK)
        slugs = [r["slug"] for r in public_list.json()["results"]]
        self.assertIn("publicable-caso", slugs)

        detail = self.client.get("/api/v1/investment/success-stories/publicable-caso/?lang=es")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        data = detail.json()
        self.assertEqual(data["featured_image"]["id"], featured.id)
        self.assertEqual(data["logo"]["id"], logo.id)
        self.assertEqual(data["person_photo"]["id"], person.id)
        self.assertEqual(data["person_name"], "Luis")
        self.assertTrue(data["featured_image"]["file"] or data["featured_image"].get("file_url"))

        detail_en = self.client.get("/api/v1/investment/success-stories/publicable-caso/?lang=en")
        self.assertEqual(detail_en.status_code, status.HTTP_200_OK)

    def test_content_save_does_not_unpublish(self):
        token = self._login_investments()
        story = SuccessStory.objects.create(
            title="Ya publicado",
            title_es="Ya publicado",
            slug="ya-publicado-caso",
            summary_es="Ok",
            content_es="Ok",
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        patch = self._patch(
            reverse("api-v1:cms-admin:success-stories-detail", args=[story.pk]),
            {"summary_es": "Actualizado sin despublicar"},
            token=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK, patch.content)
        story.refresh_from_db()
        self.assertEqual(story.status, PublishStatus.PUBLISHED)
        self.assertIsNotNone(story.published_at)

    def test_publish_without_content_returns_400(self):
        self._grant_publish()
        token = self._login_investments()
        story = SuccessStory.objects.create(
            title="Sin contenido",
            title_es="Sin contenido",
            slug="sin-contenido-caso",
            summary_es="",
            content_es="",
            status=PublishStatus.DRAFT,
        )
        pub = self.client.post(
            reverse("api-v1:cms-admin:success-stories-detail", args=[story.pk]) + "publish/",
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(pub.status_code, status.HTTP_400_BAD_REQUEST, pub.content)

    def test_editor_cannot_manage_success_stories(self):
        """Regression: Editor role has CMS content, not investment.successstory."""
        token = self._login("editor", "pw-editor-123")
        res = self._post(
            reverse("api-v1:cms-admin:success-stories-list"),
            {"title_es": "No permitido", "status": PublishStatus.DRAFT},
            token=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
