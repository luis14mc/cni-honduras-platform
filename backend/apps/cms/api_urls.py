from rest_framework.routers import DefaultRouter

from .viewsets import (
    DocumentViewSet,
    InstitutionalLinkViewSet,
    NewsViewSet,
    PageViewSet,
    SiteBannerViewSet,
)

router = DefaultRouter()
router.register(r"pages", PageViewSet, basename="cms-page")
router.register(r"news", NewsViewSet, basename="cms-news")
router.register(r"documents", DocumentViewSet, basename="cms-document")
router.register(r"institutional-links", InstitutionalLinkViewSet, basename="cms-institutional-link")
router.register(r"banners", SiteBannerViewSet, basename="cms-banner")

urlpatterns = router.urls
