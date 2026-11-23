from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import WebhookEvent
from .serializers import WebhookEventSerializer


class WebhookEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WebhookEventSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return WebhookEvent.objects.order_by(*WebhookEvent._meta.ordering)
