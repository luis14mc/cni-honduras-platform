from rest_framework.routers import DefaultRouter

from .viewsets import (
    AdvisoryRequestViewSet,
    ContactSubmissionViewSet,
    ProjectApplicationViewSet,
    ResourceDownloadLeadViewSet,
)

router = DefaultRouter()
router.register(r"contact", ContactSubmissionViewSet, basename="forms-contact")
router.register(r"project-application", ProjectApplicationViewSet, basename="forms-project-application")
router.register(r"advisory-request", AdvisoryRequestViewSet, basename="forms-advisory-request")
router.register(r"resource-download", ResourceDownloadLeadViewSet, basename="forms-resource-download")

urlpatterns = router.urls
