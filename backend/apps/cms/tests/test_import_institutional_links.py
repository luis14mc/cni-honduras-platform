from django.core.management import call_command
from django.test import TestCase

from apps.cms.models import InstitutionalLink, LinkSection


class ImportInstitutionalLinksCommandTests(TestCase):
    def test_import_is_idempotent(self):
        call_command("import_institutional_links")
        first_count = InstitutionalLink.objects.count()
        home_count = InstitutionalLink.objects.filter(section=LinkSection.HOME_INTEREST).count()
        footer_count = InstitutionalLink.objects.filter(section=LinkSection.FOOTER_EXTERNAL).count()

        call_command("import_institutional_links")
        second_count = InstitutionalLink.objects.count()

        self.assertEqual(first_count, second_count)
        self.assertEqual(home_count, 4)
        self.assertEqual(footer_count, 10)
        self.assertTrue(
            InstitutionalLink.objects.filter(
                section=LinkSection.HOME_INTEREST,
                icon="estudios",
                is_external=False,
            ).exists()
        )

    def test_import_preserves_admin_deactivation(self):
        call_command("import_institutional_links")
        initial_count = InstitutionalLink.objects.count()

        link = InstitutionalLink.objects.get(
            section=LinkSection.HOME_INTEREST,
            icon="guia",
        )
        link.is_active = False
        link.save(update_fields=["is_active"])

        call_command("import_institutional_links")

        link.refresh_from_db()
        self.assertFalse(link.is_active)
        self.assertEqual(InstitutionalLink.objects.count(), initial_count)
        self.assertEqual(
            InstitutionalLink.objects.filter(
                section=LinkSection.HOME_INTEREST,
                icon="guia",
            ).count(),
            1,
        )
