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
    """Expose locale-resolved file/URL/cover without ES→EN fallback for files."""

    cover_image = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    external_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    has_resource = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
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

    def _lang(self) -> str:
        request = self.context.get("request")
        if request is None:
            return "es"
        return resolve_lang(request)

    def _file_field(self, obj: Document):
        return obj.file_en if self._lang() == "en" else obj.file_es

    def _external_value(self, obj: Document) -> str:
        return obj.external_url_en if self._lang() == "en" else obj.external_url_es

    def _cover(self, obj: Document):
        return obj.cover_image_en if self._lang() == "en" else obj.cover_image_es

    def get_file(self, obj: Document) -> str:
        field = self._file_field(obj)
        return field.name if field else ""

    def get_file_url(self, obj: Document) -> str | None:
        field = self._file_field(obj)
        return absolute_file_url(field, self.context) if field else None

    def get_external_url(self, obj: Document) -> str:
        return self._external_value(obj) or ""

    def get_cover_image(self, obj: Document):
        cover = self._cover(obj)
        if not cover:
            return None
        return MediaAssetLiteSerializer(cover, context=self.context).data

    def get_has_resource(self, obj: Document) -> bool:
        lang = self._lang()
        if lang == "en":
            return obj._has_uploaded_file("en") or obj._has_external_url("en")
        return obj._has_uploaded_file("es") or obj._has_external_url("es")


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
