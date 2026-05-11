from django.urls import path

from .views import DepartmentDetailView, DepartmentListView

urlpatterns = [
    path("departments/", DepartmentListView.as_view(), name="geo-department-list"),
    path("departments/<slug:slug>/", DepartmentDetailView.as_view(), name="geo-department-detail"),
]

