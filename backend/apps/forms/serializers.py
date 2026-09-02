from rest_framework import serializers

from apps.cms.models import Document
from apps.geo.models import Department, Municipality
from apps.investment.models import Sector

from .models import (
    AdvisoryRequest,
    ContactSubmission,
    ProjectApplication,
    ProjectApplicationStatus,
    ResourceDownloadLead,
)


class SubmissionSerializerMixin:
    read_only_fields = (
        "id",
        "status",
        "crm_synced",
        "crm_record_id",
        "created_at",
        "updated_at",
    )


class ContactSubmissionSerializer(SubmissionSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "country",
            "message",
            "source",
            "status",
            "crm_synced",
            "crm_record_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = SubmissionSerializerMixin.read_only_fields


class ProjectApplicationSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source="full_name", max_length=200, write_only=True)
    company_name = serializers.CharField(source="company", max_length=200, write_only=True)
    project_description = serializers.CharField(source="details", max_length=10000, write_only=True)
    estimated_jobs = serializers.IntegerField(
        source="expected_jobs", min_value=0, required=False, allow_null=True, write_only=True
    )
    sector = serializers.SlugRelatedField(
        source="sector_ref", slug_field="slug", queryset=Sector.objects.filter(is_active=True), write_only=True
    )
    department = serializers.SlugRelatedField(
        source="department_ref",
        slug_field="slug",
        queryset=Department.objects.filter(is_active=True),
        write_only=True,
    )
    municipality = serializers.SlugField(required=False, allow_null=True, write_only=True)
    company_fax = serializers.CharField(required=False, allow_blank=True, write_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = ProjectApplication
        fields = (
            "contact_name",
            "email",
            "phone",
            "country",
            "company_name",
            "website",
            "project_name",
            "sector",
            "project_description",
            "investment_range",
            "estimated_jobs",
            "department",
            "municipality",
            "consent",
            "company_fax",
            "status",
            "reference_code",
            "created_at",
        )
        read_only_fields = ("reference_code", "created_at")
        extra_kwargs = {
            "email": {"required": True, "max_length": 254, "write_only": True},
            "phone": {"required": True, "allow_blank": False, "max_length": 50, "write_only": True},
            "country": {"required": True, "allow_blank": False, "max_length": 120, "write_only": True},
            "website": {"required": False, "allow_blank": True, "write_only": True},
            "project_name": {"required": True, "allow_blank": False, "max_length": 255, "write_only": True},
            "investment_range": {"required": True, "allow_blank": False, "write_only": True},
            "consent": {"required": True, "write_only": True},
        }

    def to_internal_value(self, data):
        if not hasattr(data, "keys"):
            raise serializers.ValidationError("Se esperaba un objeto JSON.")
        unknown = set(data.keys()) - set(self.fields)
        if "status" in data:
            unknown.add("status")
        if unknown:
            raise serializers.ValidationError({key: "Campo no permitido." for key in sorted(unknown)})
        return super().to_internal_value(data)

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Debe aceptar el consentimiento de contacto.")
        return value

    def validate(self, attrs):
        if attrs.pop("company_fax", "").strip():
            raise serializers.ValidationError({"company_fax": "Solicitud inválida."})
        municipality_slug = attrs.pop("municipality", None)
        department = attrs.get("department_ref")
        if municipality_slug:
            try:
                attrs["municipality"] = Municipality.objects.get(
                    slug=municipality_slug, department=department, is_active=True
                )
            except Municipality.DoesNotExist:
                raise serializers.ValidationError(
                    {"municipality": "Municipio inválido para el departamento seleccionado."}
                )
        return attrs

    def create(self, validated_data):
        sector = validated_data["sector_ref"]
        department = validated_data["department_ref"]
        municipality = validated_data.get("municipality")
        return ProjectApplication.objects.create(
            **validated_data,
            source="website_project_submission",
            status=ProjectApplicationStatus.NEW,
            sector=sector.slug,
            department=department.slug,
            project_location=municipality.slug if municipality else department.slug,
            message="",
        )


class AdvisoryRequestSerializer(SubmissionSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = AdvisoryRequest
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "country",
            "message",
            "advisory_type",
            "sector",
            "source",
            "status",
            "crm_synced",
            "crm_record_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = SubmissionSerializerMixin.read_only_fields


class ResourceDownloadLeadSerializer(SubmissionSerializerMixin, serializers.ModelSerializer):
    document_id = serializers.PrimaryKeyRelatedField(
        source="document",
        queryset=Document.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = ResourceDownloadLead
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "country",
            "resource_name",
            "document_id",
            "details",
            "source",
            "status",
            "crm_synced",
            "crm_record_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = SubmissionSerializerMixin.read_only_fields
