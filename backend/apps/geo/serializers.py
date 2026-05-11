import json

from rest_framework import serializers

from .models import Department


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
    geometry = json.loads(dept.geometry.geojson)  # GEOSGeometry → GeoJSON string
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

