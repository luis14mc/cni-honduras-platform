from django.http import Http404
from rest_framework import viewsets

from .models import CNIRegion, Department, Municipality
from .serializers import CNIRegionSerializer, DepartmentSerializer, MunicipalitySerializer


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepartmentSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Department.objects.filter(is_active=True).order_by(*Department._meta.ordering)


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
        return (
            Municipality.objects.select_related("department")
            .filter(is_active=True, department__is_active=True)
            .order_by(*Municipality._meta.ordering)
        )

    def get_object(self):
        slug = self.kwargs.get(self.lookup_field)
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(slug=slug).order_by("department__name", "name").first()
        if obj is None:
            raise Http404
        self.check_object_permissions(self.request, obj)
        return obj
