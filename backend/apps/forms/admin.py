from django.contrib import admin
from django.utils import timezone

from .models import (
    AdvisoryRequest,
    ContactSubmission,
    ProjectApplication,
    ResourceDownloadLead,
    SubmissionStatus,
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
class ProjectApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
        "company",
        "project_name",
        "sector",
        "investment_range",
        "status",
        "crm_synced",
        "created_at",
    )
    list_filter = ("status", "sector", "investment_range", "crm_synced", "created_at")
    search_fields = ("full_name", "email", "company", "project_name", "details")
    readonly_fields = ("created_at", "updated_at", "crm_synced", "crm_record_id")
    date_hierarchy = "created_at"
    actions = (
        "marcar_como_en_revision",
        "marcar_como_contactado",
        "marcar_como_cerrado",
        "marcar_como_spam",
    )

    fieldsets = (
        (
            "Contacto",
            {
                "fields": (
                    "full_name",
                    "email",
                    "phone",
                    "company",
                    "country",
                    "consent",
                    "source",
                )
            },
        ),
        (
            "Proyecto",
            {
                "fields": (
                    "project_name",
                    "sector",
                    "department",
                    "project_location",
                    "investment_range",
                    "estimated_investment",
                    "expected_jobs",
                    "details",
                    "message",
                )
            },
        ),
        (
            "Estado interno",
            {
                "fields": (
                    "status",
                    "crm_synced",
                    "crm_record_id",
                )
            },
        ),
        (
            "Fechas",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.action(description="Marcar como en revisión")
    def marcar_como_en_revision(self, request, queryset):
        queryset.update(status=SubmissionStatus.IN_REVIEW)

    @admin.action(description="Marcar como contactado")
    def marcar_como_contactado(self, request, queryset):
        queryset.update(status=SubmissionStatus.CONTACTED)

    @admin.action(description="Marcar como cerrado")
    def marcar_como_cerrado(self, request, queryset):
        queryset.update(status=SubmissionStatus.CLOSED)

    @admin.action(description="Marcar como spam")
    def marcar_como_spam(self, request, queryset):
        queryset.update(status=SubmissionStatus.SPAM)


@admin.register(AdvisoryRequest)
class AdvisoryRequestAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("advisory_type", "sector")


@admin.register(ResourceDownloadLead)
class ResourceDownloadLeadAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("resource_name",)
