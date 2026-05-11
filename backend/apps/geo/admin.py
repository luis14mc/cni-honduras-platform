from django.contrib import admin

from .models import Department


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

