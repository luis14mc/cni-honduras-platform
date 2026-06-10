from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Registrar viewsets de integraciones aquí (p. ej. CRM/SuiteCRM), p. ej.:
# router.register(r"crm/leads", CrmLeadViewSet, basename="integrations-crm-lead")

urlpatterns = router.urls
