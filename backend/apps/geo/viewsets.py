from django.http import Http404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.api import LocalizedViewSetMixin

from .models import CNIRegion, Department, Municipality, RoadCorridor, StrategicInfrastructure
from .serializers import (
    roads_feature_collection,
    CNIRegionSerializer,
    DepartmentSerializer,
    MunicipalitySerializer,
    departments_feature_collection,
    municipalities_feature_collection,
    regions_feature_collection,
    StrategicInfrastructureSerializer,
    infrastructure_feature_collection,
)

REGION_LEVELS = {value for value, _ in CNIRegion.LEVEL_CHOICES}


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

    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        level = request.query_params.get("level", "sub")
        if level not in REGION_LEVELS:
            return Response(
                {"detail": f"level debe ser uno de: {', '.join(sorted(REGION_LEVELS))}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = (
            CNIRegion.objects.filter(is_active=True, level=level, code__isnull=False)
            .only("id", "code", "name", "level", "color_hex", "extra", "geometry")
            .order_by("code")
        )
        return Response(regions_feature_collection(queryset))


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


class StrategicInfrastructureViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StrategicInfrastructureSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = StrategicInfrastructure.objects.select_related(
            "department", "municipality"
        ).filter(is_active=True)
        infrastructure_type = self.request.query_params.get("type")
        if infrastructure_type:
            queryset = queryset.filter(infrastructure_type=infrastructure_type)
        department = self.request.query_params.get("department")
        if department:
            queryset = queryset.filter(department__slug=department)
        municipality = self.request.query_params.get("municipality")
        if municipality:
            queryset = queryset.filter(municipality__slug=municipality)
        return queryset.order_by(*StrategicInfrastructure._meta.ordering)

    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        return Response(infrastructure_feature_collection(self.get_queryset()))


ROAD_CLASSES = {value for value, _ in RoadCorridor.ROAD_CLASS}
ROAD_CACHE_SECONDS = 60 * 60


class RoadCorridorViewSet(LocalizedViewSetMixin, viewsets.GenericViewSet):
    """Read-only GeoJSON of the main road network; `?lang=` localizes name/description."""

    queryset = RoadCorridor.objects.none()

    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        queryset = RoadCorridor.objects.filter(is_active=True)
        road_class = request.query_params.get("class")
        if road_class is not None:
            if road_class not in ROAD_CLASSES:
                return Response(
                    {"detail": f"class debe ser uno de: {', '.join(sorted(ROAD_CLASSES))}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = queryset.filter(road_class=road_class)
        strategic = request.query_params.get("strategic")
        if strategic is not None:
            if strategic not in {"true", "false"}:
                return Response(
                    {"detail": "strategic debe ser true o false."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = queryset.filter(is_strategic=strategic == "true")
        response = Response(roads_feature_collection(queryset.order_by("ref", "code")))
        response["Cache-Control"] = f"public, max-age={ROAD_CACHE_SECONDS}"
        return response
