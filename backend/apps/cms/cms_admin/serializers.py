"""Serializers for the CMS-admin API (read-oriented for the foundation task)."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class CMSUserSerializer(serializers.ModelSerializer):
    """Identity + authorization payload consumed by the CMS shell."""

    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_superuser",
            "is_staff",
            "groups",
            "permissions",
        ]

    def get_groups(self, obj) -> list[str]:
        return list(obj.groups.values_list("name", flat=True))

    def get_permissions(self, obj) -> list[str]:
        # ``get_all_permissions`` merges group + user perms and returns
        # ``app_label.codename`` strings; superusers get the full set.
        return sorted(obj.get_all_permissions())


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True, trim_whitespace=False)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
