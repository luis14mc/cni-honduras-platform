"""Serializers for internal CMS project application management."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers

from .models import (
    ProjectApplication,
    ProjectApplicationHistory,
    ProjectApplicationNote,
    ProjectApplicationStatus,
)

User = get_user_model()


class StaffUserBriefSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "email")
        read_only_fields = fields

    def get_name(self, obj: User) -> str:
        full = obj.get_full_name().strip()
        return full or obj.username


class GeoRefBriefSerializer(serializers.Serializer):
    slug = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)

    def to_representation(self, instance):
        if instance is None:
            return None
        return {"slug": instance.slug, "name": instance.name}


class ProjectApplicationListSerializer(serializers.ModelSerializer):
    sector = GeoRefBriefSerializer(source="sector_ref", read_only=True)
    department = GeoRefBriefSerializer(source="department_ref", read_only=True)
    municipality = GeoRefBriefSerializer(read_only=True)
    assigned_to = StaffUserBriefSerializer(read_only=True)

    class Meta:
        model = ProjectApplication
        fields = (
            "reference_code",
            "project_name",
            "company",
            "full_name",
            "email",
            "sector",
            "department",
            "municipality",
            "investment_range",
            "status",
            "assigned_to",
            "created_at",
        )
        read_only_fields = fields


class ProjectApplicationDetailSerializer(serializers.ModelSerializer):
    sector = GeoRefBriefSerializer(source="sector_ref", read_only=True)
    department = GeoRefBriefSerializer(source="department_ref", read_only=True)
    municipality = GeoRefBriefSerializer(read_only=True)
    assigned_to = StaffUserBriefSerializer(read_only=True)
    project_description = serializers.CharField(source="details", read_only=True)
    estimated_jobs = serializers.IntegerField(source="expected_jobs", read_only=True)

    class Meta:
        model = ProjectApplication
        fields = (
            "reference_code",
            "full_name",
            "email",
            "phone",
            "country",
            "company",
            "website",
            "project_name",
            "project_description",
            "sector",
            "department",
            "municipality",
            "investment_range",
            "estimated_jobs",
            "status",
            "assigned_to",
            "source",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


def assignable_staff_users_queryset():
    """Staff activos elegibles como responsable: superuser o permiso change_projectapplication."""
    perm_q = Q(
        groups__permissions__content_type__app_label="forms_app",
        groups__permissions__codename="change_projectapplication",
    ) | Q(
        user_permissions__content_type__app_label="forms_app",
        user_permissions__codename="change_projectapplication",
    )
    return (
        User.objects.filter(is_staff=True, is_active=True)
        .filter(Q(is_superuser=True) | perm_q)
        .distinct()
        .order_by("first_name", "username")
    )


def filter_assignable_staff_users(user: User):
    return assignable_staff_users_queryset()


class ProjectApplicationPatchSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ProjectApplicationStatus.choices, required=False)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=assignable_staff_users_queryset(),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe enviar al menos un campo permitido.")
        unknown = set(self.initial_data.keys()) - {"status", "assigned_to"}
        if unknown:
            raise serializers.ValidationError({key: "Campo no permitido." for key in sorted(unknown)})
        return attrs


class ProjectApplicationNoteSerializer(serializers.ModelSerializer):
    author = StaffUserBriefSerializer(read_only=True)

    class Meta:
        model = ProjectApplicationNote
        fields = ("id", "body", "author", "created_at")
        read_only_fields = ("id", "author", "created_at")


class ProjectApplicationNoteCreateSerializer(serializers.Serializer):
    body = serializers.CharField(min_length=1, max_length=5000, trim_whitespace=True)


class ProjectApplicationHistorySerializer(serializers.ModelSerializer):
    actor = StaffUserBriefSerializer(read_only=True)
    from_assignee = StaffUserBriefSerializer(read_only=True)
    to_assignee = StaffUserBriefSerializer(read_only=True)

    class Meta:
        model = ProjectApplicationHistory
        fields = (
            "id",
            "event_type",
            "from_status",
            "to_status",
            "from_assignee",
            "to_assignee",
            "metadata",
            "actor",
            "created_at",
        )
        read_only_fields = fields
