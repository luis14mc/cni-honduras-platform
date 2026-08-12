from rest_framework import serializers

from .models import MediaAsset


def absolute_file_url(file_field, context: dict | None = None) -> str | None:
    """Return a browser-usable absolute URL for a FileField.

    Prefer storage-native absolute URLs (CDN / S3-compatible / signed). Relative
    paths are absolutized with the request host for local FileSystemStorage.
    Missing/orphaned blobs return None — never raise into list serializers.
    """
    if not file_field:
        return None
    try:
        url = file_field.url
    except (OSError, ValueError, FileNotFoundError):
        return None
    if not url:
        return None
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
