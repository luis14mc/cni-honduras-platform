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
        "geometry": geometry,
        "properties": DepartmentPropertiesSerializer(dept).data,
    }


def departments_feature_collection(qs) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [department_feature(d) for d in qs],
    }
