from rest_framework import serializers

from .models import MediaAsset


class MediaAssetLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ("id", "title", "file", "alt_text", "caption", "media_type", "created_at")
