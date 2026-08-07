"""URL map for the authenticated CMS-admin API (``/api/v1/cms-admin/``)."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewsets import (
    DocumentAdminViewSet,
    MediaAssetViewSet,
    NewsAdminViewSet,
    SiteBannerAdminViewSet,
    SuccessStoryAdminViewSet,
)
from .views import CSRFView, DashboardView, LoginView, LogoutView, MeView

app_name = "cms-admin"

router = DefaultRouter()
router.register("media", MediaAssetViewSet, basename="media")
router.register("news", NewsAdminViewSet, basename="news")
router.register("documents", DocumentAdminViewSet, basename="documents")
router.register("banners", SiteBannerAdminViewSet, basename="banners")
router.register("success-stories", SuccessStoryAdminViewSet, basename="success-stories")

urlpatterns = [
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]
