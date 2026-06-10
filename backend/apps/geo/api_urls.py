from rest_framework.routers import DefaultRouter

from .viewsets import CNIRegionViewSet, DepartmentViewSet, MunicipalityViewSet

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="geo-department")
router.register(r"regions", CNIRegionViewSet, basename="geo-region")
router.register(r"municipalities", MunicipalityViewSet, basename="geo-municipality")

urlpatterns = router.urls
