from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Registrar viewsets de inversión aquí cuando existan los modelos, p. ej.:
# router.register(r"opportunities", OpportunityViewSet, basename="investment-opportunity")
# router.register(r"sectors", SectorViewSet, basename="investment-sector")

urlpatterns = router.urls
