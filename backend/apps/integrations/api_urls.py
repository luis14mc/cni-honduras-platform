from rest_framework.routers import DefaultRouter

from .viewsets import WebhookEventViewSet

router = DefaultRouter()
router.register(r"webhook-events", WebhookEventViewSet, basename="integrations-webhook-event")

urlpatterns = router.urls
