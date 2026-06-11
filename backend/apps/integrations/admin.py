from django.contrib import admin

from .models import SuiteCRMIntegrationLog, WebhookEvent


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ("source", "event_type", "processed", "created_at", "processed_at")
    list_filter = ("processed", "source", "event_type", "created_at")
    search_fields = ("source", "event_type", "error_message", "payload")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


@admin.register(SuiteCRMIntegrationLog)
class SuiteCRMIntegrationLogAdmin(admin.ModelAdmin):
    list_display = ("action", "related_model", "related_object_id", "success", "created_at")
    list_filter = ("success", "action", "related_model", "created_at")
    search_fields = ("related_model", "related_object_id", "action", "error_message")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
