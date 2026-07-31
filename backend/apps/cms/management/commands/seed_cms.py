from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Orquesta los imports idempotentes del CMS institucional."

    def handle(self, *args, **options):
        call_command("import_press_content")
        self.stdout.write(self.style.SUCCESS("seed_cms completado."))
