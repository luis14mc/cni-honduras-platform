"""Safety guards for CMS user administration."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, ValidationError

User = get_user_model()


def superuser_count() -> int:
    return User.objects.filter(is_superuser=True, is_active=True).count()


def assert_can_modify_user(actor, target) -> None:
    if actor.pk == target.pk and not actor.is_superuser:
        raise PermissionDenied("No puede modificar su propio acceso administrativo.")


def assert_safe_superuser_change(actor, target, *, making_inactive: bool = False, removing_super: bool = False) -> None:
    if not target.is_superuser:
        return
    if target.pk == actor.pk and (making_inactive or removing_super):
        raise PermissionDenied("No puede quitarse privilegios de superusuario a sí mismo.")
    if making_inactive or removing_super:
        if superuser_count() <= 1:
            raise ValidationError("No se puede desactivar o degradar al último superusuario activo.")


def assert_safe_superuser_delete(target) -> None:
    if target.is_superuser and superuser_count() <= 1:
        raise ValidationError("No se puede eliminar al último superusuario activo.")
