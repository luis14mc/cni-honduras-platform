from rest_framework import serializers

from .models import WebhookEvent


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
