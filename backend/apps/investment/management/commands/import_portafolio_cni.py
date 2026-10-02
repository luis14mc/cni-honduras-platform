from __future__ import annotations

import hashlib
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos import Point
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.cms.models import PublishStatus
from apps.geo.models import CNIRegion, Municipality
from apps.investment.models import (
    InvestmentOpportunity,
    InvestmentProject,
    OpportunityStatus,
    ProjectStage,
    Sector,
)
from apps.media_library.models import MediaAsset, MediaType

DATASET_DIR = Path(__file__).resolve().parents[2] / "data" / "portafolio_cni_2026"
DEFAULT_SEED = DATASET_DIR / "cni-portafolio-seed.json"

PHASE_TO_STAGE = {
    "estructuración y planificación": ProjectStage.PROMOTION,
    "estructuracion y planificacion": ProjectStage.PROMOTION,
    "tramitología": ProjectStage.ANNOUNCED,
    "tramitologia": ProjectStage.ANNOUNCED,
    "ejecución y monitoreo": ProjectStage.IMPLEMENTING,
    "ejecucion y monitoreo": ProjectStage.IMPLEMENTING,
    "operación y expansión": ProjectStage.FINISHED,
    "operacion y expansion": ProjectStage.FINISHED,
}

SECTOR_DEFAULTS = {
    "agroindustria": ("Agroindustria", "Agribusiness", "#2E7D32", 1),
    "turismo": ("Turismo", "Tourism", "#0077B6", 2),
    "energia": ("Energía", "Energy", "#F9A825", 3),
    "manufactura": ("Manufactura", "Manufacturing", "#5E35B1", 4),
    "infraestructura": ("Infraestructura", "Infrastructure", "#546E7A", 5),
}


def _normalize_geocode(value: object) -> str:
    digits = "".join(ch for ch in str(value or "").strip() if ch.isdigit())
    return digits.zfill(6) if digits else ""


def _decimal(value: object) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _project_stage(phase_detail: str) -> str:
    key = (phase_detail or "").strip().lower()
    return PHASE_TO_STAGE.get(key, ProjectStage.PROMOTION)


