from decimal import Decimal

from django.db.models import (
    Count,
    DecimalField,
    IntegerField,
    OuterRef,
    Q,
    Subquery,
    Sum,
    Value,
)
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api import LocalizedViewSetMixin
from apps.geo.models import Department

from .filters import apply_slug_filter, parse_bool_param
from .models import InvestmentOpportunity, InvestmentProject, Sector, SuccessStory
from .serializers import (
    DepartmentMapSummarySerializer,
    InvestmentOpportunitySerializer,
    InvestmentProjectMapSerializer,
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

    def get_serializer_class(self):
        if self.action == "list" and parse_bool_param(
            self.request.query_params.get("has_location")
        ):
            return InvestmentProjectMapSerializer
        return InvestmentProjectSerializer

    def paginate_queryset(self, queryset):
        if self.action == "list" and parse_bool_param(
            self.request.query_params.get("has_location")
        ):
            return None
        return super().paginate_queryset(queryset)

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
        has_location = parse_bool_param(self.request.query_params.get("has_location"))
        if has_location is not None:
            queryset = queryset.filter(location__isnull=not has_location)
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


class MapSummaryAPIView(APIView):
    """Aggregated investment metrics per department for the interactive map."""

    def get(self, request):
        sector_slug = request.query_params.get("sector")
        stage = request.query_params.get("stage")

        project_queryset = InvestmentProject.objects.filter(
            department_id=OuterRef("pk"),
            is_public=True,
            sector__is_active=True,
        )
        if sector_slug:
            project_queryset = project_queryset.filter(sector__slug=sector_slug)
        if stage:
            project_queryset = project_queryset.filter(project_stage=stage)

        def project_metric(aggregate):
            return Subquery(
                project_queryset.values("department_id")
                .annotate(value=aggregate)
                .values("value")[:1]
            )

        opportunity_queryset = InvestmentOpportunity.objects.published().filter(
            department_id=OuterRef("pk")
        ).filter(Q(sector__isnull=True) | Q(sector__is_active=True))
        if sector_slug:
            opportunity_queryset = opportunity_queryset.filter(sector__slug=sector_slug)

        def opportunity_metric(aggregate):
            return Subquery(
                opportunity_queryset.values("department_id")
                .annotate(value=aggregate)
                .values("value")[:1]
            )

        if stage:
            opportunity_count = Value(0, output_field=IntegerField())
            opportunity_sum = Value(
                None, output_field=DecimalField(max_digits=18, decimal_places=2)
            )
            opportunity_jobs = Value(0, output_field=IntegerField())
        else:
            opportunity_count = opportunity_metric(Count("id"))
            opportunity_sum = opportunity_metric(Sum("estimated_investment"))
            opportunity_jobs = opportunity_metric(Sum("estimated_jobs"))

        departments = (
            Department.objects.filter(is_active=True)
            .annotate(
                projects_count=Coalesce(project_metric(Count("id")), Value(0)),
                opportunities_count=Coalesce(opportunity_count, Value(0)),
                projects_investment=project_metric(Sum("investment_amount")),
                opportunities_investment=opportunity_sum,
                projects_jobs=Coalesce(project_metric(Sum("estimated_jobs")), Value(0)),
                opportunities_jobs=Coalesce(opportunity_jobs, Value(0)),
            )
            .order_by("name")
        )

        sector_ids_by_department: dict[int, set[int]] = {}
        project_sectors = InvestmentProject.objects.filter(
            is_public=True,
            sector__is_active=True,
            department_id__isnull=False,
        )
        if sector_slug:
            project_sectors = project_sectors.filter(sector__slug=sector_slug)
        if stage:
            project_sectors = project_sectors.filter(project_stage=stage)
        for department_id, sector_id in (
            project_sectors
            .values_list("department_id", "sector_id")
            .distinct()
        ):
            sector_ids_by_department.setdefault(department_id, set()).add(sector_id)
        if not stage:
            opportunity_sectors = InvestmentOpportunity.objects.published().filter(
                sector__is_active=True,
                department_id__isnull=False,
            )
            if sector_slug:
                opportunity_sectors = opportunity_sectors.filter(sector__slug=sector_slug)
            for department_id, sector_id in (
                opportunity_sectors.values_list("department_id", "sector_id").distinct()
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
