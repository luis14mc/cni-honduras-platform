from rest_framework import serializers

from apps.media_library.serializers import MediaAssetLiteSerializer

from .models import Document, InstitutionalLink, News, Page, SiteBanner


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
    cover_image = MediaAssetLiteSerializer(read_only=True)

    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "slug",
            "file",
            "external_url",
            "description",
            "category",
            "is_featured",
            "order",
            "cover_image",
            "file_type",
            "file_size_bytes",
            "published_at",
            "document_date",
            "seo_title",
            "seo_description",
            "created_at",
            "updated_at",
        )


class InstitutionalLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalLink
        fields = (
            "id",
            "section",
            "title",
            "description",
            "url",
            "is_external",
            "icon",
            "accent_color",
            "order",
        )


class SiteBannerSerializer(serializers.ModelSerializer):
    image = MediaAssetLiteSerializer(read_only=True)

    class Meta:
        model = SiteBanner
        fields = (
            "id",
            "placement",
            "title",
            "body",
            "cta_label",
            "starts_at",
            "ends_at",
            "priority",
            "link_url",
            "link_external",
            "dismissible",
            "background_color",
            "text_color",
            "image",
            "published_at",
        )
