import json
from pathlib import Path

from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from apps.geo.models import Department, Municipality


def _to_multipolygon(geom: GEOSGeometry) -> MultiPolygon:
    if geom.geom_type == "MultiPolygon":
        return geom
    if geom.geom_type == "Polygon":
        return MultiPolygon(geom)
    raise ValueError(f"Unsupported geometry type: {geom.geom_type}")


def _make_valid(geom: GEOSGeometry) -> GEOSGeometry:
    if getattr(geom, "valid", True):
        return geom

    # Prefer GEOS make_valid when available; fall back to buffer(0) for polygons.
    make_valid = getattr(geom, "make_valid", None)
    if callable(make_valid):
        geom = make_valid()
        if geom.valid:
            return geom

    try:
        geom = geom.buffer(0)
    except Exception:
        pass
    return geom


def _normalize_props(props: dict) -> dict:
    out = {}
    for key, value in (props or {}).items():
        try:
            normalized_key = str(key).strip().lower()
        except Exception:
            continue
        out[normalized_key] = value
    return out


def _prop_value(props_norm: dict, key: str):
    value = props_norm.get(key.lower())
    if isinstance(value, str):
        value = value.strip()
    if value == "":
        return None
    return value


def _department_code_from_geocode(geocode: str) -> str:
    digits = "".join(ch for ch in str(geocode).strip() if ch.isdigit())
    return digits[:2]


def _normalized_code(value: str) -> str | None:
    digits = "".join(ch for ch in str(value or "").strip() if ch.isdigit())
    if digits != str(value or "").strip():
        return None
    return digits.lstrip("0") or "0"


def _build_department_indexes() -> tuple[dict[str, Department], dict[str, Department]]:
    exact = {}
    normalized = {}
    for department in Department.objects.all():
        if not department.code:
            continue
        code = str(department.code).strip()
        exact[code] = department
        normalized_code = _normalized_code(code)
        if normalized_code:
            normalized[normalized_code] = department
    return exact, normalized


def _iter_geojson_files(path: Path) -> list[Path]:
    if path.is_file():
        return [path]
    if path.is_dir():
        return sorted(path.glob("hn-municipios-*.geo.json"))
    raise CommandError(f"No existe la ruta: {path}")


class Command(BaseCommand):
    help = "Importa municipios desde archivo o carpeta GeoJSON (crea/actualiza por departamento y slug)."

    def add_arguments(self, parser):
        parser.add_argument("geojson_path", type=str)
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="No escribe en DB; solo valida y muestra logs.",
        )

    def handle(self, *args, **options):
        source_path = Path(options["geojson_path"])
        dry_run = bool(options["dry_run"])
        files = _iter_geojson_files(source_path)

        if not files:
            raise CommandError(
                f"No se encontraron archivos hn-municipios-*.geo.json en: {source_path}"
            )

        department_exact_index, department_normalized_index = _build_department_indexes()
        if not department_exact_index:
            raise CommandError("No hay departamentos con code en DB. Importe departamentos primero.")

        created = 0
        updated = 0
        skipped = 0

        for geojson_file in files:
            self.stdout.write(f"Procesando: {geojson_file}")

            try:
                payload = json.loads(geojson_file.read_text(encoding="utf-8"))
            except Exception as exc:
                raise CommandError(f"No se pudo leer GeoJSON {geojson_file}: {exc}") from exc

            if payload.get("type") != "FeatureCollection":
                raise CommandError(
                    f"GeoJSON inválido en {geojson_file}: se esperaba type=FeatureCollection"
                )

            features = payload.get("features") or []

            for idx, feature in enumerate(features, start=1):
                feature_label = f"{geojson_file.name}#{idx}"

                def _skip(reason: str, name_hint: str | None = None):
                    nonlocal skipped
                    skipped += 1
                    label = f" ({name_hint})" if name_hint else ""
                    self.stderr.write(f"[{feature_label}] skipped: {reason}{label}")

                if (feature or {}).get("type") != "Feature":
                    _skip("Feature inválida")
                    continue

                props_norm = _normalize_props(feature.get("properties") or {})

                name_val = _prop_value(props_norm, "NOMBRE")
                name = str(name_val).strip() if name_val is not None else ""
                if not name:
                    _skip("Sin NOMBRE")
                    continue

                geocode_val = _prop_value(props_norm, "GEOCODIGO")
                code = str(geocode_val).strip() if geocode_val is not None else ""
                if not code:
                    _skip("Sin GEOCODIGO", name)
                    continue

                department_code = _department_code_from_geocode(code)
                if not department_code:
                    _skip(f"GEOCODIGO inválido: {code}", name)
                    continue

                department = department_exact_index.get(department_code)
                if not department:
                    normalized_department_code = _normalized_code(department_code)
                    department = department_normalized_index.get(normalized_department_code)
                if not department:
                    _skip(
                        f"No se encontró Department con code={department_code} "
                        f"(GEOCODIGO={code})",
                        name,
                    )
                    continue

                geometry_dict = feature.get("geometry")
                if not geometry_dict:
                    _skip("Sin geometry", name)
                    continue

                try:
                    geom = GEOSGeometry(json.dumps(geometry_dict))
                except Exception as exc:
                    _skip(f"Geometry inválida: {exc}", name)
                    continue

                geom.srid = geom.srid or 4326
                geom = _make_valid(geom)
                if not getattr(geom, "valid", True):
                    _skip("Geometry no válida tras validar", name)
                    continue

                try:
                    multipolygon = _to_multipolygon(geom)
                except ValueError as exc:
                    _skip(str(exc), name)
                    continue

                centroid = multipolygon.centroid
                center_lat = float(centroid.y) if centroid else None
                center_lng = float(centroid.x) if centroid else None
                slug = slugify(name)

                defaults = {
                    "name": name,
                    "code": code,
                    "description": "",
                    "geometry": multipolygon,
                    "center_lat": center_lat,
                    "center_lng": center_lng,
                    "is_active": True,
                }

                if dry_run:
                    self.stdout.write(
                        f"[{feature_label}] dry-run: would upsert "
                        f"department={department.name} slug={slug} name={name} code={code}"
                    )
                    continue

                obj, was_created = Municipality.objects.update_or_create(
                    department=department,
                    slug=slug,
                    defaults=defaults,
                )
                if was_created:
                    created += 1
                    status = "created"
                else:
                    updated += 1
                    status = "updated"

                self.stdout.write(
                    f"[{feature_label}] {status}: {obj.name} "
                    f"(department={department.name}, slug={obj.slug}, code={obj.code})"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Import finalizado. created={created} updated={updated} skipped={skipped}"
            )
        )
