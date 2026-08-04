from django.core.management.base import BaseCommand

from apps.cms.models import InstitutionalLink, LinkSection
from apps.cms.seed_data.institutional_links import FOOTER_LINKS, HOME_LINKS


class Command(BaseCommand):
    help = "Importa enlaces institucionales confirmados (idempotente por section + icon)."

    def handle(self, *args, **options):
        for order, (icon, title_es, title_en, url, accent) in enumerate(HOME_LINKS, start=1):
            external = url.startswith("http") and "cni.hn" not in url
            self._sync_link(
                section=LinkSection.HOME_INTEREST,
                icon=icon,
                defaults={
                    "title": title_es,
                    "title_es": title_es,
                    "title_en": title_en,
                    "url": url,
                    "is_external": external,
                    "accent_color": accent,
                    "order": order,
                },
            )

        for order, (key, title_es, title_en, url) in enumerate(FOOTER_LINKS, start=1):
            self._sync_link(
                section=LinkSection.FOOTER_EXTERNAL,
                icon=key,
                defaults={
                    "title": title_es,
                    "title_es": title_es,
                    "title_en": title_en,
                    "url": url,
                    "is_external": True,
                    "order": order,
                },
            )

        self.stdout.write(self.style.SUCCESS("Enlaces institucionales sincronizados."))

    def _sync_link(self, *, section: str, icon: str, defaults: dict) -> None:
        link, created = InstitutionalLink.objects.update_or_create(
            section=section,
            icon=icon,
            defaults=defaults,
        )
        if created:
            link.is_active = True
            link.save(update_fields=["is_active"])
