from rest_framework import serializers

from apps.geo.models import Department
from apps.geo.serializers import CNIRegionSerializer, DepartmentLiteSerializer, MunicipalitySerializer
from apps.media_library.serializers import MediaAssetLiteSerializer

from .models import (
    InvestmentOpportunity,
    InvestmentProject,
    OpportunityFundUse,
    OpportunityMetric,
    Sector,
    SuccessStory,
)


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


class OpportunityFundUsePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpportunityFundUse
        fields = ("id", "component", "amount", "description", "order")


class InvestmentOpportunitySerializer(serializers.ModelSerializer):
    sector = SectorLiteSerializer(read_only=True)
    department = DepartmentLiteSerializer(read_only=True)
    region = CNIRegionSerializer(read_only=True)
    metrics = OpportunityMetricPublicSerializer(many=True, read_only=True)
    fund_uses = OpportunityFundUsePublicSerializer(many=True, read_only=True)
    # Deal lifecycle kept as ``status`` for portafolio/map consumers.
    status = serializers.CharField(source="lifecycle_status", read_only=True)
    is_public = serializers.SerializerMethodField()
    opportunity_description = serializers.CharField(source="description", read_only=True)

    class Meta:
        model = InvestmentOpportunity
        fields = (
            "id",
            "code",
            "title",
            "slug",
            "summary",
            "description",
            "opportunity_description",
            "target_customer",
            "market_demand",
            "value_proposition",
            "sector",
            "department",
            "region",
            "estimated_investment",
            "estimated_jobs",
            "status",
            "lifecycle_status",
            "is_public",
            "is_featured",
            "order",
            "metrics",
            "fund_uses",
            "published_at",
            "created_at",
            "updated_at",
        )

    def get_is_public(self, obj: InvestmentOpportunity) -> bool:
        return True


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
