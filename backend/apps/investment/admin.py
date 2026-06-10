from django.contrib import admin

from .models import (
    InvestmentOpportunity,
    InvestmentProject,
    Sector,
    SuccessStory,
)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
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
class InvestmentOpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "sector", "status", "is_public", "is_featured", "updated_at")
    list_filter = ("status", "is_public", "is_featured", "sector")
    search_fields = ("title", "slug", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("sector", "department", "region")

    fieldsets = (
        (None, {"fields": ("title", "slug", "summary", "description")}),
        ("Clasificación", {"fields": ("sector", "department", "region")}),
        ("Datos", {"fields": ("estimated_investment", "estimated_jobs", "status")}),
        ("Visibilidad", {"fields": ("is_public", "is_featured")}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


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
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = ("title", "company_name", "sector", "is_public", "is_featured", "updated_at")
    list_filter = ("is_public", "is_featured", "sector")
    search_fields = ("title", "slug", "company_name", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("sector",)

    fieldsets = (
        (None, {"fields": ("title", "slug", "company_name", "country_origin")}),
        ("Contenido", {"fields": ("summary", "content", "image")}),
        ("Clasificación", {"fields": ("sector",)}),
        ("Datos", {"fields": ("investment_amount", "jobs_generated")}),
        ("Visibilidad", {"fields": ("is_public", "is_featured")}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )
