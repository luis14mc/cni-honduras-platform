from django.contrib import admin

from .models import CNIRegion, Department, Municipality


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
    list_display = ("name", "slug", "color_hex", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("departments",)
    ordering = ("name",)

    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "color_hex", "is_active")}),
        ("Departamentos", {"fields": ("departments",)}),
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

