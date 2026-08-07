"""Helpers for protecting critical institutional pages from deletion."""

from __future__ import annotations

PROTECTED_PAGE_SLUGS = frozenset(
    {
        "nosotros",
        "quienes-somos",
        "contacto",
        "invertir",
        "sectores",
        "facilidades-migratorias",
        "estudios",
    }
)


def is_protected_page_slug(slug: str) -> bool:
    return (slug or "").strip().lower() in PROTECTED_PAGE_SLUGS
