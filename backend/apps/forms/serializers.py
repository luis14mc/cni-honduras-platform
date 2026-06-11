from rest_framework import serializers

from .models import AdvisoryRequest, ContactSubmission, ProjectApplication, ResourceDownloadLead


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


class ProjectApplicationSerializer(SubmissionSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ProjectApplication
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "country",
            "details",
            "sector",
            "department",
            "estimated_investment",
            "source",
            "status",
            "crm_synced",
            "crm_record_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = SubmissionSerializerMixin.read_only_fields


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
            "details",
            "source",
            "status",
            "crm_synced",
            "crm_record_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = SubmissionSerializerMixin.read_only_fields
