import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon

from apps.geo.models import Department


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
    # Case-insensitive lookup + tolerate non-string keys
    out = {}
    for k, v in (props or {}).items():
        try:
            key = str(k).strip().lower()
        except Exception:
            continue
        out[key] = v
    return out


def _first_value(props_norm: dict, candidates: list[str]):
    for key in candidates:
        val = props_norm.get(key.lower())
        if val is None:
            continue
        if isinstance(val, str):
            val = val.strip()
        if val == "":
            continue
        return val
    return None


def _as_bool(val, default=True) -> bool:
    if val is None:
        return default
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return bool(val)
    s = str(val).strip().lower()
    if s in {"1", "true", "t", "yes", "y", "si", "sí"}:
        return True
    if s in {"0", "false", "f", "no", "n"}:
        return False
    return default


class Command(BaseCommand):
    help = "Importa departamentos desde un archivo GeoJSON (crea/actualiza por slug)."

    def add_arguments(self, parser):
        parser.add_argument("geojson_path", type=str)
        parser.add_argument(
            "--name-fields",
            type=str,
            default="name,NAME,nombre,NOMBRE",
            help="Lista CSV de fields candidatos para el nombre.",
        )
        parser.add_argument(
            "--code-fields",
            type=str,
            default="code,CODE,COD_DPT,CODIGO,COD_DTO,COD_DEP",
            help="Lista CSV de fields candidatos para el código (ej. COD_DPT).",
        )
        parser.add_argument(
            "--slug-fields",
            type=str,
            default="slug,SLUG",
            help="Lista CSV de fields candidatos para slug (si no, se genera desde name).",
        )
        parser.add_argument(
            "--description-fields",
            type=str,
            default="description,DESCRIPTION,descripcion,DESCRIPCION",
            help="Lista CSV de fields candidatos para descripción.",
        )
        parser.add_argument(
            "--require-code",
            action="store_true",
            default=True,
            help="Si está activo (default), omite features sin código (útil para ignorar lagos/zonas).",
        )
        parser.add_argument(
            "--no-require-code",
            dest="require_code",
            action="store_false",
            help="Permite importar incluso si no hay código.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="No escribe en DB; solo valida y muestra logs.",
        )

    def handle(self, *args, **options):
        geojson_path = Path(options["geojson_path"])
        if not geojson_path.exists():
            raise CommandError(f"No existe el archivo: {geojson_path}")

        payload = json.loads(geojson_path.read_text(encoding="utf-8"))
        if payload.get("type") != "FeatureCollection":
            raise CommandError("GeoJSON inválido: se esperaba type=FeatureCollection")

        name_fields = [x.strip() for x in (options["name_fields"] or "").split(",") if x.strip()]
        code_fields = [x.strip() for x in (options["code_fields"] or "").split(",") if x.strip()]
        slug_fields = [x.strip() for x in (options["slug_fields"] or "").split(",") if x.strip()]
        description_fields = [
            x.strip() for x in (options["description_fields"] or "").split(",") if x.strip()
        ]
        require_code = bool(options["require_code"])
        dry_run = bool(options["dry_run"])

        features = payload.get("features") or []
        created = 0
        updated = 0
        skipped = 0

        for idx, feature in enumerate(features, start=1):
            def _skip(reason: str, name_hint: str | None = None):
                nonlocal skipped
                skipped += 1
                label = f" ({name_hint})" if name_hint else ""
                self.stderr.write(f"[{idx}] skipped: {reason}{label}")

            if (feature or {}).get("type") != "Feature":
                _skip("Feature inválida")
                continue

            props_norm = _normalize_props(feature.get("properties") or {})

            name_val = _first_value(props_norm, name_fields)
            name = str(name_val).strip() if name_val is not None else ""
            if not name:
                _skip("Sin nombre (revisa --name-fields)")
                continue

            slug_val = _first_value(props_norm, slug_fields)
            slug = str(slug_val).strip() if slug_val is not None else slugify(name)

            code_val = _first_value(props_norm, code_fields)
            code = str(code_val).strip() if code_val is not None else ""
            if require_code and not code:
                # Heurística principal para ignorar features no-departamento (p.ej. "Lago de Yojoa")
                _skip("Sin código (no parece departamento). Usa --no-require-code si aplica.", name)
                continue

            desc_val = _first_value(props_norm, description_fields)
            description = str(desc_val).strip() if desc_val is not None else ""

            is_active = _as_bool(props_norm.get("is_active"), default=True)

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
                mp = _to_multipolygon(geom)
            except ValueError as exc:
                _skip(str(exc), name)
                continue

            centroid = mp.centroid
            center_lat = float(centroid.y) if centroid else None
            center_lng = float(centroid.x) if centroid else None

            defaults = {
                "name": name,
                "code": code,
                "description": description,
                "geometry": mp,
                "center_lat": center_lat,
                "center_lng": center_lng,
                "is_active": is_active,
            }

            if dry_run:
                self.stdout.write(
                    f"[{idx}] dry-run: would upsert slug={slug} name={name} code={code}"
                )
                continue

            obj, was_created = Department.objects.update_or_create(slug=slug, defaults=defaults)
            if was_created:
                created += 1
                status = "created"
            else:
                updated += 1
                status = "updated"

            self.stdout.write(f"[{idx}] {status}: {obj.name} (slug={obj.slug}, code={obj.code})")

        self.stdout.write(
            self.style.SUCCESS(
                f"Import finalizado. created={created} updated={updated} skipped={skipped}"
            )
        )

