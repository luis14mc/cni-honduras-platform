from unittest.mock import patch

from django.contrib.gis.geos import MultiPolygon, Polygon
from django.contrib import admin
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.forms.admin import ProjectApplicationAdmin
from apps.forms.models import ProjectApplication, ProjectApplicationStatus
from apps.forms.viewsets import build_project_application_webhook_payload
from apps.geo.models import Department, Municipality
from apps.investment.models import Sector


class ProjectSubmissionAPITests(APITestCase):
    url = "/api/v1/forms/project-application/"

    @classmethod
    def setUpTestData(cls):
        geometry = MultiPolygon(Polygon(((0, 0), (0, 1), (1, 1), (0, 0))))
        cls.sector = Sector.objects.create(name="Energía", slug="energia")
        cls.department = Department.objects.create(name="Cortés", slug="cortes", geometry=geometry)
        cls.other_department = Department.objects.create(name="Atlántida", slug="atlantida", geometry=geometry)
        cls.municipality = Municipality.objects.create(
            name="San Pedro Sula", slug="san-pedro-sula", department=cls.department
        )
        cls.other_municipality = Municipality.objects.create(
            name="La Ceiba", slug="la-ceiba", department=cls.other_department
        )

    def setUp(self):
        cache.clear()

    def payload(self, **changes):
        data = {
            "contact_name": " Ana López ",
            "email": "ana@example.com",
            "phone": "+504 9999-9999",
            "country": "Honduras",
            "company_name": "Empresa Uno",
            "website": "https://example.com",
            "project_name": "Proyecto Solar",
            "sector": self.sector.slug,
            "project_description": "Parque de generación solar.",
            "investment_range": "10m_50m",
            "estimated_jobs": 20,
            "department": self.department.slug,
            "municipality": self.municipality.slug,
            "consent": True,
        }
        data.update(changes)
        return data

    @patch("apps.forms.viewsets.enqueue_project_application_webhook")
    def test_valid_submission_has_exact_public_response_and_controlled_values(self, enqueue):
        response = self.client.post(
            self.url, self.payload(status="converted", source="client", crm_synced=True), format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("crm_synced", response.data)
        self.assertIn("source", response.data)
        self.assertIn("status", response.data)

        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(response.data), {"reference_code", "status", "created_at"})
        self.assertRegex(response.data["reference_code"], r"^CNI-PROJ-\d{4}-[0-9A-F]{8}$")
        self.assertEqual(response.data["status"], "new")
        submission = ProjectApplication.objects.get(reference_code=response.data["reference_code"])
        self.assertEqual(submission.source, "website_project_submission")
        self.assertEqual(submission.full_name, "Ana López")
        self.assertEqual(submission.sector, "energia")
        self.assertEqual(submission.department, "cortes")
        self.assertEqual(submission.project_location, "san-pedro-sula")
        self.assertEqual(submission.message, "")
        enqueue.assert_called_once_with(submission)

    def test_required_public_fields_are_enforced(self):
        for field in (
            "contact_name",
            "email",
            "phone",
            "country",
            "company_name",
            "project_name",
            "sector",
            "project_description",
            "investment_range",
            "department",
            "consent",
        ):
            with self.subTest(field=field):
                cache.clear()
                payload = self.payload()
                payload.pop(field)
                response = self.client.post(self.url, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.data)

    def test_only_post_is_allowed(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)
        self.assertEqual(self.client.patch(self.url, {}, format="json").status_code, 405)

    def test_field_validation(self):
        cases = (
            ({"email": "bad"}, "email"),
            ({"consent": False}, "consent"),
            ({"sector": "missing"}, "sector"),
            ({"department": "missing"}, "department"),
            ({"municipality": self.other_municipality.slug}, "municipality"),
            ({"investment_range": "huge"}, "investment_range"),
            ({"estimated_jobs": -1}, "estimated_jobs"),
            ({"website": "not-a-url"}, "website"),
            ({"company_fax": "bot"}, "company_fax"),
        )
        for changes, field in cases:
            with self.subTest(field=field):
                cache.clear()
                response = self.client.post(self.url, self.payload(**changes), format="json")
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.data)

    def test_inactive_relations_are_rejected(self):
        self.sector.is_active = False
        self.sector.save(update_fields=("is_active",))
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("sector", response.data)

        self.sector.is_active = True
        self.sector.save(update_fields=("is_active",))
        cache.clear()
        self.department.is_active = False
        self.department.save(update_fields=("is_active",))
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("department", response.data)

    def test_payload_over_64_kib_is_rejected(self):
        response = self.client.post(
            self.url,
            self.payload(project_description="x" * (65 * 1024)),
            format="json",
        )
        self.assertEqual(response.status_code, 413)

    @override_settings(
        CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
    )
    def test_project_submission_throttle(self):
        for _ in range(5):
            self.assertEqual(self.client.post(self.url, self.payload(), format="json").status_code, 201)
        self.assertEqual(self.client.post(self.url, self.payload(), format="json").status_code, 429)

    def test_webhook_contains_reference_and_canonical_slugs(self):
        response = self.client.post(self.url, self.payload(), format="json")
        submission = ProjectApplication.objects.get(reference_code=response.data["reference_code"])
        payload = build_project_application_webhook_payload(submission)
        self.assertEqual(payload["reference_code"], submission.reference_code)
        self.assertEqual(payload["sector_slug"], "energia")
        self.assertEqual(payload["department_slug"], "cortes")
        self.assertEqual(payload["municipality_slug"], "san-pedro-sula")

    @patch("apps.forms.viewsets.WebhookEvent.objects.create", side_effect=RuntimeError("offline"))
    def test_webhook_failure_does_not_rollback_submission(self, _create):
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ProjectApplication.objects.filter(reference_code=response.data["reference_code"]).exists())


class ProjectSubmissionModelAdminTests(APITestCase):
    def test_reference_is_unique_and_admin_exposes_lead_controls(self):
        field = ProjectApplication._meta.get_field("reference_code")
        self.assertTrue(field.unique)
        self.assertFalse(field.editable)
        model_admin = ProjectApplicationAdmin(ProjectApplication, admin.site)
        self.assertIn("reference_code", model_admin.search_fields)
        self.assertIn("reference_code", model_admin.readonly_fields)
        self.assertIn("sector_ref", model_admin.list_filter)
        self.assertEqual(ProjectApplication._meta.get_field("status").default, ProjectApplicationStatus.NEW)
