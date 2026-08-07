"""Privilege escalation guards for CMS user and group administration."""

from __future__ import annotations

from typing import Iterable

from django.contrib.auth.models import Group, Permission
from rest_framework.exceptions import PermissionDenied, ValidationError

from .matrix import is_cms_assignable_permission
from .roles import SUPERADMIN

PRIVILEGED_AUTH_CODENAMES = frozenset(
    {
        "add_user",
        "change_user",
        "delete_user",
        "view_user",
        "add_group",
        "change_group",
        "delete_group",
        "view_group",
    }
)


def is_superadmin_group(group: Group) -> bool:
    return group.name == SUPERADMIN


def contains_privileged_permissions(group: Group) -> bool:
    """Return True when a group carries auth-admin capabilities or is Superadmin."""

    if is_superadmin_group(group):
        return True
    return group.permissions.filter(
        content_type__app_label="auth",
        codename__in=PRIVILEGED_AUTH_CODENAMES,
    ).exists()


def assert_superuser_actor(actor, *, action: str = "realizar esta acción") -> None:
    if not actor.is_superuser:
        raise PermissionDenied(f"Solo un superusuario puede {action}.")


def assert_can_assign_groups(actor, groups: Iterable[Group]) -> None:
    if actor.is_superuser:
        return
    for group in groups:
        if is_superadmin_group(group):
            raise PermissionDenied("Solo un superusuario puede asignar el rol Superadmin.")
        if contains_privileged_permissions(group):
            raise PermissionDenied("No puede asignar grupos con permisos administrativos.")


def assert_can_modify_superuser_target(actor, target) -> None:
    if target.is_superuser and not actor.is_superuser:
        raise PermissionDenied("No puede modificar cuentas de superusuario.")


def assert_can_change_superuser_flag(actor, attrs: dict, target) -> None:
    if "is_superuser" not in attrs:
        return
    requested = attrs["is_superuser"]
    if actor.is_superuser:
        return
    if requested is True or (target.is_superuser and requested is False):
        raise PermissionDenied("Solo un superusuario puede modificar is_superuser.")


def assert_can_modify_group(actor, group: Group, *, renaming_to: str | None = None) -> None:
    if is_superadmin_group(group) or (renaming_to and renaming_to == SUPERADMIN):
        assert_superuser_actor(actor, action="modificar el grupo Superadmin")
    if not actor.is_superuser and actor.groups.filter(pk=group.pk).exists():
        raise PermissionDenied("No puede modificar un grupo al que pertenece.")


def validate_assignable_permissions(permissions: Iterable[Permission]) -> None:
    invalid = [p.codename for p in permissions if not is_cms_assignable_permission(p)]
    if invalid:
        raise ValidationError(
            {"permission_ids": f"Permisos fuera del alcance CMS: {', '.join(sorted(invalid))}"}
        )
