import json
from collections import Counter
from pathlib import Path

from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from apps.geo.models import CNIRegion, Municipality


DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "regiones"

SOURCES = (
    ("macro", "macroregiones.geojson"),
    ("sub", "subregiones.geojson"),
    ("polo", "polos.geojson"),
)

SUB_COLORS = (
    "#7FC731", "#9934CC", "#C96F2C", "#D8EE4F", "#C828C4", "#6423EF", "#4AD896", "#E8129A",
    "#5FEE42", "#91522E", "#6FCBED", "#45DA63", "#DA301F", "#EED67F", "#EC4878", "#888AEE",
)
MACRO_COLORS = ("#2C83B9", "#FCDE9A", "#F39052", "#92CBA8", "#DEF0B4", "#D6191B")
POLO_COLORS = {"Consolidado": "#1B5E20", "Detonante": "#F9A825", "Potencial": "#64B5F6"}

PLACEHOLDER_SLUGS = (
    "region-norte",
    "region-centro",
    "region-sur",
    "region-occidente",
    "region-oriente",
)

# A subregion gets a macroregion parent only when this share of its municipalities
# falls inside it. R-09 and R-11 straddle two macroregions in the source document.
PARENT_MIN_SHARE = 0.8


def _color_for(level: str, code: str, props: dict) -> str:
    if level == "sub":
        return SUB_COLORS[int(code.split("-")[1]) - 1]
    if level == "macro":
        return MACRO_COLORS[int(code.split("-")[1]) - 1]
    return POLO_COLORS.get(props.get("tipo", ""), "")


def _to_multipolygon(geometry: dict) -> MultiPolygon:
    geom = GEOSGeometry(json.dumps(geometry), srid=4326)
    if geom.geom_type == "Polygon":
        return MultiPolygon(geom, srid=4326)
    if geom.geom_type == "MultiPolygon":
        return geom
    raise CommandError(f"Geometría no soportada: {geom.geom_type}")


def _load_features(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        raise CommandError(f"No existe {path}")
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)["features"]


class Command(BaseCommand):
    help = (
        "Importa macroregiones, subregiones y polos de desarrollo desde "
        "apps/geo/data/regiones/ (idempotente, upsert por code)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Muestra lo que se haría sin escribir en la base de datos.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        features_by_level = {level: _load_features(name) for level, name in SOURCES}

        municipalities = {
            municipality.code: municipality
            for municipality in Municipality.objects.select_related("department").exclude(code="")
        }
        if not municipalities:
            raise CommandError("No hay municipios con código en la base. Importe la geografía primero.")

        sub_municipios = {
            feature["properties"]["code"]: feature["properties"].get("municipios", [])
            for feature in features_by_level["sub"]
        }
        macro_by_municipio = {
            geocode: feature["properties"]["code"]
            for feature in features_by_level["macro"]
            for geocode in feature["properties"].get("municipios", [])
        }

        with transaction.atomic():
            placeholders = CNIRegion.objects.filter(slug__in=PLACEHOLDER_SLUGS, is_active=True)
            self.stdout.write(f"Regiones placeholder a desactivar: {placeholders.count()}")
            if not dry_run:
                placeholders.update(is_active=False)

            regions_by_code: dict[str, CNIRegion] = {}
            missing_geocodes: set[str] = set()

            for level, _ in SOURCES:
                for feature in features_by_level[level]:
                    props = feature["properties"]
                    code = props["code"]
                    name = props["name"]

                    if level == "polo":
                        geocodes = [
                            geocode
                            for sub_code in props.get("subregiones", [])
                            for geocode in sub_municipios.get(sub_code, [])
                        ]
                        extra = {
                            "tipo": props.get("tipo"),
                            "subregiones": props.get("subregiones", []),
                            "approximate": bool(props.get("approximate", False)),
                        }
                    else:
                        geocodes = props.get("municipios", [])
                        extra = {"source": props.get("source", "")}

                    parent_code = None
                    if level == "sub":
                        shares = Counter(macro_by_municipio.get(geocode) for geocode in geocodes)
                        top_code, top_count = shares.most_common(1)[0] if shares else (None, 0)
                        if top_code and geocodes and top_count / len(geocodes) >= PARENT_MIN_SHARE:
                            parent_code = top_code

                    linked = [municipalities[g] for g in geocodes if g in municipalities]
                    missing_geocodes.update(g for g in geocodes if g not in municipalities)
                    department_ids = {municipality.department_id for municipality in linked}

                    defaults = {
                        "name": name,
                        "slug": slugify(f"{level}-{name}"),
                        "level": level,
                        "color_hex": _color_for(level, code, props),
                        "geometry": _to_multipolygon(feature["geometry"]),
                        "extra": extra,
                        "is_active": True,
                        "parent": regions_by_code.get(parent_code) if parent_code else None,
                    }

                    if dry_run:
                        self.stdout.write(
                            f"[dry-run] {level} {code} {name}: municipios={len(linked)} "
                            f"departamentos={len(department_ids)} parent={parent_code or '-'}"
                        )
                        continue

                    region, created = CNIRegion.objects.update_or_create(code=code, defaults=defaults)
                    region.municipalities.set(linked)
                    region.departments.set(department_ids)
                    regions_by_code[code] = region
                    self.stdout.write(
                        f"  [{'creada' if created else 'actualizada'}] {level} {code} {name} "
                        f"municipios={len(linked)} parent={parent_code or '-'}"
                    )

            if missing_geocodes:
                self.stdout.write(
                    self.style.WARNING(
                        f"Geocódigos sin municipio en la base ({len(missing_geocodes)}): "
                        f"{', '.join(sorted(missing_geocodes)[:20])}"
                    )
                )

            if dry_run:
                transaction.set_rollback(True)

        counts = {
            level: CNIRegion.objects.filter(level=level, is_active=True, code__isnull=False).count()
            for level, _ in SOURCES
        }
        prefix = "Dry-run finalizado" if dry_run else "Importación finalizada"
        self.stdout.write(
            self.style.SUCCESS(
                f"{prefix}. macro={counts['macro']} sub={counts['sub']} polo={counts['polo']}"
            )
        )
