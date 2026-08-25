from django.http import Http404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CNIRegion, Department, Municipality
from .serializers import (
    CNIRegionSerializer,
    DepartmentSerializer,
    MunicipalitySerializer,
    departments_feature_collection,
    municipalities_feature_collection,
)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepartmentSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Department.objects.filter(is_active=True).order_by(*Department._meta.ordering)

    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        queryset = self.get_queryset().only(
            "id", "name", "slug", "code", "geometry", "center_lat", "center_lng"
        )
        return Response(departments_feature_collection(queryset))


class CNIRegionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CNIRegionSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            CNIRegion.objects.prefetch_related("departments")
            .filter(is_active=True)
            .order_by(*CNIRegion._meta.ordering)
        )


class MunicipalityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MunicipalitySerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Municipality.objects.select_related("department")
            .filter(is_active=True, department__is_active=True)
            .order_by(*Municipality._meta.ordering)
        )
        department_slug = self.request.query_params.get("department")
        if department_slug:
            queryset = queryset.filter(department__slug=department_slug)
        region_slug = self.request.query_params.get("region")
        if region_slug:
            queryset = queryset.filter(department__regions__slug=region_slug).distinct()
        return queryset

    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        department_slug = request.query_params.get("department")
        if not department_slug:
            return Response(
                {"detail": "Query parameter 'department' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = self.get_queryset().only(
            "id",
            "department_id",
            "department__id",
            "department__name",
            "department__slug",
            "department__code",
            "name",
            "slug",
            "code",
            "geometry",
            "center_lat",
            "center_lng",
        )
        return Response(municipalities_feature_collection(queryset))

    def get_object(self):
        slug = self.kwargs.get(self.lookup_field)
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(slug=slug).order_by("department__name", "name").first()
        if obj is None:
            raise Http404
        self.check_object_permissions(self.request, obj)
        return obj
