from django.utils import timezone
from rest_framework import viewsets

from .models import Document, News, Page, PublishStatus
from .serializers import DocumentSerializer, NewsSerializer, PageSerializer


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PageSerializer

    def get_queryset(self):
        now = timezone.now()
        return (
            Page.objects.select_related("featured_image")
            .filter(status=PublishStatus.PUBLISHED)
            .filter(published_at__isnull=False, published_at__lte=now)
            .order_by(*Page._meta.ordering)
        )


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsSerializer
    lookup_field = "slug"

    def get_queryset(self):
        now = timezone.now()
        queryset = (
            News.objects.select_related("featured_image")
            .filter(status=PublishStatus.PUBLISHED)
            .filter(published_at__isnull=False, published_at__lte=now)
            .order_by("-published_at", "-updated_at")
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        featured = self.request.query_params.get("featured")
        if featured and featured.lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(is_featured=True)

        return queryset


class DocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentSerializer

    def get_queryset(self):
        return Document.objects.filter(is_public=True).order_by(*Document._meta.ordering)

