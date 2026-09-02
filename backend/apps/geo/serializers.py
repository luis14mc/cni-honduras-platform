import json

from rest_framework import serializers

from .models import CNIRegion, Department, Municipality


class GeometrySerializerMixin:
    """Convert GeoDjango geometry fields to GeoJSON dicts in API responses."""

    def geometry_to_geojson(self, obj):
        if not obj.geometry:
            return None
        return json.loads(obj.geometry.geojson)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "geometry" in data:
            data["geometry"] = self.geometry_to_geojson(instance)
        return data


class DepartmentLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "slug", "code")


class DepartmentSerializer(GeometrySerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = (
            "id",
            "name",
            "slug",
            "code",
            "description",
            "geometry",
            "center_lat",
            "center_lng",
            "is_active",
            "created_at",
            "updated_at",
        )


class CNIRegionSerializer(GeometrySerializerMixin, serializers.ModelSerializer):
    departments = DepartmentLiteSerializer(many=True, read_only=True)

    class Meta:
        model = CNIRegion
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "color_hex",
            "geometry",
            "departments",
            "is_active",
            "created_at",
            "updated_at",
        )


class MunicipalitySerializer(GeometrySerializerMixin, serializers.ModelSerializer):
    department = DepartmentLiteSerializer(read_only=True)

    class Meta:
        model = Municipality
        fields = (
            "id",
            "department",
            "name",
            "slug",
            "code",
            "description",
            "geometry",
            "center_lat",
            "center_lng",
            "is_active",
            "created_at",
            "updated_at",
        )


class MunicipalityLiteSerializer(serializers.ModelSerializer):
    department = DepartmentLiteSerializer(read_only=True)

    class Meta:
        model = Municipality
        fields = ("id", "department", "name", "slug", "code", "center_lat", "center_lng")


class DepartmentPropertiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = (
            "name",
            "slug",
            "code",
            "description",
            "center_lat",
            "center_lng",
            "is_active",
        )


class DepartmentFeatureSerializer(serializers.Serializer):
    type = serializers.CharField(default="Feature")
    geometry = serializers.JSONField()
    properties = DepartmentPropertiesSerializer()


def department_feature(dept: Department) -> dict:
    geometry = json.loads(dept.geometry.geojson)
    return {
        "type": "Feature",
        "id": dept.id,
        "geometry": geometry,
        "properties": {
            "name": dept.name,
            "slug": dept.slug,
            "code": dept.code,
            "center_lat": dept.center_lat,
            "center_lng": dept.center_lng,
        },
    }


def departments_feature_collection(qs) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [department_feature(department) for department in qs],
    }


def municipality_feature(municipality: Municipality) -> dict:
    geometry = json.loads(municipality.geometry.geojson) if municipality.geometry else None
    return {
        "type": "Feature",
        "id": municipality.id,
        "geometry": geometry,
        "properties": {
            "name": municipality.name,
            "slug": municipality.slug,
            "code": municipality.code,
            "department_slug": municipality.department.slug,
            "department": municipality.department.slug,
            "center_lat": municipality.center_lat,
            "center_lng": municipality.center_lng,
        },
    }


def municipalities_feature_collection(queryset) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [municipality_feature(municipality) for municipality in queryset],
    }
