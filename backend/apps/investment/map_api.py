from django.db.models import Q
from rest_framework.response import Response

from apps.core.api import LocalizedViewSetMixin
from apps.geo.serializers import DepartmentLiteSerializer

from .demo_slugs import DEMO_INVESTMENT_SLUGS
from .models import InvestmentOpportunity, InvestmentProject, SuccessStory
from .serializers import InvestmentProjectMapSerializer, SectorLiteSerializer, cover_image_url


def item_details(item, request):
    return {
        "code": item.code,
        "amountText": item.amount_text,
        "locationText": item.location_text,
        "coverImageUrl": cover_image_url(item, {"request": request}),
    }


def other_item(item, request, *, story=False):
    coordinates = None if story else item.map_coordinates
    longitude, latitude = coordinates if coordinates else (None, None)
    amount = item.investment_amount if story else item.estimated_investment
    return {
        "id": item.pk * 3 + (2 if story else 1),
        "kind": "case" if story else "opportunity",
        "slug": item.slug,
        "title": item.title,
        "sector": SectorLiteSerializer(item.sector).data if item.sector else None,
        "department": (
            DepartmentLiteSerializer(item.department).data
            if not story and item.department else None
        ),
        "municipality": None,
        "stage": "" if story else item.lifecycle_status,
        "investment_amount": str(amount) if amount is not None else None,
        "estimated_jobs": item.jobs_generated if story else item.estimated_jobs,
        "location": {"type": "Point", "coordinates": coordinates} if coordinates else None,
        "latitude": latitude,
        "longitude": longitude,
        "featured": item.is_featured,
        **({} if story else item_details(item, request)),
    }


class InvestmentMapItemsViewSet(LocalizedViewSetMixin):
    """Published investment catalog, including records without a map position."""

    def list(self, request):
        active_sector = Q(sector__isnull=True) | Q(sector__is_active=True)
        projects = list(
            InvestmentProject.objects.filter(is_public=True, sector__is_active=True)
            .exclude(slug__in=DEMO_INVESTMENT_SLUGS)
            .select_related("sector", "department", "municipality", "cover_image")
        )
        opportunities = (
            InvestmentOpportunity.objects.published().filter(active_sector)
            .exclude(slug__in=DEMO_INVESTMENT_SLUGS)
            .select_related("sector", "department", "cover_image")
        )
        stories = (
            SuccessStory.objects.published().filter(active_sector)
            .exclude(slug__in=DEMO_INVESTMENT_SLUGS)
            .select_related("sector")
        )
        markers = InvestmentProjectMapSerializer(projects, many=True).data
        return Response([
            *(
                {**data, **item_details(item, request), "id": item.pk * 3, "kind": "project"}
                for item, data in zip(projects, markers, strict=True)
            ),
            *(other_item(item, request) for item in opportunities),
            *(other_item(item, request, story=True) for item in stories),
        ])
