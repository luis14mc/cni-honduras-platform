import json
from pathlib import Path

from django.conf import settings
from django.contrib.gis.geos import GEOSException, GEOSGeometry, LineString, MultiLineString
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.geo.models import RoadCorridor

DEFAULT_DATASET = (
    Path(settings.BASE_DIR) / "apps" / "geo" / "data" / "roads" / "red-vial-principal-osm.geojson"
)

# Corridors the CNI highlights. Names override OSM's (often a single stretch name) and are
# refreshed on every import; `is_strategic` and `description` are only set on creation so the
# values edited in the admin survive the import that runs on each deploy.
STRATEGIC_CORRIDORS = {
    "CA-5": ("Corredor Logístico Puerto Cortés–Tegucigalpa–Pacífico", "Puerto Cortés–Tegucigalpa–Pacific Logistics Corridor"),
    "CA-4": (None, None),
    "CA-13": ("Corredor del Caribe", "Caribbean Corridor"),
    "CA-1": ("Carretera Panamericana", "Pan-American Highway"),
    "CA-11": (None, None),
}


def to_multilinestring(geometry: dict) -> MultiLineString:
    geom = GEOSGeometry(json.dumps(geometry), srid=4326)
    if isinstance(geom, LineString):
        geom = MultiLineString(geom, srid=4326)
    if not isinstance(geom, MultiLineString):
        raise CommandError(f"Geometría no lineal: {geom.geom_type}")
    return geom


class Command(BaseCommand):
    help = "Importa idempotentemente los corredores viales (OSM) desde GeoJSON versionado."

    def add_arguments(self, parser):
        parser.add_argument("dataset", nargs="?", type=Path, default=DEFAULT_DATASET)

    @transaction.atomic
    def handle(self, *args, **options):
        dataset = options["dataset"]
        try:
            features = json.loads(dataset.read_text(encoding="utf-8"))["features"]
        except (OSError, ValueError, KeyError) as exc:
            raise CommandError(f"Dataset inválido {dataset.name}: {exc}") from exc

        created = 0
        for feature in features:
            props = feature["properties"]
            ref = props.get("ref", "")
            try:
                geometry = to_multilinestring(feature["geometry"])
            except (GEOSException, ValueError, TypeError) as exc:
                raise CommandError(f"Geometría inválida en {props.get('code')}: {exc}") from exc
            name_es, name_en = STRATEGIC_CORRIDORS.get(ref, (None, None))
            defaults = {
                "ref": ref,
                "name_es": name_es or props["name"],
                "name_en": name_en or props["name"],
                "road_class": props["road_class"],
                "geometry": geometry,
                "length_km": props.get("length_km", 0),
                "source_name": props["source_name"],
                "source_url": props.get("source_url", ""),
            }
            _, was_created = RoadCorridor.objects.update_or_create(
                code=props["code"],
                defaults=defaults,
                create_defaults={**defaults, "is_strategic": ref in STRATEGIC_CORRIDORS},
            )
            created += was_created

        if options["verbosity"]:
            self.stdout.write(
                f"Road corridors: created {created}, updated {len(features) - created}"
            )
