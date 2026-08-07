"""CMS role definitions backed by Django Groups.

Groups are the source of truth for roles. The ``seed_cms_roles`` management
command creates/updates these groups and assigns model permissions. Frontend
must never hardcode authorization decisions — it only mirrors what the backend
reports through ``/api/v1/cms-admin/me/``.
"""

from __future__ import annotations

# Canonical group names (kept stable — referenced by the seeder and tests).
SUPERADMIN = "Superadmin"
CMS_ADMIN = "Administrador CMS"
EDITOR = "Editor"
AUTHOR = "Autor"
COMMUNICATIONS = "Comunicaciones"
INVESTMENTS = "Inversiones"

ALL_ROLES = [
    SUPERADMIN,
    CMS_ADMIN,
    EDITOR,
    AUTHOR,
    COMMUNICATIONS,
    INVESTMENTS,
]

# Content models each role is expected to manage. Used by the seeder to grant
# add/change/delete/view permissions. Publishing uses the custom
# ``cms.can_publish`` permission where defined.
_CMS_CONTENT = [
    ("cms", "news"),
    ("cms", "document"),
    ("cms", "sitebanner"),
    ("cms", "page"),
    ("cms", "institutionallink"),
]
_INVESTMENT_CONTENT = [
    ("investment", "sector"),
    ("investment", "investmentopportunity"),
    ("investment", "successstory"),
]
_MEDIA_CONTENT = [
    ("media_library", "mediaasset"),
]

# Map each role to the models it can manage. Superadmin/CMS admin manage
# everything; specialised roles get a scoped subset.
ROLE_MODEL_MATRIX: dict[str, list[tuple[str, str]]] = {
    CMS_ADMIN: _CMS_CONTENT + _INVESTMENT_CONTENT + _MEDIA_CONTENT,
    EDITOR: _CMS_CONTENT + _MEDIA_CONTENT,
    AUTHOR: [("cms", "news"), ("cms", "document"), ("media_library", "mediaasset")],
    COMMUNICATIONS: [
        ("cms", "news"),
        ("cms", "sitebanner"),
        ("media_library", "mediaasset"),
    ],
    INVESTMENTS: _INVESTMENT_CONTENT + _MEDIA_CONTENT,
}
