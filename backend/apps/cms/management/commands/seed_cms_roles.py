"""Create/update the CMS role groups and their model permissions.

Idempotent: safe to run repeatedly (e.g. on deploy). Does not create users and
never touches passwords.
"""

from __future__ import annotations

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from apps.cms.cms_admin.roles import ALL_ROLES, ROLE_MODEL_MATRIX, SUPERADMIN


class Command(BaseCommand):
    help = "Crea o actualiza los grupos de roles del CMS y sus permisos."

    def handle(self, *args, **options):
        created_groups = 0
        for name in ALL_ROLES:
            _, created = Group.objects.get_or_create(name=name)
            created_groups += int(created)

        for role, models in ROLE_MODEL_MATRIX.items():
            group = Group.objects.get(name=role)
            perms = self._permissions_for(models)
            group.permissions.set(perms)
            self.stdout.write(
                f"  {role}: {len(perms)} permisos asignados"
            )

        # Superadmin mirrors CMS admin scope at the group level; genuine
        # superusers already bypass permission checks, so we grant the full
        # editorial + investment scope here for staff added to the group.
        superadmin = Group.objects.get(name=SUPERADMIN)
        all_models = sorted({m for models in ROLE_MODEL_MATRIX.values() for m in models})
        superadmin.permissions.set(self._permissions_for(all_models))

        self.stdout.write(
            self.style.SUCCESS(
                f"Roles CMS listos ({len(ALL_ROLES)} grupos, "
                f"{created_groups} creados)."
            )
        )

    def _permissions_for(self, models: list[tuple[str, str]]) -> list[Permission]:
        perms: list[Permission] = []
        for app_label, model_name in models:
            try:
                ct = ContentType.objects.get(app_label=app_label, model=model_name)
            except ContentType.DoesNotExist:
                self.stderr.write(
                    self.style.WARNING(
                        f"  ContentType ausente: {app_label}.{model_name} (omitido)"
                    )
                )
                continue
            perms.extend(Permission.objects.filter(content_type=ct))
        return perms
