from django.urls import path
from rest_framework.routers import DefaultRouter

from .viewsets import (
    InvestmentOpportunityViewSet,
    InvestmentProjectViewSet,
    MapSummaryAPIView,
    SectorViewSet,
    SuccessStoryViewSet,
)

router = DefaultRouter()
router.register(r"sectors", SectorViewSet, basename="investment-sector")
router.register(r"opportunities", InvestmentOpportunityViewSet, basename="investment-opportunity")
router.register(r"projects", InvestmentProjectViewSet, basename="investment-project")
router.register(r"success-stories", SuccessStoryViewSet, basename="investment-success-story")

urlpatterns = router.urls + [
    path("map-summary/", MapSummaryAPIView.as_view(), name="investment-map-summary"),
]
