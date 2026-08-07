"""Critical tests for CMS-admin S2-T3 (investment, pages, administration)."""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.core.management import call_command
from django.urls import reverse
from rest_framework import status

from apps.cms.cms_admin.roles import EDITOR, INVESTMENTS
from apps.cms.models import InstitutionalLink, Page, PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.investment.models import InvestmentOpportunity, Sector

User = get_user_model()


class CMSAdminS2T3Mixin(CMSAdminEditorialTestMixin):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.superadmin = User.objects.create_superuser(
            username="super", email="super@cni.hn", password="pw-super-123"
        )
        cls.superadmin.is_staff = True
        cls.superadmin.save(update_fields=["is_staff"])
        cls.sector = Sector.objects.create(name="Agroindustria", slug="agroindustria", is_active=True)


class SectorAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_list_requires_auth(self):
        res = self.client.get(reverse("api-v1:cms-admin:sectors-list"))
        self.assertIn(res.status_code, (401, 403))

    def test_investments_role_can_list_sectors(self):
        self._login("invest", "pw-invest-123")
        res = self.client.get(reverse("api-v1:cms-admin:sectors-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_editor_cannot_create_sector(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:sectors-list"),
            {"name_es": "Turismo", "slug": "turismo"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_update_slug_duplicate_rejected(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:sectors-list"),
            {"name_es": "Otro Agro", "slug": "agroindustria"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        sector = Sector.objects.create(name="Textil", slug="textil")
        res = self.client.patch(
            reverse("api-v1:cms-admin:sectors-detail", args=[sector.pk]),
            {"slug": "agroindustria"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class OpportunityAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_create_requires_sector(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {"title": "Planta procesadora", "slug": "planta", "is_public": True},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_negative_investment_rejected(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "title": "Proyecto X",
                "slug": "proyecto-x",
                "sector": self.sector.pk,
                "estimated_investment": "-100.00",
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_publish_gating(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {"slug": "sin-titulo", "sector": self.sector.pk, "is_public": True},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editor_blocked(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {"title": "Opp", "slug": "opp", "sector": self.sector.pk},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class PageAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_edit_page(self):
        page = Page.all_objects.create(title="Contacto", slug="contacto", status=PublishStatus.DRAFT)
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self.client.patch(
            reverse("api-v1:cms-admin:pages-detail", args=[page.pk]),
            {"title_es": "Contacto CNI", "content_es": "<p>Hola</p>"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        page.refresh_from_db()
        self.assertEqual(page.title_es, "Contacto CNI")

    def test_protected_page_cannot_delete(self):
        page = Page.all_objects.create(title="Nosotros", slug="nosotros", status=PublishStatus.PUBLISHED)
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self.client.delete(
            reverse("api-v1:cms-admin:pages-detail", args=[page.pk]),
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Page.all_objects.filter(pk=page.pk).exists())

    def test_publish_requires_permission(self):
        page = Page.all_objects.create(title="Estudios", slug="estudios-custom", status=PublishStatus.DRAFT)
        self._login("author", "pw-author-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:pages-detail", args=[page.pk]) + "publish/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class UserAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_non_admin_blocked(self):
        self._login("editor", "pw-editor-123")
        res = self.client.get(reverse("api-v1:cms-admin:users-list"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_create_user_password_hashed(self):
        self._login("super", "pw-super-123")
        token = self._csrf()
        group = Group.objects.get(name=EDITOR)
        res = self.client.post(
            reverse("api-v1:cms-admin:users-list"),
            {
                "username": "nuevoeditor",
                "email": "nuevo@cni.hn",
                "first_name": "Nuevo",
                "last_name": "Editor",
                "password": "Secure-Pass-123",
                "password_confirm": "Secure-Pass-123",
                "is_active": True,
                "group_ids": [group.pk],
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        body = res.json()
        self.assertNotIn("password", body)
        user = User.objects.get(username="nuevoeditor")
        self.assertTrue(user.check_password("Secure-Pass-123"))
        self.assertTrue(user.is_staff)

    def test_cannot_deactivate_final_superuser(self):
        admin = User.objects.create_user(
            username="useradmin", password="pw-admin-123", is_staff=True
        )
        change_user = Permission.objects.get(
            codename="change_user", content_type__app_label="auth"
        )
        admin.user_permissions.add(change_user)
        self._login("useradmin", "pw-admin-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:users-deactivate", args=[self.superadmin.pk]),
            {},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_delete_final_superuser(self):
        self._login("super", "pw-super-123")
        token = self._csrf()
        res = self.client.delete(
            reverse("api-v1:cms-admin:users-detail", args=[self.superadmin.pk]),
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class GroupAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_list_groups(self):
        self._login("super", "pw-super-123")
        res = self.client.get(reverse("api-v1:cms-admin:groups-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = {row["name"] for row in res.json()["results"]}
        self.assertIn(EDITOR, names)

    def test_permission_catalog(self):
        self._login("super", "pw-super-123")
        res = self.client.get(reverse("api-v1:cms-admin:groups-permission-catalog"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("models", res.json())

    def test_unauthorized_update_blocked(self):
        self._login("editor", "pw-editor-123")
        group = Group.objects.get(name=EDITOR)
        token = self._csrf()
        res = self.client.patch(
            reverse("api-v1:cms-admin:groups-detail", args=[group.pk]),
            {"permission_ids": []},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class SearchAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_requires_auth(self):
        res = self.client.get(reverse("api-v1:cms-admin:search"))
        self.assertIn(res.status_code, (401, 403))

    def test_empty_query(self):
        self._login("editor", "pw-editor-123")
        res = self.client.get(reverse("api-v1:cms-admin:search"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = res.json()
        self.assertEqual(body["news"], [])

    def test_finds_sector(self):
        self._login("invest", "pw-invest-123")
        res = self.client.get(reverse("api-v1:cms-admin:search"), {"q": "agro"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.json()["sectors"]), 1)


class InstitutionalLinkAdminTests(CMSAdminS2T3Mixin, CMSAdminTestCase):
    def test_superuser_crud(self):
        self._login("super", "pw-super-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:institutional-links-list"),
            {
                "section": "footer_external",
                "title_es": "Gobierno",
                "url": "https://www.presidencia.gob.hn/",
                "is_active": True,
                "order": 1,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(InstitutionalLink.objects.count(), 1)
