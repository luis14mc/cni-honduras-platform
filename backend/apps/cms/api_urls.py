from rest_framework.routers import DefaultRouter

from .viewsets import DocumentViewSet, NewsViewSet, PageViewSet

router = DefaultRouter()
router.register(r"pages", PageViewSet, basename="cms-page")
router.register(r"news", NewsViewSet, basename="cms-news")
router.register(r"documents", DocumentViewSet, basename="cms-document")

urlpatterns = router.urls

