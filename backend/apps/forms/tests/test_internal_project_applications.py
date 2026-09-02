"""Tests for internal CMS project application management (LEADS-002)."""

from __future__ import annotations

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.urls import reverse
from rest_framework import status

from apps.cms.tests.base import CMSAdminTestCase
from apps.forms.models import (
    ProjectApplication,
    ProjectApplicationHistory,
    ProjectApplicationHistoryEventType,
    ProjectApplicationNote,
    ProjectApplicationStatus,
)
from apps.geo.models import Department, Municipality
from apps.investment.models import Sector

User = get_user_model()


class ProjectApplicationInternalAPITests(CMSAdminTestCase):
    @classmethod
    def setUpTestData(cls):
        geometry = MultiPolygon(Polygon(((0, 0), (0, 1), (1, 1), (0, 0))))
        cls.sector = Sector.objects.create(name="Energía", slug="energia")
        cls.department = Department.objects.create(name="Cortés", slug="cortes", geometry=geometry)
        cls.municipality = Municipality.objects.create(
            name="San Pedro Sula",
            slug="san-pedro-sula",
            department=cls.department,
        )
        cls.assignee = User.objects.create_user(
            username="assignee",
            password="pw-assignee-123",
            is_staff=True,
            first_name="Juan",
            last_name="Pérez",
            email="juan@example.com",
        )
        cls.viewer = User.objects.create_user(
            username="viewer",
            password="pw-viewer-123",
            is_staff=True,
        )
        cls.unauthorized_staff = User.objects.create_user(
            username="nostaff",
            password="pw-nostaff-123",
            is_staff=True,
        )
        editor_group, _ = Group.objects.get_or_create(name="Editor")
        ct = ContentType.objects.get_for_model(ProjectApplication)
        perms = Permission.objects.filter(content_type=ct, codename__in=["view_projectapplication", "change_projectapplication"])
        editor_group.permissions.add(*perms)
        cls.assignee.groups.add(editor_group)
        cls.viewer.groups.add(editor_group)

        cls.application = ProjectApplication.objects.create(
            full_name="Ana López",
            email="ana@example.com",
            phone="+504 9999-9999",
            company="Empresa Uno",
            country="Honduras",
            project_name="Proyecto Solar",
            details="Parque de generación solar.",
            sector="energia",
            sector_ref=cls.sector,
            department="cortes",
            department_ref=cls.department,
            municipality=cls.municipality,
            investment_range="10m_50m",
            expected_jobs=20,
            consent=True,
            source="website_project_submission",
            status=ProjectApplicationStatus.NEW,
        )

    def setUp(self):
        super().setUp()
        self.list_url = reverse("api-v1:cms-admin:project-applications-list")
        self.detail_url = reverse(
            "api-v1:cms-admin:project-applications-detail",
            kwargs={"reference_code": self.application.reference_code},
        )
        self.notes_url = reverse(
            "api-v1:cms-admin:project-applications-notes",
            kwargs={"reference_code": self.application.reference_code},
        )
        self.history_url = reverse(
            "api-v1:cms-admin:project-applications-history",
            kwargs={"reference_code": self.application.reference_code},
        )
        self.assignable_url = reverse("api-v1:cms-admin:project-applications-assignable-users")

    def test_anonymous_list_forbidden(self):
        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_unauthorized_staff_list_forbidden(self):
        self.client.force_login(self.unauthorized_staff)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authorized_list_returns_paginated_payload(self):
        self.client.force_login(self.viewer)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)
        self.assertEqual(response.data["count"], 1)
        item = response.data["results"][0]
        self.assertEqual(item["reference_code"], self.application.reference_code)
        self.assertNotIn("details", item)
        self.assertNotIn("crm_record_id", item)

    def test_list_filters_and_search(self):
        other = ProjectApplication.objects.create(
            full_name="Carlos Díaz",
            email="carlos@example.com",
            company="Otra Empresa",
            project_name="Hotel Boutique",
            sector="turismo",
            department="cortes",
            investment_range="under_10m",
            status=ProjectApplicationStatus.REVIEWING,
            source="website_project_submission",
        )
        self.client.force_login(self.viewer)
        response = self.client.get(self.list_url, {"status": "reviewing"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["reference_code"], other.reference_code)

        response = self.client.get(self.list_url, {"search": "Empresa Uno"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["reference_code"], self.application.reference_code)

        response = self.client.get(self.list_url, {"sector": "energia"})
        self.assertEqual(response.data["count"], 1)

        response = self.client.get(self.list_url, {"investment_range": "10m_50m"})
        self.assertEqual(response.data["count"], 1)

        response = self.client.get(self.list_url, {"department": "cortes"})
        self.assertEqual(response.data["count"], 2)

    def test_detail_includes_full_fields_without_crm(self):
        self.client.force_login(self.viewer)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reference_code"], self.application.reference_code)
        self.assertEqual(response.data["project_description"], "Parque de generación solar.")
        self.assertNotIn("crm_record_id", response.data)
        self.assertNotIn("crm_synced", response.data)

    def test_patch_status_creates_history(self):
        self.client.force_login(self.assignee)
        response = self.client.patch(self.detail_url, {"status": "reviewing"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, ProjectApplicationStatus.REVIEWING)
        history = ProjectApplicationHistory.objects.filter(application=self.application)
        self.assertTrue(
            history.filter(
                event_type=ProjectApplicationHistoryEventType.STATUS_CHANGED,
                from_status="new",
                to_status="reviewing",
            ).exists()
        )

    def test_patch_assignee_creates_history(self):
        self.client.force_login(self.assignee)
        response = self.client.patch(self.detail_url, {"assigned_to": self.assignee.pk}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.application.refresh_from_db()
        self.assertEqual(self.application.assigned_to_id, self.assignee.pk)
        self.assertTrue(
            ProjectApplicationHistory.objects.filter(
                application=self.application,
                event_type=ProjectApplicationHistoryEventType.ASSIGNED,
            ).exists()
        )

    def test_patch_unassign_creates_history(self):
        self.application.assigned_to = self.assignee
        self.application.save(update_fields=["assigned_to"])
        self.client.force_login(self.assignee)
        response = self.client.patch(self.detail_url, {"assigned_to": None}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.application.refresh_from_db()
        self.assertIsNone(self.application.assigned_to)
        self.assertTrue(
            ProjectApplicationHistory.objects.filter(
                application=self.application,
                event_type=ProjectApplicationHistoryEventType.UNASSIGNED,
            ).exists()
        )

    def test_patch_rejects_arbitrary_fields(self):
        self.client.force_login(self.assignee)
        response = self.client.patch(
            self.detail_url,
            {"email": "hacked@example.com", "company": "Evil Corp"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.application.refresh_from_db()
        self.assertEqual(self.application.email, "ana@example.com")

    def test_note_creation_sets_author_server_side(self):
        self.client.force_login(self.assignee)
        response = self.client.post(self.notes_url, {"body": "Contactar esta semana."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note = ProjectApplicationNote.objects.get(pk=response.data["id"])
        self.assertEqual(note.author_id, self.assignee.pk)
        self.assertEqual(note.body, "Contactar esta semana.")
        self.assertTrue(
            ProjectApplicationHistory.objects.filter(
                application=self.application,
                event_type=ProjectApplicationHistoryEventType.NOTE_ADDED,
            ).exists()
        )

    def test_note_rejects_empty_body(self):
        self.client.force_login(self.assignee)
        response = self.client.post(self.notes_url, {"body": "   "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_history_list_returns_entries(self):
        self.client.force_login(self.assignee)
        self.client.patch(self.detail_url, {"status": "reviewing"}, format="json")
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_assignable_users_protected_and_minimal_payload(self):
        anon = self.client.get(self.assignable_url)
        self.assertIn(anon.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        self.client.force_login(self.viewer)
        response = self.client.get(self.assignable_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == self.assignee.pk for item in response.data))
        self.assertEqual(set(response.data[0].keys()), {"id", "name", "email"})

    @patch("apps.forms.viewsets.enqueue_project_application_webhook")
    def test_public_submission_does_not_expose_internal_endpoints(self, _enqueue):
        public_url = "/api/v1/forms/project-application/"
        response = self.client.post(
            public_url,
            {
                "contact_name": "Test User",
                "email": "test@example.com",
                "phone": "+504 1111-1111",
                "country": "Honduras",
                "company_name": "Test Co",
                "project_name": "Test Project",
                "sector": self.sector.slug,
                "project_description": "Desc",
                "investment_range": "10m_50m",
                "department": self.department.slug,
                "consent": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(set(response.data.keys()), {"reference_code", "status", "created_at"})

        ref = response.data["reference_code"]
        detail = reverse("api-v1:cms-admin:project-applications-detail", kwargs={"reference_code": ref})
        self.assertIn(self.client.get(detail).status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    @patch("apps.forms.services.record_history", side_effect=RuntimeError("history failed"))
    def test_management_update_rolls_back_on_history_failure(self, _record_history):
        self.client.force_login(self.assignee)
        original_status = self.application.status
        response = self.client.patch(self.detail_url, {"status": "reviewing"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, original_status)

    def test_list_response_has_private_cache_control(self):
        self.client.force_login(self.viewer)
        response = self.client.get(self.list_url)
        self.assertEqual(response["Cache-Control"], "no-store, private")
