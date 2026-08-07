"""CMS permission matrix shared by roles UI and privilege guards."""

from __future__ import annotations

from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

CMS_MATRIX_MODELS: tuple[tuple[str, str, str], ...] = (
    ("cms", "news", "Noticias"),
    ("cms", "document", "Documentos"),
    ("cms", "sitebanner", "Banners"),
    ("cms", "page", "Páginas"),
    ("cms", "institutionallink", "Enlaces institucionales"),
    ("investment", "sector", "Sectores"),
    ("investment", "investmentopportunity", "Oportunidades"),
    ("investment", "successstory", "Casos de éxito"),
    ("media_library", "mediaasset", "Multimedia"),
)

_MATRIX_ACTIONS = ("view", "add", "change", "delete")

_CMS_PUBLISH_MODELS = frozenset({"news", "document", "sitebanner", "page"})


def cms_assignable_permission_ids() -> set[int]:
    """IDs of permissions the CMS roles endpoint may assign (editorial scope only)."""

    ids: set[int] = set()
    for app_label, model_name, _label in CMS_MATRIX_MODELS:
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
        except ContentType.DoesNotExist:
            continue
        for action in _MATRIX_ACTIONS:
            codename = f"{action}_{model_name}"
            perm_id = (
                Permission.objects.filter(content_type=ct, codename=codename)
                .values_list("id", flat=True)
                .first()
            )
            if perm_id:
                ids.add(perm_id)

    publish_id = (
        Permission.objects.filter(codename="can_publish", content_type__app_label="cms")
        .values_list("id", flat=True)
        .first()
    )
    if publish_id:
        ids.add(publish_id)
    return ids


def cms_assignable_permissions():
    return Permission.objects.filter(pk__in=cms_assignable_permission_ids())


def is_cms_assignable_permission(perm: Permission) -> bool:
    return perm.pk in cms_assignable_permission_ids()


def build_permission_catalog() -> list[dict]:
    catalog: list[dict] = []
    for app_label, model_name, label in CMS_MATRIX_MODELS:
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
        except ContentType.DoesNotExist:
            continue
        perms = []
        for action in _MATRIX_ACTIONS:
            codename = f"{action}_{model_name}"
            try:
                perm = Permission.objects.get(content_type=ct, codename=codename)
            except Permission.DoesNotExist:
                continue
            perms.append(
                {
                    "id": perm.id,
                    "codename": perm.codename,
                    "action": action,
                    "name": perm.name,
                }
            )
        publish_perm = None
        if app_label == "cms" and model_name in _CMS_PUBLISH_MODELS:
            try:
                publish = Permission.objects.get(codename="can_publish", content_type__app_label="cms")
                publish_perm = {
                    "id": publish.id,
                    "codename": publish.codename,
                    "action": "publish",
                    "name": publish.name,
                }
            except Permission.DoesNotExist:
                pass
        catalog.append(
            {
                "app_label": app_label,
                "model": model_name,
                "label": label,
                "permissions": perms,
                "publish_permission": publish_perm,
            }
        )
    return catalog
