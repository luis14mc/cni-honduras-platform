from rest_framework import serializers

from .models import SuiteCRMIntegrationLog, WebhookEvent


class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = (
            "id",
            "source",
            "event_type",
            "payload",
            "processed",
            "error_message",
            "created_at",
            "processed_at",
        )


class SuiteCRMIntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuiteCRMIntegrationLog
        fields = (
            "id",
            "related_model",
            "related_object_id",
            "action",
            "payload",
            "response",
            "success",
            "error_message",
            "created_at",
        )
