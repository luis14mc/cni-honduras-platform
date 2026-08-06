"""URL map for the authenticated CMS-admin API (``/api/v1/cms-admin/``)."""

from django.urls import path

from .views import CSRFView, DashboardView, LoginView, LogoutView, MeView

app_name = "cms-admin"

urlpatterns = [
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
