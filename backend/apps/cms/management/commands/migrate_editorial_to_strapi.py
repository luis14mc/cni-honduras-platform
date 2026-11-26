"""Stage a copy of Django editorial content in Strapi, preserving existing entries."""

import json
import mimetypes
import os
from collections import Counter, defaultdict
from hashlib import sha256
from pathlib import PurePosixPath
from urllib.error import HTTPError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import uuid4

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.utils.html import strip_tags

from apps.cms.models import Document, News, Page, SiteBanner
from apps.investment.models import InvestmentOpportunity, SuccessStory
from apps.media_library.models import MediaAsset


def localized(row, field, locale):
    value = getattr(row, f"{field}_{locale}", "")
    return value or (row.__dict__.get(field) if locale == "es" else "") or ""


def paragraphs(text):
    return [value for line in text.splitlines() if (value := strip_tags(line).strip())]


def dynamic_paragraphs(text):
    return [
        {
            "__component": "content.paragraph",
            "text": [{"type": "paragraph", "children": [{"type": "text", "text": item}]}],
        }
        for item in paragraphs(text)
    ]


def legacy_news_blocks(row, locale, upload):
    blocks = getattr(row, f"content_blocks_{locale}")
    if not blocks:
        return dynamic_paragraphs(localized(row, "content", locale))
    mapped = []
    for block in blocks:
        kind = block["type"]
        if kind == "paragraph":
            mapped.extend(dynamic_paragraphs(block["html"]))
        elif kind == "heading":
            mapped.append({"__component": "content.heading", "text": block["text"], "level": f"h{block['level']}"})
        elif kind == "quote":
            mapped.append({"__component": "content.quote", "quote": block["text"], "author": block.get("attribution")})
        elif kind == "image" and block.get("media_id"):
            asset = MediaAsset.objects.get(pk=block["media_id"])
            mapped.append({
                "__component": "content.image",
                "image": upload(asset.file, asset.alt_text),
                "caption": block.get("caption", ""),
                "alt_text": block.get("alt", ""),
            })
        else:
            raise ValueError(f"news block requires manual conversion: {kind}")
    return mapped


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class StrapiClient:
    def __init__(self, origin, token):
        parsed = urlsplit(origin)
        if not parsed.hostname or parsed.scheme not in {"http", "https"} or parsed.username or parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
            raise CommandError("STRAPI_MIGRATION_URL must be an HTTP(S) origin.")
        if parsed.scheme != "https" and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
            raise CommandError("Use HTTPS to send the import token to a remote Strapi instance.")
        if not token:
            raise CommandError("Set STRAPI_MIGRATION_TOKEN to an API token with access to the target collections.")
        self.origin = origin.rstrip("/")
        self.token = token
        self.opener = build_opener(NoRedirect())

    def request(self, path, query=None, *, method="GET", data=None, multipart=None):
        suffix = f"?{urlencode(query)}" if query else ""
        headers = {"Authorization": f"Bearer {self.token}", "Accept": "application/json"}
        body = None
        if multipart:
            headers["Content-Type"], body = multipart
        elif data is not None:
            headers["Content-Type"] = "application/json"
            body = json.dumps({"data": data}, ensure_ascii=False).encode()
        try:
            with self.opener.open(Request(self.origin + path + suffix, body, headers, method=method), timeout=40) as response:
                return json.load(response)
        except HTTPError as exc:
            raise ValueError(f"{method} {path.split('/')[2]} returned HTTP {exc.code}") from exc

    def find(self, collection, field, key, locale, *, status="draft"):
        result = self.request(f"/api/{collection}", {
            f"filters[{field}][$eq]": key, "locale": locale, "status": status, "pagination[pageSize]": 2,
        })
        rows = result["data"]
        if len(rows) > 1:
            raise ValueError(f"multiple destination documents for {field}")
        return rows[0] if rows else None

    def upload(self, file, alt=""):
        if not file:
            return None
        with file.open("rb") as source:
            content = source.read()
        extension = PurePosixPath(file.name).suffix.lower()
        fingerprint = sha256(content + b"\0" + alt.encode()).hexdigest()
        name = f"cni-import-{fingerprint}{extension}"
        records = self.request("/api/upload/files", {"filters[name][$eq]": name})
        if records:
            return records[0]["id"]
        boundary = uuid4().hex
        mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
        file_info = json.dumps({"name": name, "alternativeText": alt}).encode()
        body = (
            f'--{boundary}\r\nContent-Disposition: form-data; name="fileInfo"\r\n\r\n'.encode()
            + file_info
            + f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="files"; filename="{name}"\r\n'
              f"Content-Type: {mime}\r\n\r\n".encode()
            + content + f"\r\n--{boundary}--\r\n".encode()
        )
        created = self.request("/api/upload", method="POST", multipart=(f"multipart/form-data; boundary={boundary}", body))
        return created[0]["id"]


