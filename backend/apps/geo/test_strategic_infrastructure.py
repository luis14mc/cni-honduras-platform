from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from apps.geo.models import Department, Municipality, StrategicInfrastructure


SOURCE_URL = "https://ourairports.com/countries/HN/airports.csv"


class StrategicInfrastructureApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        shape = MultiPolygon(
            Polygon(((-88, 14), (-87, 14), (-87, 16), (-88, 16), (-88, 14))),
            srid=4326,
        )
        self.department = Department.objects.create(
            name="Cortés", slug="cortes", geometry=shape
        )
        self.municipality = Municipality.objects.create(
            department=self.department,
            name="San Pedro Sula",
            slug="san-pedro-sula",
            geometry=shape,
        )
        self.airport = self.create_infrastructure(
            name="Aeropuerto", slug="airport", infrastructure_type="airport"
        )
        self.port = self.create_infrastructure(
            name="Puerto", slug="port", infrastructure_type="port"
        )
        self.create_infrastructure(name="Inactivo", slug="inactive", is_active=False)

    def create_infrastructure(self, **overrides):
        values = {
            "name": "Infraestructura",
            "slug": "infrastructure",
            "infrastructure_type": "airport",
            "location": Point(-87.5, 15.2, srid=4326),
            "department": self.department,
            "municipality": self.municipality,
            "source_name": "Fuente",
            "source_url": SOURCE_URL,
        }
        values.update(overrides)
        return StrategicInfrastructure.objects.create(**values)

    def test_geojson_is_active_only_lightweight_and_lon_lat(self):
        response = self.client.get("/api/v1/geo/infrastructure/geojson/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["type"], "FeatureCollection")
        self.assertEqual(len(payload["features"]), 2)
        feature = next(item for item in payload["features"] if item["id"] == self.airport.id)
        self.assertEqual(feature["geometry"]["coordinates"], [-87.5, 15.2])
        self.assertEqual(
            set(feature["properties"]),
            {
                "id", "name", "slug", "infrastructure_type", "department", "municipality",
                "operator", "status", "source_name", "source_url",
            },
        )
        for forbidden in ("metadata", "description", "created_at", "updated_at"):
            self.assertNotIn(forbidden, feature["properties"])
        self.assertEqual(feature["properties"]["department"]["slug"], "cortes")
        self.assertEqual(
            feature["properties"]["municipality"]["slug"], "san-pedro-sula"
        )

    def test_filters_by_type_department_and_municipality(self):
        cases = (
            ("type=port", self.port.id),
            ("department=cortes", self.airport.id),
            ("municipality=san-pedro-sula", self.airport.id),
        )
        for query, expected_id in cases:
            with self.subTest(query=query):
                features = self.client.get(
                    f"/api/v1/geo/infrastructure/geojson/?{query}"
                ).json()["features"]
                self.assertTrue(any(feature["id"] == expected_id for feature in features))

    def test_invalid_type_returns_empty_collection(self):
        response = self.client.get("/api/v1/geo/infrastructure/geojson/?type=rail")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["features"], [])

    def test_list_and_retrieve_are_lightweight(self):
        listed = self.client.get("/api/v1/geo/infrastructure/").json()["results"][0]
        retrieved = self.client.get("/api/v1/geo/infrastructure/airport/").json()
        for payload in (listed, retrieved):
            self.assertNotIn("metadata", payload)
            self.assertNotIn("description", payload)
            self.assertEqual(payload["geometry"]["type"], "Point")

    def test_municipality_must_belong_to_department(self):
        other = Department.objects.create(
            name="Otro",
            slug="otro",
            geometry=self.department.geometry,
        )
        self.airport.department = other
        with self.assertRaises(ValidationError):
            self.airport.full_clean()

        self.airport.department = None
        with self.assertRaises(ValidationError):
            self.airport.full_clean()


class StrategicInfrastructureImporterTests(TestCase):
    def test_import_is_idempotent_and_preserves_source_and_exact_set(self):
        call_command("import_strategic_infrastructure", verbosity=0)
        call_command("import_strategic_infrastructure", verbosity=0)

        records = StrategicInfrastructure.objects.order_by("slug")
        self.assertEqual(records.count(), 8)
        self.assertEqual(
            set(records.values_list("slug", flat=True)),
            {"mhlm", "mhtg", "mhro", "mhsc", "mhlc", "mhnj", "mhut", "mhpl"},
        )
        self.assertFalse(records.exclude(source_name="OurAirports").exists())
        self.assertFalse(records.exclude(source_url=SOURCE_URL).exists())
        self.assertFalse(records.exclude(infrastructure_type="airport").exists())
        self.assertFalse(records.exclude(department=None, municipality=None).exists())
        mhsc = records.get(slug="mhsc")
        self.assertEqual(mhsc.metadata["identifiers"]["ident"], "MHSC")
        self.assertEqual(mhsc.location.coords, (-87.621201, 14.3824))

    def test_import_assigns_boundaries_only_by_geometry_covers(self):
        shape = MultiPolygon(
            Polygon(((-88, 14), (-87, 14), (-87, 16), (-88, 16), (-88, 14))),
            srid=4326,
        )
        department = Department.objects.create(name="Cortés", slug="cortes", geometry=shape)
        municipality = Municipality.objects.create(
            department=department, name="San Pedro Sula", slug="san-pedro-sula", geometry=shape
        )

        call_command("import_strategic_infrastructure", verbosity=0)

        airport = StrategicInfrastructure.objects.get(slug="mhlm")
        self.assertEqual(airport.department, department)
        self.assertEqual(airport.municipality, municipality)
