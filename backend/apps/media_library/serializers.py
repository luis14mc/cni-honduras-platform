from rest_framework import serializers

from .models import MediaAsset


def absolute_file_url(file_field, context: dict | None = None) -> str | None:
    """Return an absolute URL for a FileField (API or S3/R2 custom domain)."""
    if not file_field:
        return None
    url = file_field.url
    if url.startswith(("http://", "https://")):
        return url
    request = (context or {}).get("request")
    if request is not None:
        return request.build_absolute_uri(url)
    return url


class MediaAssetLiteSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = (
            "id",
            "title",
            "file",
            "file_url",
            "alt_text",
            "caption",
            "media_type",
            "created_at",
        )

    def get_file_url(self, obj: MediaAsset) -> str | None:
        return absolute_file_url(obj.file, self.context)
