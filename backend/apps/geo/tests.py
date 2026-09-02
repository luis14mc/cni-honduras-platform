from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from django.test import TestCase
from rest_framework.test import APIClient

from apps.investment.models import InvestmentProject, Sector

from .models import Department, Municipality


class GeoContractApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        polygon = Polygon(((-88, 15), (-87, 15), (-87, 16), (-88, 16), (-88, 15)))
        self.department = Department.objects.create(
            name="Cortés", slug="cortes", code="05", geometry=MultiPolygon(polygon),
            center_lat=15.5, center_lng=-87.5, is_active=True,
        )
        self.other_department = Department.objects.create(
            name="Atlántida", slug="atlantida", geometry=MultiPolygon(polygon), is_active=True,
        )
        self.inactive_department = Department.objects.create(
            name="Inactivo", slug="inactivo", geometry=MultiPolygon(polygon), is_active=False,
        )
        self.municipality = Municipality.objects.create(
            department=self.department, name="San Pedro Sula", slug="san-pedro-sula",
            code="0501", geometry=MultiPolygon(polygon), center_lat=15.5, center_lng=-88.0,
        )
        Municipality.objects.create(
            department=self.other_department, name="La Ceiba", slug="la-ceiba",
            geometry=MultiPolygon(polygon),
        )
        self.sector = Sector.objects.create(name="Turismo", name_es="Turismo", slug="turismo")

    def test_departments_geojson_contract_and_active_filter(self):
        response = self.client.get("/api/v1/geo/departments/geojson/")
        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["type"], "FeatureCollection")
        self.assertEqual(len(payload["features"]), 2)
        feature = next(feature for feature in payload["features"] if feature["id"] == self.department.id)
        self.assertEqual(feature["type"], "Feature")
        self.assertEqual(feature["id"], self.department.id)
        self.assertEqual(feature["geometry"]["type"], "MultiPolygon")
        self.assertEqual(feature["properties"]["center_lng"], -87.5)

    def test_municipalities_geojson_filters_by_department(self):
        response = self.client.get("/api/v1/geo/municipalities/geojson/?department=cortes")
        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(payload["features"]), 1)
        self.assertEqual(payload["features"][0]["properties"]["department_slug"], "cortes")
        self.assertEqual(payload["features"][0]["properties"]["department"], "cortes")

    def test_municipalities_geojson_keeps_legacy_unfiltered_contract(self):
        response = self.client.get("/api/v1/geo/municipalities/geojson/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["features"]), 2)

    def test_project_location_is_geojson_lon_lat_and_null_is_supported(self):
        project = InvestmentProject.objects.create(
            title="Puerto", slug="puerto", sector=self.sector, department=self.department,
            municipality=self.municipality, location=Point(-87.2, 14.1, srid=4326),
        )
        InvestmentProject.objects.create(title="Sin punto", slug="sin-punto", sector=self.sector)
        response = self.client.get("/api/v1/investment/projects/")
        projects = {item["slug"]: item for item in response.json()["results"]}
        self.assertEqual(projects[project.slug]["location"]["coordinates"], [-87.2, 14.1])
        self.assertEqual(projects[project.slug]["latitude"], 14.1)
        self.assertEqual(projects[project.slug]["longitude"], -87.2)
        self.assertIsNone(projects["sin-punto"]["location"])
