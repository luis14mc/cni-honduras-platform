from decimal import Decimal

from django.db.models import Count, Q, Sum
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cms.models import PublishStatus
from apps.core.api import LocalizedViewSetMixin
from apps.geo.models import Department

from .filters import apply_slug_filter, parse_bool_param
from .models import InvestmentOpportunity, InvestmentProject, Sector, SuccessStory
from .serializers import (
    DepartmentMapSummarySerializer,
    InvestmentOpportunitySerializer,
    InvestmentProjectSerializer,
    SectorSerializer,
    SuccessStorySerializer,
)


class SectorViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = SectorSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Sector.objects.filter(is_active=True).order_by(*Sector._meta.ordering)


class InvestmentOpportunityViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = InvestmentOpportunitySerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            InvestmentOpportunity.objects.published()
            .select_related("sector", "department", "region")
            .prefetch_related("metrics")
            .filter(Q(sector__isnull=True) | Q(sector__is_active=True))
            .order_by(*InvestmentOpportunity._meta.ordering)
        )
        queryset = apply_slug_filter(queryset, "sector", "sector__slug", self.request)
        queryset = apply_slug_filter(queryset, "department", "department__slug", self.request)
        queryset = apply_slug_filter(queryset, "region", "region__slug", self.request)
        lifecycle = self.request.query_params.get("lifecycle_status") or self.request.query_params.get(
            "status"
        )
        if lifecycle in {"open", "in_progress", "closed"}:
            queryset = queryset.filter(lifecycle_status=lifecycle)
        featured = parse_bool_param(self.request.query_params.get("featured"))
        if featured is not None:
            queryset = queryset.filter(is_featured=featured)
        return queryset


class InvestmentProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvestmentProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            InvestmentProject.objects.select_related(
                "sector", "department", "region", "municipality"
            )
            .filter(is_public=True, sector__is_active=True)
            .order_by(*InvestmentProject._meta.ordering)
        )
        queryset = apply_slug_filter(queryset, "sector", "sector__slug", self.request)
        queryset = apply_slug_filter(queryset, "department", "department__slug", self.request)
        queryset = apply_slug_filter(queryset, "region", "region__slug", self.request)
        queryset = apply_slug_filter(
            queryset, "municipality", "municipality__slug", self.request
        )
        stage = self.request.query_params.get("stage")
        if stage:
            queryset = queryset.filter(project_stage=stage)
        featured = parse_bool_param(self.request.query_params.get("featured"))
        if featured is not None:
            queryset = queryset.filter(is_featured=featured)
        return queryset


class SuccessStoryViewSet(LocalizedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = SuccessStorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            SuccessStory.objects.published()
            .select_related("sector", "logo", "featured_image", "person_photo")
            .order_by(*SuccessStory._meta.ordering)
        )
        sector_slug = self.request.query_params.get("sector")
        if sector_slug:
            queryset = queryset.filter(sector__slug=sector_slug)
        featured = parse_bool_param(self.request.query_params.get("featured"))
        if featured is not None:
            queryset = queryset.filter(is_featured=featured)
        return queryset


_PUBLIC_PROJECT_FILTER = Q(projects__is_public=True, projects__sector__is_active=True)
_PUBLIC_OPPORTUNITY_FILTER = Q(
    opportunities__status=PublishStatus.PUBLISHED,
    opportunities__published_at__isnull=False,
) & (Q(opportunities__sector__isnull=True) | Q(opportunities__sector__is_active=True))


class MapSummaryAPIView(APIView):
    """Aggregated investment metrics per department for the interactive map."""

    def get(self, request):
        departments = (
            Department.objects.filter(is_active=True)
            .annotate(
                projects_count=Count("projects", filter=_PUBLIC_PROJECT_FILTER, distinct=True),
                opportunities_count=Count(
                    "opportunities", filter=_PUBLIC_OPPORTUNITY_FILTER, distinct=True
                ),
                projects_investment=Sum(
                    "projects__investment_amount", filter=_PUBLIC_PROJECT_FILTER
                ),
                opportunities_investment=Sum(
                    "opportunities__estimated_investment", filter=_PUBLIC_OPPORTUNITY_FILTER
                ),
                projects_jobs=Sum("projects__estimated_jobs", filter=_PUBLIC_PROJECT_FILTER),
                opportunities_jobs=Sum(
                    "opportunities__estimated_jobs", filter=_PUBLIC_OPPORTUNITY_FILTER
                ),
            )
            .order_by("name")
        )

        sector_ids_by_department: dict[int, set[int]] = {}
        for department_id, sector_id in (
            InvestmentProject.objects.filter(
                is_public=True,
                sector__is_active=True,
                department_id__isnull=False,
            )
            .values_list("department_id", "sector_id")
            .distinct()
        ):
            sector_ids_by_department.setdefault(department_id, set()).add(sector_id)
        for department_id, sector_id in (
            InvestmentOpportunity.objects.published()
            .filter(
                sector__is_active=True,
                department_id__isnull=False,
            )
            .values_list("department_id", "sector_id")
            .distinct()
        ):
            sector_ids_by_department.setdefault(department_id, set()).add(sector_id)

        all_sector_ids = {
            sector_id
            for sector_ids in sector_ids_by_department.values()
            for sector_id in sector_ids
        }
        sectors_by_id = (
            Sector.objects.filter(id__in=all_sector_ids, is_active=True).in_bulk()
            if all_sector_ids
            else {}
        )

        payload = []
        for department in departments:
            project_investment = department.projects_investment or Decimal("0")
            opportunity_investment = department.opportunities_investment or Decimal("0")
            total_investment = project_investment + opportunity_investment
            estimated_jobs = (department.projects_jobs or 0) + (
                department.opportunities_jobs or 0
            )
            dept_sector_ids = sector_ids_by_department.get(department.id, set())
            sectors = [
                sectors_by_id[sector_id]
                for sector_id in sorted(dept_sector_ids, key=lambda sid: sectors_by_id[sid].order)
                if sector_id in sectors_by_id
            ]
            payload.append(
                {
                    "department": department,
                    "projects_count": department.projects_count,
                    "opportunities_count": department.opportunities_count,
                    "total_investment": total_investment if total_investment else None,
                    "estimated_jobs": estimated_jobs or None,
                    "sectors": sectors,
                }
            )

        serializer = DepartmentMapSummarySerializer(payload, many=True)
        return Response(serializer.data)
