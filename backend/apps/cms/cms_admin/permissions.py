"""Reusable permission classes and helpers for the CMS-admin API.

The project sets ``DEFAULT_PERMISSION_CLASSES = [AllowAny]`` for the public API,
so every CMS-admin view must opt into ``IsCMSStaff`` explicitly. The frontend
hides options the user cannot use, but the backend remains the authority.
"""

from __future__ import annotations

from rest_framework.permissions import BasePermission

from apps.cms.models import PublishStatus


class IsCMSStaff(BasePermission):
    """Allow only authenticated, active, staff users into the CMS."""

    message = "Se requiere una sesión de personal activo para acceder al CMS."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.is_staff
        )


def has_model_permission(user, app_label: str, codename: str) -> bool:
    """Return whether ``user`` holds ``<app_label>.<codename>``."""

    if user is None or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.has_perm(f"{app_label}.{codename}")


def can_publish(user) -> bool:
    """Whether the user may publish, unpublish, or archive editorial content."""

    return has_model_permission(user, "cms", "can_publish")


def can_view_model(user, app_label: str, model_name: str) -> bool:
    return has_model_permission(user, app_label, f"view_{model_name}")


def can_add_model(user, app_label: str, model_name: str) -> bool:
    return has_model_permission(user, app_label, f"add_{model_name}")


def can_change_model(user, app_label: str, model_name: str) -> bool:
    return has_model_permission(user, app_label, f"change_{model_name}")


def can_delete_model(user, app_label: str, model_name: str) -> bool:
    return has_model_permission(user, app_label, f"delete_{model_name}")


_ACTION_PERM = {
    "list": "view",
    "retrieve": "view",
    "create": "add",
    "update": "change",
    "partial_update": "change",
    "destroy": "delete",
}


class CMSModelPermission(BasePermission):
    """Map DRF actions to Django model permissions for a single model."""

    message = "No tiene permiso para realizar esta acción."

    def _model_scope(self, view) -> tuple[str, str]:
        app_label = getattr(view, "app_label", "")
        model_name = getattr(view, "model_name", "")
        return app_label, model_name

    def has_permission(self, request, view) -> bool:
        app_label, model_name = self._model_scope(view)
        if not app_label or not model_name:
            return False
        user = request.user
        action = getattr(view, "action", None)
        if action in ("publish", "archive", "reorder", "unpublish"):
            if request.method not in ("POST", "PATCH", "PUT"):
                return False
            if not can_change_model(user, app_label, model_name):
                return False
            return can_publish(user)
        if action in ("activate", "deactivate"):
            return can_change_model(user, app_label, model_name)
        perm_kind = _ACTION_PERM.get(action or "")
        if not perm_kind:
            return True
        checker = {
            "view": can_view_model,
            "add": can_add_model,
            "change": can_change_model,
            "delete": can_delete_model,
        }[perm_kind]
        return checker(user, app_label, model_name)


def assert_status_change_allowed(user, new_status: str, current_status: str | None = None) -> None:
    """Raise ``PermissionDenied`` when a non-publisher tries to publish/archive."""

    from rest_framework.exceptions import PermissionDenied

    if new_status in (PublishStatus.PUBLISHED, PublishStatus.ARCHIVED):
        if new_status != current_status and not can_publish(user):
            raise PermissionDenied("No tiene permiso para publicar o archivar contenido.")


def can_manage_users(user) -> bool:
    if user.is_superuser:
        return True
    return has_model_permission(user, "auth", "change_user")


def can_manage_groups(user) -> bool:
    if user.is_superuser:
        return True
    return has_model_permission(user, "auth", "change_group")


class IsCMSUserAdmin(BasePermission):
    """Manage CMS staff accounts — superuser or auth.change_user."""

    message = "Se requieren permisos administrativos de usuarios."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not IsCMSStaff().has_permission(request, view):
            return False
        return can_manage_users(user)


class IsCMSGroupAdmin(BasePermission):
    """Manage Django groups/roles — superuser or auth.change_group."""

    message = "Se requieren permisos administrativos de grupos."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not IsCMSStaff().has_permission(request, view):
            return False
        return can_manage_groups(user)
