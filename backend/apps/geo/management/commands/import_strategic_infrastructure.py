import json
from pathlib import Path

from django.conf import settings
from django.contrib.gis.geos import Point
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.geo.models import Department, Municipality, StrategicInfrastructure


DATASET_DIR = Path(settings.BASE_DIR) / "apps" / "geo" / "data" / "strategic_infrastructure"


class Command(BaseCommand):
    help = (
        "Importa idempotentemente infraestructura estratégica versionada. "
        "Sin argumento importa todos los *.json de apps/geo/data/strategic_infrastructure/."
    )

    def add_arguments(self, parser):
        parser.add_argument("dataset", nargs="?", type=Path, default=None)

    @transaction.atomic
    def handle(self, *args, **options):
        datasets = [options["dataset"]] if options["dataset"] else sorted(DATASET_DIR.glob("*.json"))
        if not datasets:
            raise CommandError(f"No hay datasets en {DATASET_DIR}")
        for dataset in datasets:
            self._import_dataset(dataset, options["verbosity"])

    def _import_dataset(self, dataset: Path, verbosity: int):
        try:
            payload = json.loads(dataset.read_text(encoding="utf-8"))
            records = payload["records"]
        except (OSError, ValueError, KeyError) as exc:
            raise CommandError(f"Dataset inválido {dataset.name}: {exc}") from exc

        created = 0
        for record in records:
            point = Point(record["longitude"], record["latitude"], srid=4326)
            municipality = (
                Municipality.objects.filter(geometry__covers=point).order_by("id").first()
            )
            department = Department.objects.filter(geometry__covers=point).order_by("id").first()
            if municipality and (
                not department or municipality.department_id != department.id
            ):
                municipality = None

            _, was_created = StrategicInfrastructure.objects.update_or_create(
                slug=record["slug"],
                defaults={
                    "name": record["name"],
                    "infrastructure_type": record["type"],
                    "location": point,
                    "department": department,
                    "municipality": municipality,
                    "description": record["metadata"].get("description", ""),
                    "operator": record.get("operator", ""),
                    "status": record.get("status", ""),
                    "source_name": record["source_name"],
                    "source_url": record["source_url"],
                    "is_active": True,
                    "metadata": record["metadata"],
                },
            )
            created += was_created

        if verbosity:
            self.stdout.write(f"{dataset.name}: created {created}, updated {len(records) - created}")
