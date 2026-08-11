"""Localized public API serializers for CMS content."""

from rest_framework import serializers

from apps.core.api import resolve_lang
from apps.media_library.serializers import MediaAssetLiteSerializer, absolute_file_url

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
    content_blocks = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "content_blocks",
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

    def get_content_blocks(self, obj: News):
        from apps.media_library.models import MediaAsset

        request = self.context.get("request")
        lang = resolve_lang(request) if request is not None else "es"
        raw = obj.content_blocks_en if lang == "en" else obj.content_blocks_es
        blocks = list(raw or [])
        media_ids = [
            block.get("media_id")
            for block in blocks
            if isinstance(block, dict) and block.get("type") == "image" and block.get("media_id")
        ]
        assets = {
            asset.id: asset
            for asset in MediaAsset.objects.filter(id__in=media_ids)
        } if media_ids else {}
        enriched = []
        for block in blocks:
            if not isinstance(block, dict):
                continue
            item = dict(block)
            if item.get("type") == "image" and item.get("media_id") in assets:
                asset = assets[item["media_id"]]
                item["preview_url"] = absolute_file_url(asset.file, self.context)
                if not item.get("alt"):
                    item["alt"] = asset.alt_text or ""
            enriched.append(item)
        return enriched


class DocumentSerializer(serializers.ModelSerializer):
    """One language version per row; filter by Document.language via viewset."""

    cover_image = MediaAssetLiteSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    has_resource = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "language",
            "resource_key",
            "title",
            "slug",
            "file",
            "file_url",
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
            "has_resource",
        )

    def get_file_url(self, obj: Document) -> str | None:
        return absolute_file_url(obj.file, self.context) if obj.file else None

    def get_has_resource(self, obj: Document) -> bool:
        return obj.has_resource()


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
    mobile_image = MediaAssetLiteSerializer(read_only=True)
    cta_url = serializers.CharField(source="link_url", read_only=True)
    open_in_new_tab = serializers.BooleanField(source="link_external", read_only=True)
    order = serializers.IntegerField(source="priority", read_only=True)

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
            "order",
            "link_url",
            "cta_url",
            "link_external",
            "open_in_new_tab",
            "dismissible",
            "background_color",
            "text_color",
            "image",
            "mobile_image",
            "published_at",
        )
