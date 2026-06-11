from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import Document, News, Page


class MediaAssetLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ("id", "title", "file", "alt_text", "caption", "media_type", "created_at")


class PageSerializer(serializers.ModelSerializer):
    featured_image = MediaAssetLiteSerializer(read_only=True)

    class Meta:
        model = Page
        fields = (
            "id",
            "title",
            "slug",
            "content",
            "excerpt",
            "featured_image",
            "seo_title",
            "seo_description",
            "published_at",
            "created_at",
            "updated_at",
        )


class NewsSerializer(serializers.ModelSerializer):
    featured_image = MediaAssetLiteSerializer(read_only=True)

    class Meta:
        model = News
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "featured_image",
            "category",
            "author_name",
            "source",
            "external_url",
            "is_featured",
            "seo_title",
            "seo_description",
            "published_at",
            "created_at",
            "updated_at",
        )


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "slug",
            "file",
            "description",
            "category",
            "is_public",
            "created_at",
            "updated_at",
        )

