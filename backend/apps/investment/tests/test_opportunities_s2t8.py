"""S2-T8 — Investment opportunities: editorial CMS, metrics, CAPEX, public API."""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.cms.models import PublishStatus
from apps.cms.tests.base import CMSAdminTestCase
from apps.cms.tests.test_cms_editorial import CMSAdminEditorialTestMixin
from apps.investment.models import (
    InvestmentOpportunity,
    OpportunityFundUse,
    OpportunityMetric,
    Sector,
)

User = get_user_model()


class OpportunityS2T8Mixin(CMSAdminEditorialTestMixin):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sector = Sector.objects.create(
            name="Turismo", name_es="Turismo", name_en="Tourism", slug="turismo", is_active=True
        )

    def _grant_publish(self, username: str = "invest") -> None:
        ct = ContentType.objects.get(app_label="cms", model="page")
        perm = Permission.objects.get(content_type=ct, codename="can_publish")
        User.objects.get(username=username).user_permissions.add(perm)


class OpportunityAdminS2T8Tests(OpportunityS2T8Mixin, CMSAdminTestCase):
    def test_create_draft(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T002",
                "title_es": "Complejo Ecoturístico El Cajón",
                "slug": "el-cajon",
                "description_es": "Desarrollo ecoturístico.",
                "sector": self.sector.pk,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        body = res.json()
        self.assertEqual(body["status"], PublishStatus.DRAFT)
        self.assertEqual(body["code"], "OC-CNI-T002")
        self.assertEqual(body["title_es"], "Complejo Ecoturístico El Cajón")

    def test_bilingual_update_preserves_other_locale(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T020",
                "title_es": "Título ES",
                "title_en": "Title EN",
                "description_es": "Desc ES",
                "description_en": "Desc EN",
                "slug": "bilingual-opp",
                "sector": self.sector.pk,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        opp_id = create.json()["id"]

        es_only = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp_id]),
            {"title_es": "Título ES actualizado", "description_es": "Desc ES 2"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(es_only.status_code, status.HTTP_200_OK)
        self.assertEqual(es_only.json()["title_en"], "Title EN")
        self.assertEqual(es_only.json()["description_en"], "Desc EN")

        en_only = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp_id]),
            {"title_en": "Title EN updated", "description_en": "Desc EN 2"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(en_only.status_code, status.HTTP_200_OK)
        self.assertEqual(en_only.json()["title_es"], "Título ES actualizado")
        self.assertEqual(en_only.json()["description_es"], "Desc ES 2")

    def test_metrics_crud_and_ordering(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T021",
                "title_es": "Con métricas",
                "slug": "con-metricas",
                "sector": self.sector.pk,
                "metrics": [
                    {
                        "label_es": "Monto de inversión",
                        "label_en": "Investment amount",
                        "value_es": "USD 6.3M",
                        "value_en": "USD 6.3M",
                        "note_es": "CAPEX base",
                        "order": 0,
                    },
                    {
                        "label_es": "TIR",
                        "label_en": "IRR",
                        "value_es": "14%–19%",
                        "order": 1,
                    },
                ],
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        opp_id = create.json()["id"]
        metrics = create.json()["metrics"]
        self.assertEqual(len(metrics), 2)
        self.assertEqual(metrics[0]["label_es"], "Monto de inversión")
        first_id = metrics[0]["id"]
        second_id = metrics[1]["id"]

        reorder = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp_id]),
            {
                "metrics": [
                    {
                        "id": second_id,
                        "label_es": "TIR",
                        "value_es": "14%–19%",
                        "order": 0,
                    },
                    {
                        "id": first_id,
                        "label_es": "Monto de inversión",
                        "value_es": "USD 6.3M",
                        "note_es": "CAPEX base",
                        "order": 1,
                    },
                ]
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(reorder.status_code, status.HTTP_200_OK)
        ordered = reorder.json()["metrics"]
        self.assertEqual(ordered[0]["label_es"], "TIR")
        self.assertEqual(ordered[1]["label_es"], "Monto de inversión")

        delete_one = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp_id]),
            {
                "metrics": [
                    {
                        "id": second_id,
                        "label_es": "TIR",
                        "value_es": "15%",
                        "order": 0,
                    }
                ]
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(delete_one.status_code, status.HTTP_200_OK)
        self.assertEqual(len(delete_one.json()["metrics"]), 1)
        self.assertEqual(OpportunityMetric.objects.filter(opportunity_id=opp_id).count(), 1)

    def test_fund_uses_ordering(self):
        self._login("invest", "pw-invest-123")
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T022",
                "title_es": "CAPEX",
                "slug": "capex-opp",
                "sector": self.sector.pk,
                "fund_uses": [
                    {
                        "component_es": "Terreno",
                        "component_en": "Land",
                        "amount": "500000.00",
                        "order": 0,
                    },
                    {
                        "component_es": "Construcción de cabañas",
                        "amount": "3100000.00",
                        "order": 1,
                    },
                ],
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        rows = create.json()["fund_uses"]
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["component_es"], "Terreno")
        self.assertEqual(Decimal(rows[0]["amount"]), Decimal("500000.00"))
        self.assertEqual(OpportunityFundUse.objects.filter(opportunity_id=create.json()["id"]).count(), 2)

    def test_publish_sets_published_at(self):
        self._login("invest", "pw-invest-123")
        self._grant_publish()
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T002",
                "title_es": "El Cajón",
                "description_es": "Complejo ecoturístico.",
                "slug": "el-cajon-pub",
                "sector": self.sector.pk,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        opp_id = create.json()["id"]
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-publish", args=[opp_id]),
            {},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["status"], PublishStatus.PUBLISHED)
        self.assertIsNotNone(res.json()["published_at"])

    def test_published_edit_stays_published(self):
        self._login("invest", "pw-invest-123")
        self._grant_publish()
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {
                "code": "OC-CNI-T023",
                "title_es": "Publicada",
                "description_es": "Descripción",
                "slug": "publicada-stay",
                "sector": self.sector.pk,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        opp_id = create.json()["id"]
        self.client.post(
            reverse("api-v1:cms-admin:opportunities-publish", args=[opp_id]),
            {},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        patch = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp_id]),
            {"summary_es": "Resumen actualizado"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(patch.json()["status"], PublishStatus.PUBLISHED)

    def test_invalid_publish_returns_400(self):
        self._login("invest", "pw-invest-123")
        self._grant_publish()
        token = self._csrf()
        create = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {"slug": "incomplete-pub", "title_es": "Sin código"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        opp_id = create.json()["id"]
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-publish", args=[opp_id]),
            {},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_editor_gets_403(self):
        self._login("editor", "pw-editor-123")
        token = self._csrf()
        res = self.client.post(
            reverse("api-v1:cms-admin:opportunities-list"),
            {"title_es": "No", "slug": "no-editor"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        opp = InvestmentOpportunity.all_objects.create(
            title="Privada",
            slug="privada-editor",
            code="OC-CNI-X1",
            sector=self.sector,
            status=PublishStatus.DRAFT,
        )
        res = self.client.patch(
            reverse("api-v1:cms-admin:opportunities-detail", args=[opp.pk]),
            {"title_es": "Hack"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class OpportunityPublicS2T8Tests(OpportunityS2T8Mixin, CMSAdminTestCase):
    def setUp(self):
        super().setUp()
        self.published = InvestmentOpportunity.all_objects.create(
            code="OC-CNI-T002",
            title="El Cajón",
            title_es="El Cajón",
            title_en="El Cajon Resort",
            slug="el-cajon-public",
            description="Descripción ES",
            description_es="Descripción ES",
            description_en="Description EN",
            target_customer_es="Inversionistas hotelero",
            target_customer_en="Hospitality investors",
            market_demand_es="Demanda turística",
            market_demand_en="Tourism demand",
            value_proposition_es="ESG y naturaleza",
            value_proposition_en="ESG and nature",
            summary_es="Resumen breve",
            summary_en="Short summary",
            sector=self.sector,
            status=PublishStatus.PUBLISHED,
            published_at=timezone.now(),
            is_featured=True,
        )
        OpportunityMetric.objects.create(
            opportunity=self.published,
            label="Monto",
            label_es="Monto",
            label_en="Amount",
            value="USD 6.3M",
            value_es="USD 6.3M",
            value_en="USD 6.3M",
            order=0,
        )
        OpportunityFundUse.objects.create(
            opportunity=self.published,
            component="Terreno",
            component_es="Terreno",
            component_en="Land",
            amount=Decimal("500000.00"),
            order=0,
        )
        InvestmentOpportunity.all_objects.create(
            code="OC-CNI-DRAFT",
            title="Borrador",
            slug="draft-hidden",
            sector=self.sector,
            status=PublishStatus.DRAFT,
        )

    def test_public_list_only_published(self):
        res = self.client.get("/api/v1/investment/opportunities/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.json()
        if isinstance(results, dict):
            results = results.get("results", results)
        slugs = {item["slug"] for item in results}
        self.assertIn("el-cajon-public", slugs)
        self.assertNotIn("draft-hidden", slugs)

    def test_public_detail_and_lang(self):
        res_es = self.client.get("/api/v1/investment/opportunities/el-cajon-public/?lang=es")
        self.assertEqual(res_es.status_code, status.HTTP_200_OK)
        body_es = res_es.json()
        self.assertEqual(body_es["code"], "OC-CNI-T002")
        self.assertEqual(body_es["title"], "El Cajón")
        self.assertEqual(body_es["opportunity_description"], "Descripción ES")
        self.assertEqual(len(body_es["metrics"]), 1)
        self.assertEqual(body_es["metrics"][0]["label"], "Monto")
        self.assertEqual(len(body_es["fund_uses"]), 1)
        self.assertIsNotNone(body_es["published_at"])

        res_en = self.client.get("/api/v1/investment/opportunities/el-cajon-public/?lang=en")
        self.assertEqual(res_en.status_code, status.HTTP_200_OK)
        body_en = res_en.json()
        self.assertEqual(body_en["title"], "El Cajon Resort")
        self.assertEqual(body_en["opportunity_description"], "Description EN")
        self.assertEqual(body_en["target_customer"], "Hospitality investors")
        self.assertEqual(body_en["metrics"][0]["label"], "Amount")
        self.assertEqual(body_en["fund_uses"][0]["component"], "Land")
