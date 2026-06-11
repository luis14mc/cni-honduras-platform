from rest_framework import viewsets

from .models import SuiteCRMIntegrationLog, WebhookEvent
from .serializers import SuiteCRMIntegrationLogSerializer, WebhookEventSerializer


class WebhookEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WebhookEventSerializer

    def get_queryset(self):
        return WebhookEvent.objects.order_by(*WebhookEvent._meta.ordering)


class SuiteCRMIntegrationLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SuiteCRMIntegrationLogSerializer

    def get_queryset(self):
        return SuiteCRMIntegrationLog.objects.order_by(*SuiteCRMIntegrationLog._meta.ordering)
