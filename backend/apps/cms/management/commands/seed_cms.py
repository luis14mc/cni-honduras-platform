from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Orquesta los imports idempotentes del CMS institucional. "
        "No incluye noticias de ejemplo; use el Admin para crear prensa real."
    )

    def handle(self, *args, **options):
        call_command("import_institutional_links")
        self.stdout.write(self.style.SUCCESS("seed_cms completado."))
