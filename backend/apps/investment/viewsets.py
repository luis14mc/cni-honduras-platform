from rest_framework import viewsets

from .models import InvestmentOpportunity, InvestmentProject, Sector, SuccessStory
from .serializers import (
    InvestmentOpportunitySerializer,
    InvestmentProjectSerializer,
    SectorSerializer,
    SuccessStorySerializer,
)


class SectorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SectorSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Sector.objects.filter(is_active=True).order_by(*Sector._meta.ordering)


class InvestmentOpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvestmentOpportunitySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            InvestmentOpportunity.objects.select_related("sector", "department", "region")
            .filter(is_public=True, sector__is_active=True)
            .order_by(*InvestmentOpportunity._meta.ordering)
        )


class InvestmentProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvestmentProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            InvestmentProject.objects.select_related("sector", "department", "region", "municipality")
            .filter(is_public=True, sector__is_active=True)
            .order_by(*InvestmentProject._meta.ordering)
        )


class SuccessStoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SuccessStorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            SuccessStory.objects.select_related("sector")
            .filter(is_public=True)
            .order_by(*SuccessStory._meta.ordering)
        )
