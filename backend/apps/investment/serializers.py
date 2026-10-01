import json

from rest_framework import serializers

from apps.geo.models import CNIRegion, Department, Municipality
from apps.geo.serializers import (
    DepartmentLiteSerializer,
    MunicipalityLiteSerializer,
)
from apps.media_library.serializers import MediaAssetLiteSerializer, absolute_file_url

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


class RegionRefSerializer(serializers.ModelSerializer):
    parent = serializers.SerializerMethodField()

    class Meta:
        model = CNIRegion
        fields = ("id", "name", "slug", "code", "level", "parent")

    def get_parent(self, obj: CNIRegion) -> dict | None:
        parent = obj.parent
        if parent is None:
            return None
        return {
            "id": parent.id,
            "name": parent.name,
            "slug": parent.slug,
            "code": parent.code,
            "level": parent.level,
        }


def cover_image_url(obj, context) -> str | None:
    asset = getattr(obj, "cover_image", None)
    if asset is None:
        return None
    return absolute_file_url(asset.file, context)


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
    department = DepartmentLiteSerializer(read_only=True)
    region = RegionRefSerializer(read_only=True)
    metrics = serializers.SerializerMethodField()
    status = serializers.CharField(source="lifecycle_status", read_only=True)
    is_public = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    value_proposition = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

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
            "published_at",
            "cover_image_url",
            "location_text",
            "amount_text",
            "amount_notes",
            "phase",
            "phase_detail",
            "investment_type",
            "location",
            "latitude",
            "longitude",
        )

    def get_cover_image_url(self, obj: InvestmentOpportunity) -> str | None:
        return cover_image_url(obj, self.context)

    def get_location(self, obj: InvestmentOpportunity) -> dict | None:
        coords = obj.map_coordinates
        if coords is None:
            return None
        return {"type": "Point", "coordinates": [coords[0], coords[1]]}

    def get_latitude(self, obj: InvestmentOpportunity) -> float | None:
        coords = obj.map_coordinates
        return coords[1] if coords else None

    def get_longitude(self, obj: InvestmentOpportunity) -> float | None:
        coords = obj.map_coordinates
        return coords[0] if coords else None

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


class MunicipalityMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = ("id", "name", "slug", "code")


class InvestmentProjectMapSerializer(serializers.ModelSerializer):
    """Lightweight serializer for georeferenced map markers."""

    sector = SectorLiteSerializer(read_only=True)
    department = DepartmentLiteSerializer(read_only=True)
    municipality = MunicipalityMapSerializer(read_only=True)
    location = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    stage = serializers.CharField(source="project_stage", read_only=True)
    featured = serializers.BooleanField(source="is_featured", read_only=True)

    class Meta:
        model = InvestmentProject
        fields = (
            "id",
            "title",
            "slug",
            "sector",
            "department",
            "municipality",
            "stage",
            "investment_amount",
            "estimated_jobs",
            "location",
            "latitude",
            "longitude",
            "featured",
        )

    def get_location(self, obj: InvestmentProject) -> dict | None:
        return json.loads(obj.location.geojson) if obj.location else None

    def get_latitude(self, obj: InvestmentProject) -> float | None:
        return obj.location.y if obj.location else None

    def get_longitude(self, obj: InvestmentProject) -> float | None:
        return obj.location.x if obj.location else None


class InvestmentProjectSerializer(serializers.ModelSerializer):
    sector = SectorLiteSerializer(read_only=True)
    department = DepartmentLiteSerializer(read_only=True)
    region = RegionRefSerializer(read_only=True)
    municipality = MunicipalityLiteSerializer(read_only=True)
    location = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = InvestmentProject
        fields = (
            "id",
            "code",
            "title",
            "slug",
            "summary",
            "description",
            "sector",
            "department",
            "region",
            "municipality",
            "location",
            "latitude",
            "longitude",
            "investment_amount",
            "estimated_jobs",
            "project_stage",
            "is_public",
            "is_featured",
            "cover_image_url",
            "location_text",
            "amount_text",
            "amount_notes",
            "phase",
            "phase_detail",
            "investment_type",
            "created_at",
            "updated_at",
        )

    def get_cover_image_url(self, obj: InvestmentProject) -> str | None:
        return cover_image_url(obj, self.context)

    def get_location(self, obj: InvestmentProject) -> dict | None:
        return json.loads(obj.location.geojson) if obj.location else None

    def get_latitude(self, obj: InvestmentProject) -> float | None:
        return obj.location.y if obj.location else None

    def get_longitude(self, obj: InvestmentProject) -> float | None:
        return obj.location.x if obj.location else None


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


def _sector_properties(sector) -> dict | None:
    if sector is None:
        return None
    return {"id": sector.id, "name": sector.name, "slug": sector.slug, "color_hex": sector.color_hex}


def _place_slug(place) -> str | None:
    return place.slug if place is not None else None


def opportunity_feature(opp: InvestmentOpportunity) -> dict | None:
    """GeoJSON Feature (punto) de una oportunidad. None si no se puede ubicar."""
    coords = opp.map_coordinates
    if coords is None:
        return None
    return {
        "type": "Feature",
        "id": opp.id,
        "geometry": {"type": "Point", "coordinates": [coords[0], coords[1]]},
        "properties": {
            "id": opp.id,
            "layer": "opportunity",
            "code": opp.code,
            "title": opp.title,
            "slug": opp.slug,
            "sector": _sector_properties(opp.sector),
            "department": _place_slug(opp.department),
            "status": opp.lifecycle_status,
            "estimated_investment": (
                str(opp.estimated_investment) if opp.estimated_investment is not None else None
            ),
            "estimated_jobs": opp.estimated_jobs,
            "approximate": opp.location is None,
        },
    }


def opportunities_feature_collection(queryset) -> dict:
    features = [feature for opp in queryset if (feature := opportunity_feature(opp)) is not None]
    return {"type": "FeatureCollection", "features": features}


def project_feature(project: InvestmentProject) -> dict | None:
    """GeoJSON Feature (punto) de un proyecto. None si no tiene ubicación."""
    if not project.location:
        return None
    return {
        "type": "Feature",
        "id": project.id,
        "geometry": {"type": "Point", "coordinates": [project.location.x, project.location.y]},
        "properties": {
            "id": project.id,
            "layer": "project",
            "title": project.title,
            "slug": project.slug,
            "sector": _sector_properties(project.sector),
            "department": _place_slug(project.department),
            "municipality": _place_slug(project.municipality),
            "stage": project.project_stage,
            "investment_amount": (
                str(project.investment_amount) if project.investment_amount is not None else None
            ),
            "estimated_jobs": project.estimated_jobs,
        },
    }


def projects_feature_collection(queryset) -> dict:
    features = [feature for p in queryset if (feature := project_feature(p)) is not None]
    return {"type": "FeatureCollection", "features": features}


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
