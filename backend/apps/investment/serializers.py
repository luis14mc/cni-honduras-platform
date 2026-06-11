from rest_framework import serializers

from apps.geo.serializers import CNIRegionSerializer, DepartmentLiteSerializer, MunicipalitySerializer

from .models import InvestmentOpportunity, InvestmentProject, Sector, SuccessStory


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


class InvestmentOpportunitySerializer(serializers.ModelSerializer):
    sector = SectorLiteSerializer(read_only=True)
    department = DepartmentLiteSerializer(read_only=True)
    region = CNIRegionSerializer(read_only=True)

    class Meta:
        model = InvestmentOpportunity
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "sector",
            "department",
            "region",
            "estimated_investment",
            "estimated_jobs",
            "status",
            "is_public",
            "is_featured",
            "created_at",
            "updated_at",
        )


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
            "country_origin",
            "investment_amount",
            "jobs_generated",
            "is_public",
            "is_featured",
            "created_at",
            "updated_at",
        )
