from rest_framework import serializers

from apps.geo.models import Department
from apps.geo.serializers import CNIRegionSerializer, DepartmentLiteSerializer, MunicipalitySerializer
from apps.media_library.serializers import MediaAssetLiteSerializer

from .models import (
    InvestmentOpportunity,
    InvestmentProject,
    OpportunityMetric,
    Sector,
    SuccessStory,
)

PUBLIC_METRIC_LIMIT = 4
PUBLIC_SUMMARY_MAX = 400
PUBLIC_VALUE_PROP_MAX = 280


class SectorLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ("id", "name", "slug", "icon", "color_hex")


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "icon",
            "image",
            "color_hex",
            "is_featured",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        )


class OpportunityMetricPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpportunityMetric
        fields = ("id", "label", "value", "note", "icon", "order")


def _truncate(text: str, limit: int) -> str:
    cleaned = (text or "").strip()
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: max(0, limit - 1)].rstrip() + "…"


class InvestmentOpportunitySerializer(serializers.ModelSerializer):
    """Public teaser serializer — never expose CAPEX or internal narrative fields."""

    sector = SectorLiteSerializer(read_only=True)
    metrics = serializers.SerializerMethodField()
    status = serializers.CharField(source="lifecycle_status", read_only=True)
    is_public = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    value_proposition = serializers.SerializerMethodField()

    class Meta:
        model = InvestmentOpportunity
        fields = (
            "id",
            "code",
            "title",
            "slug",
            "summary",
            "value_proposition",
            "sector",
            "estimated_investment",
            "estimated_jobs",
            "status",
            "lifecycle_status",
            "is_public",
            "is_featured",
            "order",
            "metrics",
            "published_at",
        )

    def get_is_public(self, obj: InvestmentOpportunity) -> bool:
        return True

    def get_summary(self, obj: InvestmentOpportunity) -> str:
        text = (obj.summary or "").strip()
        if text:
            return _truncate(text, PUBLIC_SUMMARY_MAX)
        # Fallback teaser from internal description — never return the full dossier.
        return _truncate(obj.description or "", PUBLIC_SUMMARY_MAX)

    def get_value_proposition(self, obj: InvestmentOpportunity) -> str:
        return _truncate(obj.value_proposition or "", PUBLIC_VALUE_PROP_MAX)

    def get_metrics(self, obj: InvestmentOpportunity) -> list:
        prefetched = getattr(obj, "_prefetched_objects_cache", {}).get("metrics")
        if prefetched is not None:
            rows = [m for m in prefetched if m.is_public]
            rows = sorted(rows, key=lambda m: (m.order, m.id))[:PUBLIC_METRIC_LIMIT]
        else:
            rows = list(
                obj.metrics.filter(is_public=True).order_by("order", "id")[:PUBLIC_METRIC_LIMIT]
            )
        return OpportunityMetricPublicSerializer(rows, many=True).data


class InvestmentProjectSerializer(serializers.ModelSerializer):
    sector = SectorLiteSerializer(read_only=True)
    department = DepartmentLiteSerializer(read_only=True)
    region = CNIRegionSerializer(read_only=True)
    municipality = MunicipalitySerializer(read_only=True)

    class Meta:
        model = InvestmentProject
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "sector",
            "department",
            "region",
            "municipality",
            "investment_amount",
            "estimated_jobs",
            "project_stage",
            "is_public",
            "is_featured",
            "created_at",
            "updated_at",
        )


class SuccessStorySerializer(serializers.ModelSerializer):
    sector = SectorLiteSerializer(read_only=True)
    logo = MediaAssetLiteSerializer(read_only=True)
    featured_image = MediaAssetLiteSerializer(read_only=True)
    person_photo = MediaAssetLiteSerializer(read_only=True)

    class Meta:
        model = SuccessStory
        fields = (
            "id",
            "title",
            "slug",
            "company_name",
            "sector",
            "summary",
            "content",
            "image",
            "logo",
            "featured_image",
            "person_photo",
            "person_name",
            "person_role",
            "country_origin",
            "investment_amount",
            "jobs_generated",
            "testimonial_quote",
            "testimonial_author",
            "is_featured",
            "order",
            "published_at",
            "created_at",
            "updated_at",
        )


class DepartmentMapCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "slug", "code", "center_lat", "center_lng")


class DepartmentMapSummarySerializer(serializers.Serializer):
    department = DepartmentMapCenterSerializer()
    projects_count = serializers.IntegerField()
    opportunities_count = serializers.IntegerField()
    total_investment = serializers.DecimalField(
        max_digits=18, decimal_places=2, allow_null=True
    )
    estimated_jobs = serializers.IntegerField(allow_null=True)
    sectors = SectorLiteSerializer(many=True)
