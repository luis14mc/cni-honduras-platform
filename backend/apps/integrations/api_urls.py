from rest_framework.routers import DefaultRouter

from .viewsets import SuiteCRMIntegrationLogViewSet, WebhookEventViewSet

router = DefaultRouter()
router.register(r"webhook-events", WebhookEventViewSet, basename="integrations-webhook-event")
router.register(r"suitecrm-logs", SuiteCRMIntegrationLogViewSet, basename="integrations-suitecrm-log")

urlpatterns = router.urls
