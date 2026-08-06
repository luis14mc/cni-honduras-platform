"""Tests for the authenticated CMS-admin API (auth, identity, dashboard)."""

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.cms.cms_admin.roles import ALL_ROLES, EDITOR
from apps.cms.models import Document, News, PublishStatus, SiteBanner, BannerPlacement
from apps.investment.models import (
    InvestmentOpportunity,
    OpportunityStatus,
    Sector,
    SuccessStory,
)

User = get_user_model()


class CMSAdminAuthTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="editor", password="pw-editor-123", is_staff=True
        )
        self.normal = User.objects.create_user(
            username="visitor", password="pw-visitor-123", is_staff=False
        )
        self.superuser = User.objects.create_superuser(
            username="root", password="pw-root-123", email="root@cni.hn"
        )

    def test_me_anonymous_rejected(self):
        res = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertIn(res.status_code, (401, 403))

    def test_dashboard_anonymous_rejected(self):
        res = self.client.get(reverse("api-v1:cms-admin:dashboard"))
        self.assertIn(res.status_code, (401, 403))

    def test_non_staff_blocked(self):
        self.client.force_login(self.normal)
        res = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_allowed(self):
        self.client.force_login(self.staff)
        res = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_superuser_allowed(self):
        self.client.force_login(self.superuser)
        res = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_me_payload_shape(self):
        group, _ = Group.objects.get_or_create(name=EDITOR)
        self.staff.groups.add(group)
        self.client.force_login(self.staff)
        res = self.client.get(reverse("api-v1:cms-admin:me"))
        data = res.json()
        self.assertEqual(data["username"], "editor")
        self.assertFalse(data["is_superuser"])
        self.assertIn(EDITOR, data["groups"])
        self.assertIsInstance(data["permissions"], list)
        self.assertNotIn("password", data)

    def test_login_invalid_credentials(self):
        res = self.client.post(
            reverse("api-v1:cms-admin:login"),
            {"username": "editor", "password": "wrong"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_non_staff_forbidden(self):
        res = self.client.post(
            reverse("api-v1:cms-admin:login"),
            {"username": "visitor", "password": "pw-visitor-123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_valid_opens_session(self):
        res = self.client.post(
            reverse("api-v1:cms-admin:login"),
            {"username": "editor", "password": "pw-editor-123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["username"], "editor")
        # Session is usable immediately.
        me = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertEqual(me.status_code, status.HTTP_200_OK)

    def test_logout(self):
        self.client.force_login(self.staff)
        res = self.client.post(reverse("api-v1:cms-admin:logout"))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        me = self.client.get(reverse("api-v1:cms-admin:me"))
        self.assertIn(me.status_code, (401, 403))


class CMSAdminDashboardTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="editor", password="pw-editor-123", is_staff=True
        )
        now = timezone.now()
        News.objects.create(
            title="Publicada", slug="pub", status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        News.objects.create(title="Borrador", slug="draft", status=PublishStatus.DRAFT)
        Document.objects.create(
            title="Doc pub", slug="doc-pub", status=PublishStatus.PUBLISHED,
            published_at=now, external_url="https://example.com/a.pdf",
        )
        SiteBanner.objects.create(
            title="Banner", placement=BannerPlacement.SITE_TOP,
            status=PublishStatus.PUBLISHED, published_at=now,
        )
        self.sector = Sector.objects.create(name="Agroindustria", slug="agro")
        Sector.objects.create(name="Inactivo", slug="inact", is_active=False)
        InvestmentOpportunity.objects.create(
            title="Oport", slug="oport", sector=self.sector,
            status=OpportunityStatus.OPEN,
        )
        SuccessStory.objects.create(
            title="Caso", slug="caso", status=PublishStatus.PUBLISHED,
            published_at=now,
        )

    def test_dashboard_counts(self):
        self.client.force_login(self.staff)
        res = self.client.get(reverse("api-v1:cms-admin:dashboard"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        counts = res.json()["counts"]
        self.assertEqual(counts["news"]["total"], 2)
        self.assertEqual(counts["news"]["published"], 1)
        self.assertEqual(counts["news"]["draft"], 1)
        self.assertEqual(counts["documents"]["published"], 1)
        self.assertEqual(counts["banners"]["total"], 1)
        self.assertEqual(counts["sectors"]["total"], 2)
        self.assertEqual(counts["sectors"]["active"], 1)
        self.assertEqual(counts["opportunities"]["open"], 1)
        self.assertEqual(counts["success_stories"]["total"], 1)

    def test_dashboard_recent_activity(self):
        self.client.force_login(self.staff)
        res = self.client.get(reverse("api-v1:cms-admin:dashboard"))
        activity = res.json()["recent_activity"]
        self.assertLessEqual(len(activity), 10)
        self.assertGreater(len(activity), 0)
        types = {e["type"] for e in activity}
        self.assertTrue(types <= {"news", "document", "banner", "success_story"})
        # Ordered by updated_at desc.
        stamps = [e["updated_at"] for e in activity]
        self.assertEqual(stamps, sorted(stamps, reverse=True))


class SeedCMSRolesTests(APITestCase):
    def test_seed_creates_all_groups_idempotently(self):
        call_command("seed_cms_roles")
        call_command("seed_cms_roles")  # second run must not duplicate
        for name in ALL_ROLES:
            self.assertTrue(Group.objects.filter(name=name).exists())
        self.assertEqual(Group.objects.filter(name__in=ALL_ROLES).count(), len(ALL_ROLES))

    def test_editor_group_has_permissions(self):
        call_command("seed_cms_roles")
        editor = Group.objects.get(name=EDITOR)
        self.assertGreater(editor.permissions.count(), 0)
