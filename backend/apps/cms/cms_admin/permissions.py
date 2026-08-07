"""Reusable permission classes and helpers for the CMS-admin API.

The project sets ``DEFAULT_PERMISSION_CLASSES = [AllowAny]`` for the public API,
so every CMS-admin view must opt into ``IsCMSStaff`` explicitly. The frontend
hides options the user cannot use, but the backend remains the authority.
"""

from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsCMSStaff(BasePermission):
    """Allow only authenticated, active, staff users into the CMS.

    Matches the access rule of the CMS login: ``is_active`` and ``is_staff``.
    Superusers naturally satisfy ``is_staff``.
    """

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
    """Return whether ``user`` holds ``<app_label>.<codename>``.

    Superusers implicitly hold every permission. Helper kept small on purpose so
    upcoming CRUD modules can gate write operations per model without repeating
    the superuser short-circuit.
    """

    if user is None or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.has_perm(f"{app_label}.{codename}")
