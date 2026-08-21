from io import StringIO

from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.management import call_command
from django.test import TestCase

from apps.geo.management.commands.import_departments import _to_multipolygon
from apps.geo.models import Department, Municipality


class ImportHondurasGeoTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.first_output = StringIO()
        call_command("import_honduras_geo", stdout=cls.first_output)

    def test_imports_expected_relationships_geometry_and_srid(self):
        self.assertEqual(Department.objects.filter(is_active=True).count(), 18)
        self.assertEqual(Municipality.objects.filter(is_active=True).count(), 298)

        municipality = Municipality.objects.select_related("department").first()
        self.assertIsNotNone(municipality.department)
        self.assertEqual(municipality.geometry.srid, 4326)
        self.assertIsInstance(municipality.geometry, MultiPolygon)
        self.assertTrue(municipality.geometry.contains(municipality.geometry.point_on_surface))
        self.assertIn("Departments created: 18", self.first_output.getvalue())
        self.assertIn("Municipalities created: 298", self.first_output.getvalue())

    def test_polygon_is_normalized_to_multipolygon(self):
        polygon = Polygon(((0, 0), (1, 0), (1, 1), (0, 0)), srid=4326)
        normalized = _to_multipolygon(polygon)

        self.assertIsInstance(normalized, MultiPolygon)
        self.assertEqual(normalized.srid, 4326)

    def test_second_run_updates_without_duplicates(self):
        output = StringIO()
        call_command("import_honduras_geo", stdout=output)

        self.assertEqual(Department.objects.count(), 18)
        self.assertEqual(Municipality.objects.count(), 298)
        self.assertIn("Departments created: 0", output.getvalue())
        self.assertIn("Departments updated: 18", output.getvalue())
        self.assertIn("Municipalities created: 0", output.getvalue())
        self.assertIn("Municipalities updated: 298", output.getvalue())
