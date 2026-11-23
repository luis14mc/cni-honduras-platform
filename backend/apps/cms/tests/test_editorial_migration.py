from io import StringIO
import json
from unittest.mock import patch

from django.contrib.auth.models import Group
from django.core.management import call_command
from django.test import TestCase

from apps.cms.models import SiteBanner


class EditorialMigrationTests(TestCase):
    def setUp(self):
        self.banner = SiteBanner.objects.create(
            placement="site_top",
            title_es="Aviso",
            title_en="Notice",
        )

    @patch("apps.cms.management.commands.migrate_editorial_to_strapi.StrapiClient")
    def test_audit_does_not_write_and_distinguishes_missing_locales(self, client_class):
        client = client_class.return_value
        client.find.side_effect = [
            {"documentId": "banner1"},
            None,
        ]
        output = StringIO()

        call_command("migrate_editorial_to_strapi", stdout=output)

        counts = json.loads(output.getvalue())["counts"]
        self.assertEqual(counts["banners:es"]["existing"], 1)
        self.assertEqual(counts["banners:en"]["missing"], 1)
        client.request.assert_not_called()
        client.upload.assert_not_called()

    @patch("apps.cms.management.commands.migrate_editorial_to_strapi.StrapiClient")
    def test_apply_adds_missing_locale_as_draft_and_reuses_existing_document(self, client_class):
        client = client_class.return_value
        existing = {"documentId": "banner1"}
        client.find.side_effect = [existing, None, existing, existing]
        output = StringIO()

        call_command("migrate_editorial_to_strapi", apply=True, stdout=output)

        self.assertEqual(client.request.call_count, 1)
        (path, query), kwargs = client.request.call_args
        self.assertEqual(path, "/api/banners/banner1")
        self.assertEqual(query, {"locale": "en", "status": "draft"})
        self.assertEqual(kwargs["method"], "PUT")
        self.assertEqual(kwargs["data"]["legacy_key"], f"django-banner-{self.banner.pk}")
        self.assertEqual(kwargs["data"]["title"], "Notice")
        self.assertEqual(json.loads(output.getvalue())["counts"]["banners:en"]["created"], 1)



class FormReviewersRoleTests(TestCase):
    def test_reviewers_receive_only_form_view_permissions(self):
        for _ in range(2):
            call_command("seed_cms_roles", stdout=StringIO(), stderr=StringIO())

        group = Group.objects.get(name="Revisores de formularios CNI")
        self.assertSetEqual(set(group.permissions.values_list("codename", flat=True)), {
            "view_projectapplication", "view_contactsubmission",
            "view_advisoryrequest", "view_resourcedownloadlead",
        })
