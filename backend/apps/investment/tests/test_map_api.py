from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from apps.geo.models import Department, Municipality

from ..models import InvestmentProject, ProjectStage, Sector


class InvestmentMapApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        geometry = MultiPolygon(
            Polygon(((-88, 15), (-87, 15), (-87, 16), (-88, 16), (-88, 15)))
        )
        self.department = Department.objects.create(
            name="Cortés", slug="cortes", geometry=geometry, is_active=True
        )
        self.other_department = Department.objects.create(
            name="Yoro", slug="yoro", geometry=geometry, is_active=True
        )
        self.municipality = Municipality.objects.create(
            department=self.department, name="San Pedro", slug="san-pedro", is_active=True
        )
        self.other_municipality = Municipality.objects.create(
            department=self.other_department, name="Yoro", slug="yoro", is_active=True
        )
        self.tourism = Sector.objects.create(name="Turismo", name_es="Turismo", slug="turismo")
        self.energy = Sector.objects.create(name="Energía", name_es="Energía", slug="energia")

    def project(self, slug, **kwargs):
        return InvestmentProject.objects.create(
            title=slug, slug=slug, sector=kwargs.pop("sector", self.tourism), **kwargs
        )

    def test_municipality_department_integrity(self):
        project = self.project(
            "inconsistente", department=self.department, municipality=self.other_municipality
        )
        with self.assertRaises(ValidationError):
            project.full_clean()

    def test_project_filters_and_has_location(self):
        self.project(
            "ubicado", department=self.department, municipality=self.municipality,
            project_stage=ProjectStage.IMPLEMENTING, location=Point(-87.2, 14.1, srid=4326),
        )
        self.project("sin-ubicacion", department=self.department, project_stage=ProjectStage.PROMOTION)
        response = self.client.get(
            "/api/v1/investment/projects/?sector=turismo&department=cortes&municipality=san-pedro&stage=implementing&has_location=true"
        )
        self.assertEqual([item["slug"] for item in response.json()["results"]], ["ubicado"])

    def test_map_summary_sector_and_stage_filters(self):
        self.project(
            "turismo-activo", department=self.department, sector=self.tourism,
            project_stage=ProjectStage.IMPLEMENTING, investment_amount=100, estimated_jobs=4,
        )
        self.project(
            "energia-activo", department=self.department, sector=self.energy,
            project_stage=ProjectStage.IMPLEMENTING, investment_amount=200, estimated_jobs=8,
        )
        self.project(
            "turismo-promocion", department=self.department, sector=self.tourism,
            project_stage=ProjectStage.PROMOTION, investment_amount=300, estimated_jobs=12,
        )
        response = self.client.get("/api/v1/investment/map-summary/?sector=turismo&stage=implementing")
        item = next(row for row in response.json() if row["department"]["slug"] == "cortes")
        self.assertEqual(item["projects_count"], 1)
        self.assertEqual(item["total_investment"], "100.00")
        self.assertEqual(item["estimated_jobs"], 4)
        self.assertEqual([sector["slug"] for sector in item["sectors"]], ["turismo"])

    def test_map_summary_without_filters_includes_public_projects(self):
        self.project(
            "sin-filtro", department=self.department, investment_amount=75, estimated_jobs=3
        )
        response = self.client.get("/api/v1/investment/map-summary/")
        item = next(row for row in response.json() if row["department"]["slug"] == "cortes")
        self.assertEqual(item["projects_count"], 1)
        self.assertEqual(item["total_investment"], "75.00")
        self.assertEqual(item["estimated_jobs"], 3)
