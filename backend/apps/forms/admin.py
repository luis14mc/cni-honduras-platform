from django.contrib import admin

from .models import (
    AdvisoryRequest,
    ContactSubmission,
    ProjectApplication,
    ProjectApplicationStatus,
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
class ProjectApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "reference_code",
        "full_name",
        "email",
        "company",
        "project_name",
        "sector_ref",
        "investment_range",
        "status",
        "crm_synced",
        "created_at",
    )
    list_filter = ("status", "sector_ref", "investment_range", "created_at")
    search_fields = ("reference_code", "full_name", "email", "company")
    readonly_fields = ("reference_code", "created_at", "updated_at", "crm_synced", "crm_record_id")
    date_hierarchy = "created_at"
    actions = (
        "marcar_como_en_revision",
        "marcar_como_contactado",
        "marcar_como_calificado",
        "marcar_como_rechazado",
        "marcar_como_convertido",
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
                    "website",
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
                    "sector_ref",
                    "department",
                    "department_ref",
                    "municipality",
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
                    "reference_code",
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
        queryset.update(status=ProjectApplicationStatus.REVIEWING)

    @admin.action(description="Marcar como contactado")
    def marcar_como_contactado(self, request, queryset):
        queryset.update(status=ProjectApplicationStatus.CONTACTED)

    @admin.action(description="Marcar como calificado")
    def marcar_como_calificado(self, request, queryset):
        queryset.update(status=ProjectApplicationStatus.QUALIFIED)

    @admin.action(description="Marcar como rechazado")
    def marcar_como_rechazado(self, request, queryset):
        queryset.update(status=ProjectApplicationStatus.REJECTED)

    @admin.action(description="Marcar como convertido")
    def marcar_como_convertido(self, request, queryset):
        queryset.update(status=ProjectApplicationStatus.CONVERTED)


@admin.register(AdvisoryRequest)
class AdvisoryRequestAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("advisory_type", "sector")


@admin.register(ResourceDownloadLead)
class ResourceDownloadLeadAdmin(BaseSubmissionAdmin):
    list_filter = BaseSubmissionAdmin.list_filter + ("resource_name",)
