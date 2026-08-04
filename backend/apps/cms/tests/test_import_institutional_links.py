from django.test import TestCase

from apps.cms.models import InstitutionalLink, LinkSection


class ImportInstitutionalLinksCommandTests(TestCase):
    def test_import_is_idempotent(self):
        from django.core.management import call_command

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
