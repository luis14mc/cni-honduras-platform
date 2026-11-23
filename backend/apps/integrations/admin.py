from django.contrib import admin
from django.utils import timezone

from .models import WebhookEvent


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ("id", "source", "event_type", "processed", "created_at", "processed_at")
    list_filter = ("source", "event_type", "processed", "created_at")
    search_fields = ("event_type", "error_message")
    readonly_fields = ("source", "event_type", "payload", "created_at", "processed_at")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    actions = (
        "marcar_como_no_procesado",
        "marcar_como_procesado",
        "limpiar_error",
    )

    fieldsets = (
        (None, {"fields": ("source", "event_type", "payload", "processed", "error_message")}),
        ("Fechas", {"fields": ("created_at", "processed_at")}),
    )

    @admin.action(description="Marcar como no procesado")
    def marcar_como_no_procesado(self, request, queryset):
        queryset.update(processed=False, processed_at=None)

    @admin.action(description="Marcar como procesado")
    def marcar_como_procesado(self, request, queryset):
        now = timezone.now()
        queryset.update(processed=True, processed_at=now)

    @admin.action(description="Limpiar mensaje de error")
    def limpiar_error(self, request, queryset):
        queryset.update(error_message="")
