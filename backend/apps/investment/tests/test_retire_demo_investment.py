from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from apps.cms.models import PublishStatus
from apps.investment.demo_slugs import DEMO_INVESTMENT_SLUGS
from apps.investment.models import (
    InvestmentOpportunity,
    InvestmentProject,
    Sector,
    SuccessStory,
)


class RetireDemoInvestmentTests(TestCase):
    def setUp(self):
        self.sector = Sector.objects.create(
            name="Agroindustria", name_es="Agroindustria", slug="agroindustria"
        )
        now = timezone.now()
        InvestmentOpportunity.all_objects.create(
            title="Planta de procesamiento de palma africana",
            slug="planta-procesamiento-palma-africana",
            sector=self.sector,
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        InvestmentProject.objects.create(
            title="Hotel de convenciones Tegucigalpa",
            slug="hotel-convenciones-tegucigalpa",
            sector=self.sector,
            is_public=True,
        )
        SuccessStory.all_objects.create(
            title="Textiles del Valle",
            slug="textiles-del-valle",
            sector=self.sector,
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )
        InvestmentOpportunity.all_objects.create(
            title="Aguacate Hass",
            slug="aguacate-hass-fresco-y-aceite-extra-virgen",
            sector=self.sector,
            status=PublishStatus.PUBLISHED,
            published_at=now,
        )

    def test_unpublishes_demo_records_without_deleting(self):
        call_command("retire_demo_investment", verbosity=0)

        opportunity = InvestmentOpportunity.all_objects.get(
            slug="planta-procesamiento-palma-africana"
        )
        project = InvestmentProject.objects.get(slug="hotel-convenciones-tegucigalpa")
        story = SuccessStory.all_objects.get(slug="textiles-del-valle")
        keep = InvestmentOpportunity.all_objects.get(
            slug="aguacate-hass-fresco-y-aceite-extra-virgen"
        )

        self.assertEqual(opportunity.status, PublishStatus.DRAFT)
        self.assertFalse(project.is_public)
        self.assertEqual(story.status, PublishStatus.DRAFT)
        self.assertEqual(keep.status, PublishStatus.PUBLISHED)
        self.assertTrue(
            InvestmentOpportunity.all_objects.filter(
                slug="planta-procesamiento-palma-africana"
            ).exists()
        )

    def test_is_idempotent(self):
        call_command("retire_demo_investment", verbosity=0)
        call_command("retire_demo_investment", verbosity=0)
        self.assertEqual(
            InvestmentOpportunity.all_objects.get(
                slug="planta-procesamiento-palma-africana"
            ).status,
            PublishStatus.DRAFT,
        )
        self.assertFalse(
            InvestmentProject.objects.get(slug="hotel-convenciones-tegucigalpa").is_public
        )

    def test_covers_the_documented_demo_slugs(self):
        expected = {
            "planta-procesamiento-palma-africana",
            "resort-eco-turistico-costa-norte",
            "parque-solar-fotovoltaico-regional",
            "centro-manufactura-textil-exportacion",
            "modernizacion-corredor-logistico",
            "expansion-planta-agroindustrial-sula",
            "hotel-convenciones-tegucigalpa",
            "parque-industrial-logistico-oriente",
            "agroexportadora-del-atlantico",
            "textiles-del-valle",
            "energia-solar-copan",
        }
        self.assertEqual(set(DEMO_INVESTMENT_SLUGS), expected)