class Command(BaseCommand):
    help = "Carga las Opportunity Cards y fichas de proyectos del CNI (2026) con imágenes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dataset",
            default=str(DEFAULT_SEED),
            help="Ruta al JSON de seed (por defecto el dataset versionado).",
        )
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        seed_path = Path(options["dataset"]).resolve()
        if not seed_path.is_file():
            raise CommandError(f"No existe el seed: {seed_path}")
        dry_run = bool(options["dry_run"])
        payload = json.loads(seed_path.read_text(encoding="utf-8"))
        dataset_root = seed_path.parent
        opportunities = payload.get("oportunidades") or []
        projects = payload.get("proyectos") or []
        if not isinstance(opportunities, list) or not isinstance(projects, list):
            raise CommandError("El seed debe tener listas 'oportunidades' y 'proyectos'.")

        seen_codes: dict[str, int] = {}
        stats = {
            "opportunities_created": 0,
            "opportunities_updated": 0,
            "projects_created": 0,
            "projects_updated": 0,
            "images_created": 0,
            "images_reused": 0,
        }
        warnings: list[str] = []

        def warn(message: str) -> None:
            warnings.append(message)
            self.stderr.write(self.style.WARNING(f"WARN: {message}"))

        def track_code(code: str | None) -> None:
            value = (code or "").strip()
            if not value:
                return
            seen_codes[value] = seen_codes.get(value, 0) + 1
            if seen_codes[value] == 2:
                warn(f"Código duplicado {value}: se crean/actualizan ambos registros por slug.")

        ctx = {
            "dry_run": dry_run,
            "dataset_root": dataset_root,
            "stats": stats,
            "warn": warn,
            "image_cache": {},
        }

        with transaction.atomic():
            for record in opportunities:
                track_code(record.get("code"))
                created = self._upsert_opportunity(record, ctx)
                if created is None:
                    continue
                stats["opportunities_created" if created else "opportunities_updated"] += 1
            for record in projects:
                track_code(record.get("code"))
                created = self._upsert_project(record, ctx)
                if created is None:
                    continue
                stats["projects_created" if created else "projects_updated"] += 1
            if dry_run:
                transaction.set_rollback(True)

        label = "dry-run " if dry_run else ""
        self.stdout.write(
            f"{label}oportunidades: created {stats['opportunities_created']}, "
            f"updated {stats['opportunities_updated']}"
        )
        self.stdout.write(
            f"{label}proyectos: created {stats['projects_created']}, "
            f"updated {stats['projects_updated']}"
        )
        self.stdout.write(
            f"{label}imágenes: created {stats['images_created']}, reused {stats['images_reused']}"
        )
        if warnings:
            self.stdout.write(f"advertencias: {len(warnings)}")

    def _upsert_opportunity(self, record: dict, ctx: dict) -> bool | None:
        slug = slugify(record.get("slug") or record.get("title") or "")
        if not slug:
            ctx["warn"]("Oportunidad sin slug; se omite.")
            return None
        sector = self._sector(record.get("sector"), ctx["warn"])
        location, extra, municipality = self._locations(record.get("locations") or [], ctx["warn"], slug)
        defaults = {
            "code": (record.get("code") or "").strip(),
            "title": (record.get("title") or "").strip(),
            "title_es": (record.get("title") or "").strip(),
            "summary": (record.get("description") or "").strip(),
            "summary_es": (record.get("description") or "").strip(),
            "description": (record.get("description") or "").strip(),
            "description_es": (record.get("description") or "").strip(),
            "sector": sector,
            "department": municipality.department if municipality else None,
            "region": self._region(record.get("subregion"), ctx["warn"], slug),
            "location": location,
            "location_text": (record.get("location_text") or "")[:300],
            "amount_text": (record.get("amount_text") or "")[:120],
            "amount_notes": record.get("amount_notes") or [],
            "phase": (record.get("phase") or "")[:120],
            "phase_detail": (record.get("phase_detail") or "")[:200],
            "investment_type": record.get("investment_type") or "",
            "extra_locations": extra,
            "estimated_investment": _decimal(record.get("amount_usd")),
            "status": PublishStatus.PUBLISHED,
            "lifecycle_status": OpportunityStatus.OPEN,
        }
        cover = self._cover(record.get("image"), record.get("title") or slug, ctx)
        if cover:
            defaults["cover_image"] = cover
        if ctx["dry_run"]:
            return not InvestmentOpportunity.objects.filter(slug=slug).exists()
        obj, created = InvestmentOpportunity.objects.update_or_create(slug=slug, defaults=defaults)
        if created or not obj.published_at:
            obj.published_at = timezone.now()
            obj.save(update_fields=["published_at"])
        return created

    def _upsert_project(self, record: dict, ctx: dict) -> bool | None:
        slug = slugify(record.get("slug") or record.get("title") or "")
        if not slug:
            ctx["warn"]("Proyecto sin slug; se omite.")
            return None
        sector = self._sector(record.get("sector"), ctx["warn"])
        if sector is None:
            ctx["warn"](f"{slug}: sin sector; se omite el proyecto.")
            return None
        location, extra, municipality = self._locations(record.get("locations") or [], ctx["warn"], slug)
        code = (record.get("code") or "").strip() or None
        defaults = {
            "title": (record.get("title") or slug).strip(),
            "code": code,
            "summary": (record.get("description") or "").strip(),
            "description": (record.get("description") or "").strip(),
            "sector": sector,
            "municipality": municipality,
            "department": municipality.department if municipality else None,
            "region": self._region(record.get("subregion"), ctx["warn"], slug),
            "location": location,
            "location_text": (record.get("location_text") or "")[:300],
            "amount_text": (record.get("amount_text") or "")[:120],
            "amount_notes": record.get("amount_notes") or [],
            "phase": (record.get("phase") or "")[:120],
            "phase_detail": (record.get("phase_detail") or "")[:200],
            "investment_type": record.get("investment_type") or "",
            "extra_locations": extra,
            "investment_amount": _decimal(record.get("amount_usd")),
            "project_stage": _project_stage(record.get("phase_detail") or ""),
            "is_public": True,
        }
        cover = self._cover(record.get("image"), record.get("title") or slug, ctx)
        if cover:
            defaults["cover_image"] = cover
        if ctx["dry_run"]:
            return not InvestmentProject.objects.filter(slug=slug).exists()
        _, created = InvestmentProject.objects.update_or_create(slug=slug, defaults=defaults)
        return created

    def _sector(self, slug: str | None, warn) -> Sector | None:
        key = slugify(slug or "")
        if not key:
            warn("Registro sin sector.")
            return None
        existing = Sector.objects.filter(slug=key).first()
        if existing:
            return existing
        name_es, name_en, color, order = SECTOR_DEFAULTS.get(
            key, (key.replace("-", " ").title(), key.replace("-", " ").title(), "", 99)
        )
        return Sector.objects.create(
            slug=key,
            name=name_es,
            name_es=name_es,
            name_en=name_en,
            color_hex=color,
            order=order,
            is_active=True,
        )

    def _region(self, code: str | None, warn, slug: str) -> CNIRegion | None:
        value = (code or "").strip()
        if not value:
            return None
        region = CNIRegion.objects.filter(code=value, level="sub").first()
        if region is None:
            region = CNIRegion.objects.filter(code=value).first()
        if region is None:
            warn(f"{slug}: no se encontró la subregión {value}.")
        return region

    def _locations(self, locations: list, warn, slug: str):
        if not locations:
            return None, [], None
        first, *rest = locations
        municipality = self._municipality(first.get("municipio_geocode"), warn, slug)
        point = None
        try:
            lng = float(first["lng"])
            lat = float(first["lat"])
            point = Point(lng, lat, srid=4326)
        except (KeyError, TypeError, ValueError):
            warn(f"{slug}: coordenadas inválidas en la ubicación principal.")
        extra = []
        for item in rest:
            extra.append(
                {
                    "municipio_geocode": item.get("municipio_geocode") or "",
                    "lng": item.get("lng"),
                    "lat": item.get("lat"),
                }
            )
        return point, extra, municipality

    def _municipality(self, geocode: object, warn, slug: str) -> Municipality | None:
        code = _normalize_geocode(geocode)
        if not code:
            return None
        municipality = Municipality.objects.filter(code=code).first()
        if municipality is None:
            municipality = Municipality.objects.filter(code=str(geocode).strip()).first()
        if municipality is None:
            warn(f"{slug}: no se encontró el municipio {geocode}.")
        return municipality

    def _cover(self, relative: str | None, title: str, ctx: dict) -> MediaAsset | None:
        if not relative:
            return None
        path = (ctx["dataset_root"] / relative).resolve()
        if not path.is_file():
            ctx["warn"](f"{title}: no existe la imagen {relative}.")
            return None
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        cached = ctx["image_cache"].get(digest)
        if cached:
            ctx["stats"]["images_reused"] += 1
            return cached
        filename = path.name
        existing = (
            MediaAsset.objects.filter(original_filename=filename).order_by("id").first()
            or MediaAsset.objects.filter(caption=f"sha256:{digest}").order_by("id").first()
        )
        if existing:
            ctx["image_cache"][digest] = existing
            ctx["stats"]["images_reused"] += 1
            return existing
        if ctx["dry_run"]:
            return None
        asset = MediaAsset(
            title=title[:255],
            alt_text=title[:255],
            caption=f"sha256:{digest}",
            media_type=MediaType.IMAGE,
            file_size_bytes=len(data),
            mime_type="image/webp",
            original_filename=filename,
        )
        with path.open("rb") as handle:
            asset.file.save(filename, File(handle), save=True)
        ctx["image_cache"][digest] = asset
        ctx["stats"]["images_created"] += 1
        return asset
