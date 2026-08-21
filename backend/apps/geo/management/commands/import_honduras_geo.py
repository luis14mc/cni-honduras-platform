from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.geo.models import Department, Municipality


EXPECTED_DEPARTMENTS = 18
EXPECTED_MUNICIPALITIES = 298
DEFAULT_DATA_DIR = Path(settings.BASE_DIR) / "apps" / "geo" / "data" / "honduras"


class Command(BaseCommand):
    help = "Carga idempotentemente los límites oficiales versionados de Honduras."

    def add_arguments(self, parser):
        parser.add_argument(
            "--data-dir",
            type=Path,
            default=DEFAULT_DATA_DIR,
            help="Directorio con los GeoJSON de SEFINHN-UIT/hn-geo.",
        )

    def handle(self, *args, **options):
        data_dir = options["data_dir"].resolve()
        departments_file = data_dir / "hn-deparments.geo.json"
        municipality_files = sorted(data_dir.glob("hn-municipios-*.geo.json"))
        if not departments_file.is_file() or len(municipality_files) != EXPECTED_DEPARTMENTS:
            raise CommandError(
                "Dataset incompleto: se requiere hn-deparments.geo.json y 18 archivos municipales."
            )

        department_slugs_before = set(Department.objects.values_list("slug", flat=True))
        municipality_keys_before = set(
            Municipality.objects.values_list("department_id", "slug")
        )

        command_output = StringIO()
        try:
            with transaction.atomic(), redirect_stdout(command_output), redirect_stderr(command_output):
                call_command("import_departments", str(departments_file), verbosity=0)
                call_command("import_municipalities", str(data_dir), verbosity=0)

                department_count = Department.objects.filter(is_active=True).count()
                municipality_count = Municipality.objects.filter(is_active=True).count()
                if department_count != EXPECTED_DEPARTMENTS:
                    raise CommandError(
                        f"Expected {EXPECTED_DEPARTMENTS} active departments, found {department_count}."
                    )
                if municipality_count != EXPECTED_MUNICIPALITIES:
                    raise CommandError(
                        f"Expected {EXPECTED_MUNICIPALITIES} active municipalities, found {municipality_count}."
                    )
        except CommandError:
            raise
        except Exception as exc:
            raise CommandError(f"No se pudo importar la geografía de Honduras: {exc}") from exc

        department_slugs = set(
            Department.objects.filter(is_active=True).values_list("slug", flat=True)
        )
        municipality_keys = set(
            Municipality.objects.filter(is_active=True).values_list("department_id", "slug")
        )
        departments_created = len(department_slugs - department_slugs_before)
        municipalities_created = len(municipality_keys - municipality_keys_before)

        self.stdout.write(f"Departments created: {departments_created}")
        self.stdout.write(f"Departments updated: {EXPECTED_DEPARTMENTS - departments_created}")
        self.stdout.write(f"Municipalities created: {municipalities_created}")
        self.stdout.write(f"Municipalities updated: {EXPECTED_MUNICIPALITIES - municipalities_created}")
        self.stdout.write(self.style.SUCCESS("Honduras geographic seed validated successfully."))
