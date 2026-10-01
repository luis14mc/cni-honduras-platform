import json
import tempfile
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from apps.geo.models import RoadCorridor

URL = "/api/v1/geo/roads/geojson/"


def feature(code, ref, road_class, geometry, name="Carretera"):
    return {
        "type": "Feature",
        "properties": {
            "code": code, "ref": ref, "name": name, "road_class": road_class, "length_km": 12,
            "source_name": "OpenStreetMap (ODbL)",
            "source_url": "https://www.openstreetmap.org/copyright",
        },
        "geometry": geometry,
    }


LINE = {"type": "LineString", "coordinates": [[-87.9, 15.8], [-87.9, 15.5], [-87.2, 14.1]]}
MULTI = {"type": "MultiLineString", "coordinates": [[[-88.0, 15.4], [-87.5, 15.6]], [[-87.5, 15.6], [-86.8, 15.7]]]}


class RoadDatasetTestCase(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.dataset = Path(self.tmp.name) / "roads.geojson"
        self.write_dataset([
            feature("ca-5", "CA-5", "primaria", LINE, name="Carretera CA-5"),
            feature("ca-13", "CA-13", "primaria", MULTI),
            feature("rn-15", "RN-15", "secundaria", LINE),
        ])

    def write_dataset(self, features):
        self.dataset.write_text(json.dumps({"type": "FeatureCollection", "features": features}))

    def import_roads(self):
        call_command("import_road_corridors", self.dataset, verbosity=0)


class RoadCorridorImportTests(RoadDatasetTestCase):
    def test_import_creates_corridors_as_multilinestrings_and_flags_strategic(self):
        self.import_roads()

        self.assertEqual(RoadCorridor.objects.count(), 3)
        ca5 = RoadCorridor.objects.get(code="ca-5")
        self.assertEqual(ca5.geometry.geom_type, "MultiLineString")
        self.assertEqual(ca5.geometry.srid, 4326)
        self.assertTrue(ca5.is_strategic)
        self.assertEqual(ca5.name_es, "Corredor Logístico Puerto Cortés–Tegucigalpa–Pacífico")
        self.assertEqual(ca5.name_en, "Puerto Cortés–Tegucigalpa–Pacific Logistics Corridor")
        self.assertEqual(RoadCorridor.objects.get(code="ca-13").geometry.num_geom, 2)
        self.assertFalse(RoadCorridor.objects.get(code="rn-15").is_strategic)

    def test_import_is_idempotent_and_preserves_admin_edits(self):
        self.import_roads()
        RoadCorridor.objects.filter(code="ca-5").update(
            is_strategic=False, description_es="Editado por el CNI", description_en="Edited by CNI"
        )
        RoadCorridor.objects.filter(code="rn-15").update(is_strategic=True)

        self.import_roads()

        self.assertEqual(RoadCorridor.objects.count(), 3)
        ca5 = RoadCorridor.objects.get(code="ca-5")
        self.assertFalse(ca5.is_strategic)
        self.assertEqual(ca5.description_es, "Editado por el CNI")
        self.assertTrue(RoadCorridor.objects.get(code="rn-15").is_strategic)

    def test_versioned_dataset_imports(self):
        call_command("import_road_corridors", verbosity=0)

        refs = set(RoadCorridor.objects.values_list("ref", flat=True))
        self.assertTrue({"CA-1", "CA-4", "CA-5", "CA-11", "CA-13"} <= refs)
        self.assertEqual(
            set(RoadCorridor.objects.filter(is_strategic=True).values_list("ref", flat=True)),
            {"CA-1", "CA-4", "CA-5", "CA-11", "CA-13"},
        )
        self.assertFalse(RoadCorridor.objects.exclude(ref__regex=r"^(CA|RN)-\d+[A-Z]?$").exists())


class RoadCorridorApiTests(RoadDatasetTestCase):
    def setUp(self):
        super().setUp()
        self.import_roads()
        RoadCorridor.objects.filter(code="ca-5").update(description_es="Canal seco", description_en="Dry canal")
        self.client = APIClient()

    def codes(self, query=""):
        response = self.client.get(f"{URL}{query}")
        self.assertEqual(response.status_code, 200)
        return {item["properties"]["code"] for item in response.json()["features"]}

    def test_geojson_shape_cache_and_language(self):
        response = self.client.get(f"{URL}?lang=en")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "public, max-age=3600")
        payload = response.json()
        self.assertEqual(payload["type"], "FeatureCollection")
        ca5 = next(item for item in payload["features"] if item["properties"]["code"] == "ca-5")
        self.assertEqual(ca5["geometry"]["type"], "MultiLineString")
        self.assertEqual(ca5["properties"]["name"], "Puerto Cortés–Tegucigalpa–Pacific Logistics Corridor")
        self.assertEqual(ca5["properties"]["description"], "Dry canal")
        self.assertEqual(
            set(ca5["properties"]),
            {"id", "code", "ref", "name", "road_class", "length_km", "is_strategic", "description",
             "source_name", "source_url"},
        )
        es = self.client.get(URL).json()["features"]
        self.assertEqual(next(i for i in es if i["properties"]["code"] == "ca-5")["properties"]["description"], "Canal seco")

    def test_filters_by_class_and_strategic(self):
        self.assertEqual(self.codes(), {"ca-5", "ca-13", "rn-15"})
        self.assertEqual(self.codes("?class=primaria"), {"ca-5", "ca-13"})
        self.assertEqual(self.codes("?class=secundaria"), {"rn-15"})
        self.assertEqual(self.codes("?strategic=true"), {"ca-5", "ca-13"})
        self.assertEqual(self.codes("?class=secundaria&strategic=false"), {"rn-15"})

    def test_inactive_corridors_are_hidden(self):
        RoadCorridor.objects.filter(code="rn-15").update(is_active=False)
        self.assertEqual(self.codes(), {"ca-5", "ca-13"})

    def test_invalid_filters_return_400(self):
        for query in ("?class=terciaria", "?class=", "?strategic=yes"):
            with self.subTest(query=query):
                self.assertEqual(self.client.get(f"{URL}{query}").status_code, 400)
