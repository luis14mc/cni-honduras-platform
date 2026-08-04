from rest_framework import viewsets

from apps.core.api import LocalizedViewSetMixin

from .filters import parse_bool_param
from .models import Document, InstitutionalLink, News, Page, SiteBanner
from .serializers import (
    DocumentSerializer,
    InstitutionalLinkSerializer,
    NewsSerializer,
    PageSerializer,
    SiteBannerSerializer,
)


class PageViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = PageSerializer

    def get_queryset(self):
        return (
            Page.objects.published()
            .select_related("featured_image")
            .order_by(*Page._meta.ordering)
        )


class NewsViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            News.objects.published()
            .select_related("featured_image")
            .order_by("-is_featured", "-published_at", "-updated_at")
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        featured = parse_bool_param(self.request.query_params.get("featured"))
        if featured is not None:
            queryset = queryset.filter(is_featured=featured)

        return queryset


class DocumentViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Document.objects.published()
            .select_related("cover_image")
            .order_by(*Document._meta.ordering)
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        featured = parse_bool_param(self.request.query_params.get("featured"))
        if featured is not None:
            queryset = queryset.filter(is_featured=featured)

        return queryset


class InstitutionalLinkViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = InstitutionalLinkSerializer

    def get_queryset(self):
        queryset = InstitutionalLink.objects.filter(is_active=True).order_by(
            *InstitutionalLink._meta.ordering
        )
        section = self.request.query_params.get("section")
        if section:
            queryset = queryset.filter(section=section)
        return queryset


class SiteBannerViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = SiteBannerSerializer

    def get_queryset(self):
        queryset = SiteBanner.active_in_window().select_related("image").order_by(
            *SiteBanner._meta.ordering
        )
        placement = self.request.query_params.get("placement")
        if placement:
            queryset = queryset.filter(placement=placement)
        return queryset
