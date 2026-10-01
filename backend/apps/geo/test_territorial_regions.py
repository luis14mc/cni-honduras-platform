from io import StringIO

from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import CNIRegion, Department, Municipality


def _square(x: float, y: float) -> MultiPolygon:
    return MultiPolygon(Polygon(((x, y), (x + 0.1, y), (x + 0.1, y + 0.1), (x, y + 0.1), (x, y))))


class TerritorialRegionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        cortes = Department.objects.create(name="Cortés", slug="cortes", code="05", geometry=_square(-88, 15))
        atlantida = Department.objects.create(
            name="Atlántida", slug="atlantida", code="01", geometry=_square(-87, 15.6)
        )
        self.san_pedro = Municipality.objects.create(
            department=cortes, name="San Pedro Sula", slug="san-pedro-sula", code="050100",
            geometry=_square(-88, 15),
        )
        Municipality.objects.create(
            department=atlantida, name="La Ceiba", slug="la-ceiba", code="010100",
            geometry=_square(-86.8, 15.7),
        )
        self.placeholder = CNIRegion.objects.create(name="Región Norte", slug="region-norte")

    def _import(self, *args: str) -> str:
        out = StringIO()
        call_command("import_territorial_regions", *args, stdout=out)
        return out.getvalue()

    def _features(self, level: str) -> list[dict]:
        response = self.client.get(f"/api/v1/geo/regions/geojson/?level={level}")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["type"], "FeatureCollection")
        return payload["features"]

    def test_geojson_counts_per_level_after_import(self):
        self._import()
        self.assertEqual(len(self._features("sub")), 16)
        self.assertEqual(len(self._features("macro")), 6)
        self.assertEqual(len(self._features("polo")), 8)

    def test_invalid_level_returns_400(self):
        response = self.client.get("/api/v1/geo/regions/geojson/?level=pais")
        self.assertEqual(response.status_code, 400)

    def test_feature_properties_and_geometry(self):
        self._import()
        feature = next(f for f in self._features("sub") if f["properties"]["code"] == "R-01")
        self.assertEqual(feature["properties"]["name"], "Valle de Sula")
        self.assertEqual(feature["properties"]["level"], "sub")
        self.assertEqual(feature["properties"]["color"], "#7FC731")
        self.assertIn(feature["geometry"]["type"], {"Polygon", "MultiPolygon"})

        polo = next(f for f in self._features("polo") if f["properties"]["code"] == "copan")
        self.assertEqual(polo["properties"]["color"], "#F9A825")
        self.assertEqual(polo["properties"]["extra"]["tipo"], "Detonante")
        self.assertTrue(polo["properties"]["extra"]["approximate"])
        self.assertEqual(polo["properties"]["extra"]["subregiones"], ["R-03", "R-14"])

    def test_placeholders_are_deactivated_not_deleted(self):
        self._import()
        self.placeholder.refresh_from_db()
        self.assertFalse(self.placeholder.is_active)

    def test_links_municipalities_departments_and_parent(self):
        self._import()
        sula = CNIRegion.objects.get(code="R-01")
        self.assertIn(self.san_pedro, sula.municipalities.all())
        self.assertEqual(list(sula.departments.values_list("slug", flat=True)), ["cortes"])
        self.assertEqual(sula.parent.code, "M-01")
        self.assertIsNone(CNIRegion.objects.get(code="R-09").parent)
        self.assertIsNone(CNIRegion.objects.get(code="R-11").parent)

        polo = CNIRegion.objects.get(code="san-pedro-sula")
        self.assertEqual(polo.slug, "polo-san-pedro-sula")
        self.assertIn(self.san_pedro, polo.municipalities.all())

    def test_import_is_idempotent(self):
        self._import()
        self._import()
        self.assertEqual(CNIRegion.objects.filter(code__isnull=False).count(), 30)
        self.assertEqual(CNIRegion.objects.get(code="R-01").municipalities.count(), 1)

    def test_dry_run_writes_nothing(self):
        output = self._import("--dry-run")
        self.assertIn("Dry-run", output)
        self.assertFalse(CNIRegion.objects.filter(code__isnull=False).exists())
        self.placeholder.refresh_from_db()
        self.assertTrue(self.placeholder.is_active)
