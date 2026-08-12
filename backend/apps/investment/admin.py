from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django.utils import timezone
from modeltranslation.admin import TranslationAdmin

from apps.cms.admin import EditorialAdminMixin
from apps.cms.models import PublishStatus

from .models import (
    InvestmentOpportunity,
    InvestmentProject,
    OpportunityFundUse,
    OpportunityMetric,
    Sector,
    SuccessStory,
)


class OpportunityMetricInline(admin.TabularInline):
    model = OpportunityMetric
    extra = 0
    fields = ("order", "label", "value", "note", "icon")


class OpportunityFundUseInline(admin.TabularInline):
    model = OpportunityFundUse
    extra = 0
    fields = ("order", "component", "amount", "description")


@admin.register(Sector)
class SectorAdmin(TranslationAdmin):
    list_display = ("name", "slug", "is_featured", "is_active", "order", "updated_at")
    list_filter = ("is_featured", "is_active")
    search_fields = ("name", "slug", "description", "short_description")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")
    ordering = ("order", "name")

    fieldsets = (
        (None, {"fields": ("name", "slug", "short_description", "description")}),
        ("Presentación", {"fields": ("icon", "image", "color_hex", "order")}),
        ("Estado", {"fields": ("is_featured", "is_active")}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(InvestmentOpportunity)
class InvestmentOpportunityAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = (
        "code",
        "title",
        "sector",
        "status",
        "lifecycle_status",
        "is_featured",
        "order",
        "updated_at",
    )
    list_filter = ("status", "lifecycle_status", "is_featured", "sector")
    search_fields = ("code", "title", "slug", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = EditorialAdminMixin.readonly_fields
    autocomplete_fields = ("sector", "department", "region")
    inlines = [OpportunityMetricInline, OpportunityFundUseInline]

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "code",
                    "title",
                    "slug",
                    "status",
                    "published_at",
                    "lifecycle_status",
                    "order",
                    "is_featured",
                )
            },
        ),
        (
            "Contenido",
            {
                "fields": (
                    "summary",
                    "description",
                    "target_customer",
                    "market_demand",
                    "value_proposition",
                )
            },
        ),
        ("Clasificación", {"fields": ("sector", "department", "region")}),
        ("Legacy métricas", {"fields": ("estimated_investment", "estimated_jobs")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        if obj.status == PublishStatus.PUBLISHED and not obj.published_at:
            obj.published_at = timezone.now()
        obj.full_clean()
        super(EditorialAdminMixin, self).save_model(request, obj, form, change)


@admin.register(InvestmentProject)
class InvestmentProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "sector", "project_stage", "is_public", "is_featured", "updated_at")
    list_filter = ("project_stage", "is_public", "is_featured", "sector")
    search_fields = ("title", "slug", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("sector", "department", "region", "municipality")

    fieldsets = (
        (None, {"fields": ("title", "slug", "summary", "description")}),
        ("Clasificación", {"fields": ("sector", "department", "region", "municipality")}),
        ("Datos", {"fields": ("investment_amount", "estimated_jobs", "project_stage")}),
        ("Visibilidad", {"fields": ("is_public", "is_featured")}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(SuccessStory)
class SuccessStoryAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = (
        "title",
        "company_name",
        "sector",
        "status",
        "is_featured",
        "order",
        "image_preview",
        "updated_at",
    )
    list_filter = ("status", "is_featured", "sector", "published_at")
    search_fields = ("title", "slug", "company_name", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = EditorialAdminMixin.readonly_fields + (
        "image_preview",
        "logo_preview",
    )
    autocomplete_fields = ("sector", "logo")

    fieldsets = (
        (None, {"fields": ("title", "slug", "company_name", "country_origin", "status", "published_at")}),
        (
            "Contenido",
            {"fields": ("summary", "content", "image", "image_preview", "logo", "logo_preview")},
        ),
        ("Testimonial", {"fields": ("testimonial_quote", "testimonial_author")}),
        ("Clasificación", {"fields": ("sector", "order", "is_featured")}),
        ("Datos", {"fields": ("investment_amount", "jobs_generated")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )

    @admin.display(description="Imagen")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" alt="" style="max-height:120px;max-width:240px;border-radius:4px;" />',
                obj.image.url,
            )
        return "—"

    @admin.display(description="Logo")
    def logo_preview(self, obj):
        if obj.logo_id and obj.logo.file:
            return format_html(
                '<img src="{}" alt="" style="max-height:80px;max-width:160px;border-radius:4px;" />',
                obj.logo.file.url,
            )
        return "—"

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        if obj.status == PublishStatus.PUBLISHED and not obj.published_at:
            obj.published_at = timezone.now()
        obj.full_clean()
        super(EditorialAdminMixin, self).save_model(request, obj, form, change)

    @admin.action(description="Publicar seleccionados")
    def make_published(self, request, queryset):
        now = timezone.now()
        published_count = 0
        failed_titles: list[str] = []

        for story in queryset:
            story.status = PublishStatus.PUBLISHED
            if not story.published_at:
                story.published_at = now
            story.updated_at = now
            story.updated_by = request.user
            try:
                story.full_clean()
                story.save()
                published_count += 1
            except ValidationError:
                failed_titles.append(story.title)

        if published_count:
            self.message_user(
                request,
                f"{published_count} caso(s) de éxito publicado(s) correctamente.",
                level=messages.SUCCESS,
            )
        if failed_titles:
            preview = ", ".join(failed_titles[:5])
            extra = f" y {len(failed_titles) - 5} más" if len(failed_titles) > 5 else ""
            self.message_user(
                request,
                f"{len(failed_titles)} caso(s) no se publicaron por validaciones: {preview}{extra}.",
                level=messages.WARNING,
            )
