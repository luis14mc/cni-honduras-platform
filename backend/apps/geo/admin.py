from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

from .models import CNIRegion, Department, Municipality, RoadCorridor, StrategicInfrastructure


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "slug", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "code")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)

    fieldsets = (
        (None, {"fields": ("name", "slug", "code", "description", "is_active")}),
        (
            "Geometría",
            {
                "fields": (
                    "geometry",
                    ("center_lat", "center_lng"),
                )
            },
        ),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(CNIRegion)
class CNIRegionAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "level", "parent", "slug", "color_hex", "is_active", "updated_at")
    list_filter = ("is_active", "level")
    search_fields = ("name", "slug", "code", "description")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("departments", "municipalities")
    ordering = ("name",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "slug",
                    "code",
                    "level",
                    "parent",
                    "description",
                    "color_hex",
                    "is_active",
                )
            },
        ),
        ("Departamentos y municipios", {"fields": ("departments", "municipalities")}),
        ("Datos adicionales", {"fields": ("extra",)}),
        ("Geometría", {"fields": ("geometry",)}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Municipality)
class MunicipalityAdmin(admin.ModelAdmin):
    list_display = ("name", "department", "code", "slug", "is_active", "updated_at")
    list_filter = ("is_active", "department")
    search_fields = ("name", "slug", "code", "description")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("department",)
    ordering = ("name",)

    fieldsets = (
        (None, {"fields": ("department", "name", "slug", "code", "description", "is_active")}),
        ("Geometría", {"fields": ("geometry", ("center_lat", "center_lng"))}),
        ("Metadatos", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(StrategicInfrastructure)
class StrategicInfrastructureAdmin(admin.ModelAdmin):
    list_display = ("name", "infrastructure_type", "department", "municipality", "is_active")
    list_filter = ("infrastructure_type", "is_active", "department")
    search_fields = ("name", "slug", "operator", "source_name")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("department", "municipality")
    ordering = ("name",)


@admin.register(RoadCorridor)
class RoadCorridorAdmin(TranslationAdmin):
    list_display = ("ref", "name", "road_class", "length_km", "is_strategic", "is_active")
    list_editable = ("is_strategic",)
    list_filter = ("road_class", "is_strategic", "is_active")
    search_fields = ("ref", "code", "name", "description")
    ordering = ("ref", "code")
    # Geometry, ref and length come from OSM and are refreshed by import_road_corridors.
    readonly_fields = ("code", "ref", "road_class", "length_km", "source_name", "source_url")
    fields = (
        "code", "ref", "name", "road_class", "length_km", "is_strategic", "description",
        "is_active", "source_name", "source_url",
    )