def source_payload(row, locale, upload):
    def text(field):
        return localized(row, field, locale)

    def media(field):
        asset = getattr(row, field)
        return upload(asset.file, asset.alt_text) if asset else None

    data = {"title": text("title")}
    if not isinstance(row, SiteBanner):
        data["slug"] = row.slug
    if isinstance(row, (Page, News, Document)):
        data["seo"] = {"metaTitle": text("seo_title"), "metaDescription": text("seo_description")}
    if isinstance(row, News):
        data.update(
            excerpt=text("summary"), content=legacy_news_blocks(row, locale, upload),
            category=row.category, featured=row.is_featured, cover=media("featured_image"),
            published_date=row.published_at.isoformat() if row.published_at else None,
        )
    elif isinstance(row, Page):
        data.update(summary=text("excerpt"), content=dynamic_paragraphs(text("content")))
        data["seo"]["ogImage"] = media("featured_image")
    elif isinstance(row, Document):
        data.update(
            description=text("description"), category=row.category, resource_key=row.resource_key,
            external_url=row.external_url, featured=row.is_featured, order=row.order,
            file=upload(row.file), cover=media("cover_image"),
        )
    elif isinstance(row, SuccessStory):
        data.update(
            company_name=row.company_name, sector=row.sector.slug if row.sector else None,
            summary=text("summary"), featured=row.is_featured, person_name=row.person_name,
            person_role=row.person_role, testimonial=text("testimonial_quote"), logo=media("logo"),
            featured_image=media("featured_image") or upload(row.image), person_photo=media("person_photo"),
            content=[{"type": "paragraph", "children": [{"type": "text", "text": item}]} for item in paragraphs(text("content"))],
        )
    elif isinstance(row, InvestmentOpportunity):
        metrics = row.metrics.filter(is_public=True).order_by("order", "id")[:4]
        data.update(
            code=row.code, sector=row.sector.slug if row.sector else None, summary=text("summary"),
            contact_cta=text("value_proposition"), featured_image=media("cover_image"),
            public_metrics=[{"label": localized(metric, "label", locale), "value": localized(metric, "value", locale)}
                            for metric in metrics if localized(metric, "label", locale) and localized(metric, "value", locale)],
        )
    else:
        data.update(
            legacy_key=f"django-banner-{row.pk}", placement=row.placement, body=text("body"),
            cta_label=text("cta_label"), link_url=row.link_url, link_external=row.link_external,
            dismissible=row.dismissible, priority=row.priority,
            background_color=row.background_color or None, text_color=row.text_color or None,
            starts_at=row.starts_at.isoformat() if row.starts_at else None,
            ends_at=row.ends_at.isoformat() if row.ends_at else None,
            image=media("image"), mobile_image=media("mobile_image"),
        )
    return data


class Command(BaseCommand):
    help = "Compare Django editorial records with Strapi. Use --apply to create missing drafts."

    def add_arguments(self, parser):
        mode = parser.add_mutually_exclusive_group()
        mode.add_argument("--apply", action="store_true", help="Create missing drafts in Strapi.")
        mode.add_argument(
            "--verify-published", action="store_true",
            help="Check that every currently published Django record has a published match in Strapi.",
        )

    def handle(self, *args, **options):
        client = StrapiClient(os.getenv("STRAPI_MIGRATION_URL", ""), os.getenv("STRAPI_MIGRATION_TOKEN", ""))
        mode = "apply" if options["apply"] else "audit"
        if options["verify_published"]:
            mode = "verify-published"
        counts = defaultdict(Counter)
        failures = []
        missing_publications = []
        published_at = timezone.now()
        collections = (
            ("news", News), ("documents", Document), ("success-stories", SuccessStory),
            ("investment-opportunities", InvestmentOpportunity), ("banners", SiteBanner), ("pages", Page),
        )
        for collection, model in collections:
            source = model.all_objects.order_by("pk")
            if mode == "verify-published":
                source = source.filter(status="published", published_at__lte=published_at)
            for row in source.iterator():
                locales = [row.language] if model is Document else ["es", "en"]
                if model is SiteBanner:
                    field, key = "legacy_key", f"django-banner-{row.pk}"
                elif model is Document:
                    field, key = "resource_key", row.resource_key
                else:
                    field, key = "slug", row.slug
                for locale in locales:
                    if not localized(row, "title", locale):
                        counts[f"{collection}:{locale}"]["without_translation"] += 1
                        continue
                    report = counts[f"{collection}:{locale}"]
                    report["source"] += 1
                    report[f"source_{row.status}"] += 1
                    try:
                        if mode == "verify-published":
                            found = client.find(collection, field, key, locale, status="published")
                        else:
                            found = client.find(collection, field, key, locale)
                        if found:
                            report["existing"] += 1
                        elif mode == "apply":
                            other = client.find(collection, field, key, "en" if locale == "es" else "es")
                            path = f"/api/{collection}"
                            method = "POST"
                            if other:
                                path += f"/{other['documentId']}"
                                method = "PUT"
                            client.request(
                                path, {"locale": locale, "status": "draft"}, method=method,
                                data=source_payload(row, locale, client.upload),
                            )
                            if not client.find(collection, field, key, locale):
                                raise ValueError("created entry was not found on readback")
                            report["created"] += 1
                        else:
                            report["missing"] += 1
                            if mode == "verify-published":
                                missing_publications.append({
                                    "collection": collection, "id": row.pk, "locale": locale,
                                })
                    except Exception as exc:
                        failures.append({"collection": collection, "id": row.pk, "locale": locale, "error": str(exc)})
                        report["failed"] += 1
        summary = {"mode": mode, "counts": counts, "errors": failures}
        if mode == "verify-published":
            summary["missing_publications"] = missing_publications
        self.stdout.write(json.dumps(summary, indent=2))
        if failures:
            raise CommandError("Some records could not be reconciled; review the report before switching sources.")
        if missing_publications:
            raise CommandError("Published records are missing in Strapi; keep the current editorial source.")
