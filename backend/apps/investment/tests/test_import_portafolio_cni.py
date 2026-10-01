from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from apps.cms.models import PublishStatus
from apps.geo.models import CNIRegion, Department, Municipality
from apps.investment.models import InvestmentOpportunity, InvestmentProject, ProjectStage
from apps.media_library.models import MediaAsset

TINY_WEBP = (
    b"RIFF$\x00\x00\x00WEBPVP8 \x18\x00\x00\x00"
    b"0\x01\x00\x9d\x01*\x01\x00\x01\x00\x00\xc0"
    b"\x00\xfe\x01\x80\x00\x00"
)


class ImportPortafolioCniTests(TestCase):
    def setUp(self):
        geometry = MultiPolygon(Polygon(((-88, 15), (-87, 15), (-87, 16), (-88, 16), (-88, 15))))
        self.department = Department.objects.create(
            name="Cortés", slug="cortes", code="05", geometry=geometry, is_active=True
        )
        self.municipality = Municipality.objects.create(
            department=self.department,
            name="San Pedro Sula",
            slug="san-pedro-sula",
            code="050100",
            geometry=geometry,
            is_active=True,
        )
        self.macro = CNIRegion.objects.create(
            name="Valle de Sula", slug="macro-sula", code="M-01", level="macro"
        )
        self.sub = CNIRegion.objects.create(
            name="Valle de Sula",
            slug="valle-de-sula",
            code="R-01",
            level="sub",
            parent=self.macro,
        )
        self.tmpdir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmpdir, True)
        image_dir = self.tmpdir / "imagenes" / "oportunidades"
        image_dir.mkdir(parents=True)
        (image_dir / "demo.webp").write_bytes(TINY_WEBP)
        (image_dir / "otra.webp").write_bytes(TINY_WEBP + b"x")
        self.seed_path = self.tmpdir / "cni-portafolio-seed.json"
        self.seed_path.write_text(
            json.dumps(
                {
                    "oportunidades": [
                        {
                            "kind": "oportunidad",
                            "code": "OC-CNI-A007",
                            "title": "Aguacate Hass",
                            "slug": "aguacate-hass",
                            "sector": "agroindustria",
                            "location_text": "Valle de Sula",
                            "description": "Desarrollo agroindustrial de exportación.",
                            "amount_text": "USD 5.6 MM",
                            "amount_usd": 5600000,
                            "amount_notes": ["CAPEX"],
                            "phase": "Oportunidad / Preinversión",
                            "phase_detail": "Escalabilidad en 3 fases",
                            "investment_type": "Socio estratégico",
                            "image": "imagenes/oportunidades/demo.webp",
                            "locations": [
                                {"municipio_geocode": "050100", "lng": -88.07, "lat": 15.50}
                            ],
                            "subregion": "R-01",
                        }
                    ],
                    "proyectos": [
                        {
                            "kind": "proyecto",
                            "code": "FP-CNI-I009",
                            "title": "Distrito Palmerola",
                            "slug": "distrito-palmerola",
                            "sector": "infraestructura",
                            "location_text": "Comayagua",
                            "description": "Distrito aeroportuario.",
                            "amount_text": "USD 1,702.40 MM",
                            "amount_usd": 1702400000,
                            "amount_notes": [],
                            "phase": "Fase 3",
                            "phase_detail": "Ejecución y Monitoreo",
                            "investment_type": "APP",
                            "image": "imagenes/oportunidades/otra.webp",
                            "locations": [
                                {"municipio_geocode": "050100", "lng": -87.62, "lat": 14.38},
                                {"municipio_geocode": "030100", "lng": -87.4, "lat": 14.2},
                            ],
                            "subregion": "R-01",
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )

    def test_import_creates_maps_phase_and_is_idempotent(self):
        call_command("import_portafolio_cni", dataset=str(self.seed_path), verbosity=0)
        opportunity = InvestmentOpportunity.objects.get(slug="aguacate-hass")
        project = InvestmentProject.objects.get(slug="distrito-palmerola")

        self.assertEqual(opportunity.status, PublishStatus.PUBLISHED)
        self.assertEqual(opportunity.lifecycle_status, "open")
        self.assertEqual(opportunity.summary, "Desarrollo agroindustrial de exportación.")
        self.assertEqual(opportunity.amount_text, "USD 5.6 MM")
        self.assertEqual(opportunity.phase, "Oportunidad / Preinversión")
        self.assertEqual(opportunity.cover_image.original_filename, "demo.webp")
        self.assertEqual(opportunity.department_id, self.department.id)
        self.assertEqual(opportunity.region_id, self.sub.id)
        self.assertAlmostEqual(opportunity.location.x, -88.07, places=4)

        self.assertEqual(project.code, "FP-CNI-I009")
        self.assertEqual(project.project_stage, ProjectStage.IMPLEMENTING)
        self.assertTrue(project.is_public)
        self.assertEqual(project.municipality_id, self.municipality.id)
        self.assertEqual(len(project.extra_locations), 1)
        self.assertEqual(project.extra_locations[0]["municipio_geocode"], "030100")
        self.assertEqual(MediaAsset.objects.count(), 2)

        first_image_id = opportunity.cover_image_id
        call_command("import_portafolio_cni", dataset=str(self.seed_path), verbosity=0)
        opportunity.refresh_from_db()
        self.assertEqual(InvestmentOpportunity.objects.count(), 1)
        self.assertEqual(InvestmentProject.objects.count(), 1)
        self.assertEqual(MediaAsset.objects.count(), 2)
        self.assertEqual(opportunity.cover_image_id, first_image_id)

    def test_public_api_exposes_cover_and_ficha_fields(self):
        call_command("import_portafolio_cni", dataset=str(self.seed_path), verbosity=0)
        client = APIClient()
        opportunities = client.get("/api/v1/investment/opportunities/").json()["results"]
        projects = client.get("/api/v1/investment/projects/").json()["results"]
        self.assertEqual(len(opportunities), 1)
        self.assertEqual(len(projects), 1)
        self.assertTrue(opportunities[0]["cover_image_url"])
        self.assertEqual(opportunities[0]["amount_text"], "USD 5.6 MM")
        self.assertEqual(opportunities[0]["region"]["code"], "R-01")
        self.assertEqual(projects[0]["code"], "FP-CNI-I009")
        self.assertEqual(projects[0]["phase"], "Fase 3")
        self.assertTrue(projects[0]["cover_image_url"])
