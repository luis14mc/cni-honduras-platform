from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "media_type", "uploaded_by", "created_at")
    list_filter = ("media_type", "created_at")
    search_fields = ("title", "alt_text", "caption")
    readonly_fields = ("created_at",)

    fieldsets = (
        (None, {"fields": ("title", "file", "media_type")}),
        ("Accesibilidad", {"fields": ("alt_text",)}),
        ("Contenido", {"fields": ("caption",)}),
        ("Auditoría", {"fields": ("uploaded_by", "created_at")}),
    )

