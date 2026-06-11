from django.contrib import admin

from .models import (
    AdvisoryRequest,
    ContactSubmission,
    ProjectApplication,
    ResourceDownloadLead,
)


class BaseSubmissionAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "company", "source", "status", "crm_synced", "created_at")
    list_filter = ("status", "crm_synced", "source", "created_at")
    search_fields = ("full_name", "email", "phone", "company", "country", "crm_record_id")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(BaseSubmissionAdmin):
    pass


@admin.register(ProjectApplication)
class ProjectApplicationAdmin(BaseSubmissionAdmin):
    list_display = (
        "full_name",
        "email",
        "company",
        "project_name",
        "sector",
        "investment_range",
        "status",
        "created_at",
    )
    list_filter = BaseSubmissionAdmin.list_filter + ("sector", "department")
    search_fields = BaseSubmissionAdmin.search_fields + (
        "project_name",
        "project_location",
        "investment_range",
        "details",
        "message",
    )


@admin.register(AdvisoryRequest)
class AdvisoryRequestAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("advisory_type", "sector")


@admin.register(ResourceDownloadLead)
class ResourceDownloadLeadAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("resource_name",)
