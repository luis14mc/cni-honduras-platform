from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "media_type", "file_size_bytes", "uploaded_by", "created_at")
    list_filter = ("media_type", "created_at")
    search_fields = ("title", "alt_text", "caption", "original_filename")
    readonly_fields = ("created_at", "file_size_bytes", "mime_type", "original_filename")

    fieldsets = (
        (None, {"fields": ("title", "file", "media_type")}),
        ("Accesibilidad", {"fields": ("alt_text",)}),
        ("Contenido", {"fields": ("caption",)}),
        ("Archivo", {"fields": ("original_filename", "mime_type", "file_size_bytes")}),
        ("Auditoría", {"fields": ("uploaded_by", "created_at")}),
    )

