"""Write serializers for the authenticated CMS-admin editorial API."""

from __future__ import annotations

import mimetypes

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from apps.cms.models import Document, News, PublishStatus, SiteBanner, unique_slug_for_model
from apps.investment.models import Sector, SuccessStory
from apps.media_library.models import MediaAsset

from .permissions import assert_status_change_allowed
from .upload_validation import validate_upload_file

User = get_user_model()


class CMSUserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_superuser",
            "is_staff",
            "groups",
            "permissions",
        )

    def get_groups(self, obj) -> list[str]:
        return list(obj.groups.values_list("name", flat=True))

    def get_permissions(self, obj) -> list[str]:
        return sorted(obj.get_all_permissions())


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class MediaAssetNestedSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_bytes = serializers.SerializerMethodField()
    mime_type = serializers.SerializerMethodField()

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
            "file_size_bytes",
            "mime_type",
            "created_at",
        )
        read_only_fields = ("id", "file_url", "file_size_bytes", "mime_type", "created_at")

    def get_file_url(self, obj: MediaAsset) -> str | None:
        if obj.file:
            request = self.context.get("request")
            url = obj.file.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url
        return None

    def get_file_size_bytes(self, obj: MediaAsset) -> int | None:
        if obj.file and hasattr(obj.file, "size"):
            return obj.file.size
        return None

    def get_mime_type(self, obj: MediaAsset) -> str | None:
        if not obj.file:
            return None
        guessed, _ = mimetypes.guess_type(obj.file.name)
        return guessed


class MediaAssetAdminSerializer(MediaAssetNestedSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    width = serializers.SerializerMethodField()
    height = serializers.SerializerMethodField()

    class Meta(MediaAssetNestedSerializer.Meta):
        fields = MediaAssetNestedSerializer.Meta.fields + (
            "uploaded_by",
            "uploaded_by_name",
            "width",
            "height",
        )
        read_only_fields = MediaAssetNestedSerializer.Meta.read_only_fields + (
            "uploaded_by",
            "uploaded_by_name",
            "width",
            "height",
        )

    def get_uploaded_by_name(self, obj: MediaAsset) -> str | None:
        if obj.uploaded_by_id:
            user = obj.uploaded_by
            full = f"{user.first_name} {user.last_name}".strip()
            return full or user.username
        return None

    def get_width(self, obj: MediaAsset) -> int | None:
        return None

    def get_height(self, obj: MediaAsset) -> int | None:
        return None


class EditorialAuditMixin(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()

    translated_title_fields = ("title",)

    def _sync_translated_titles(self, attrs):
        for base in self.translated_title_fields:
            if attrs.get(base):
                continue
            es_val = attrs.get(f"{base}_es")
            if es_val:
                attrs[base] = es_val

    def get_created_by_name(self, obj) -> str | None:
        if obj.created_by_id:
            user = obj.created_by
            full = f"{user.first_name} {user.last_name}".strip()
            return full or user.username
        return None

    def get_updated_by_name(self, obj) -> str | None:
        if obj.updated_by_id:
            user = obj.updated_by
            full = f"{user.first_name} {user.last_name}".strip()
            return full or user.username
        return None

    def _validate_status(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        new_status = attrs.get("status")
        if new_status is None and self.instance is not None:
            return
        if new_status is None:
            return
        current = getattr(self.instance, "status", None)
        assert_status_change_allowed(user, new_status, current)

    def validate(self, attrs):
        self._sync_translated_titles(attrs)
        self._validate_status(attrs)
        return super().validate(attrs)


class NewsAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    featured_image_detail = MediaAssetNestedSerializer(
        source="featured_image", read_only=True
    )

    class Meta:
        model = News
        fields = (
            "id",
            "title",
            "title_es",
            "title_en",
            "slug",
            "summary",
            "summary_es",
            "summary_en",
            "content",
            "content_es",
            "content_en",
            "featured_image",
            "featured_image_detail",
            "category",
            "author_name",
            "source",
            "external_url",
            "is_featured",
            "seo_title",
            "seo_title_es",
            "seo_title_en",
            "seo_description",
            "seo_description_es",
            "seo_description_en",
            "status",
            "published_at",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "featured_image_detail",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not attrs.get("slug") and not (self.instance and self.instance.slug):
            title = (
                attrs.get("title_es")
                or attrs.get("title")
                or (getattr(self.instance, "title_es", "") if self.instance else "")
                or (getattr(self.instance, "title", "") if self.instance else "")
            )
            if str(title).strip():
                attrs["slug"] = unique_slug_for_model(
                    News,
                    slugify(str(title)),
                    getattr(self.instance, "pk", None),
                )
        instance = self.instance
        status = attrs.get("status", getattr(instance, "status", PublishStatus.DRAFT))
        if status == PublishStatus.PUBLISHED:
            title = attrs.get("title_es", getattr(instance, "title_es", "")) or attrs.get(
                "title", getattr(instance, "title", "")
            )
            if not str(title).strip():
                raise serializers.ValidationError(
                    {"title_es": "El título en español es obligatorio para publicar."}
                )
        return attrs


class DocumentAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    cover_image_es_detail = MediaAssetNestedSerializer(source="cover_image_es", read_only=True)
    cover_image_en_detail = MediaAssetNestedSerializer(source="cover_image_en", read_only=True)
    file_es_url = serializers.SerializerMethodField()
    file_en_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "title_es",
            "title_en",
            "slug",
            "file_es",
            "file_es_url",
            "file_en",
            "file_en_url",
            "external_url_es",
            "external_url_en",
            "description",
            "description_es",
            "description_en",
            "category",
            "is_featured",
            "order",
            "document_date",
            "cover_image_es",
            "cover_image_es_detail",
            "cover_image_en",
            "cover_image_en_detail",
            "file_type",
            "file_size_bytes",
            "seo_title",
            "seo_title_es",
            "seo_title_en",
            "seo_description",
            "seo_description_es",
            "seo_description_en",
            "status",
            "published_at",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
        )
        read_only_fields = (
            "id",
            "file_type",
            "file_size_bytes",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "cover_image_es_detail",
            "cover_image_en_detail",
            "file_es_url",
            "file_en_url",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
        }

    def _absolute_file_url(self, file_field) -> str | None:
        if not file_field:
            return None
        request = self.context.get("request")
        url = file_field.url
        if request and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url

    def get_file_es_url(self, obj: Document) -> str | None:
        return self._absolute_file_url(obj.file_es)

    def get_file_en_url(self, obj: Document) -> str | None:
        return self._absolute_file_url(obj.file_en)

    def _document_candidate(self, attrs: dict) -> Document:
        if self.instance is not None:
            candidate = Document()
            for field in Document._meta.concrete_fields:
                if field.primary_key:
                    candidate.pk = self.instance.pk
                    continue
                setattr(candidate, field.attname, getattr(self.instance, field.attname))
            candidate._state.adding = False
        else:
            candidate = Document()
            candidate._state.adding = True

        for key, value in attrs.items():
            setattr(candidate, key, value)
        return candidate

    def validate(self, attrs):
        attrs = super().validate(attrs)

        for key in ("file_es", "file_en"):
            uploaded = attrs.get(key)
            if uploaded is not None:
                try:
                    validate_upload_file(uploaded)
                except DjangoValidationError as exc:
                    raise serializers.ValidationError({key: exc.messages}) from exc

        candidate = self._document_candidate(attrs)
        try:
            candidate.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        return attrs


class SiteBannerAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    image_detail = MediaAssetNestedSerializer(source="image", read_only=True)
    mobile_image_detail = MediaAssetNestedSerializer(source="mobile_image", read_only=True)

    class Meta:
        model = SiteBanner
        fields = (
            "id",
            "placement",
            "title",
            "title_es",
            "title_en",
            "body",
            "body_es",
            "body_en",
            "cta_label",
            "cta_label_es",
            "cta_label_en",
            "starts_at",
            "ends_at",
            "priority",
            "link_url",
            "link_external",
            "dismissible",
            "background_color",
            "text_color",
            "image",
            "image_detail",
            "mobile_image",
            "mobile_image_detail",
            "status",
            "published_at",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "image_detail",
            "mobile_image_detail",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = self.instance
        banner = SiteBanner()
        if instance:
            for field in self.Meta.fields:
                if hasattr(instance, field) and field not in attrs:
                    setattr(banner, field, getattr(instance, field))
        for key, value in attrs.items():
            setattr(banner, key, value)
        try:
            banner.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        return attrs


class SectorNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ("id", "name", "slug")


class SuccessStoryAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    logo_detail = MediaAssetNestedSerializer(source="logo", read_only=True)
    sector_detail = SectorNestedSerializer(source="sector", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SuccessStory
        fields = (
            "id",
            "title",
            "title_es",
            "title_en",
            "slug",
            "company_name",
            "sector",
            "sector_detail",
            "summary",
            "summary_es",
            "summary_en",
            "content",
            "content_es",
            "content_en",
            "image",
            "image_url",
            "logo",
            "logo_detail",
            "country_origin",
            "investment_amount",
            "jobs_generated",
            "testimonial_quote",
            "testimonial_quote_es",
            "testimonial_quote_en",
            "testimonial_author",
            "testimonial_author_es",
            "testimonial_author_en",
            "is_featured",
            "order",
            "status",
            "published_at",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
        )
        read_only_fields = (
            "id",
            "slug",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "logo_detail",
            "sector_detail",
            "image_url",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
        }

    def get_image_url(self, obj: SuccessStory) -> str | None:
        if obj.logo_id and obj.logo.file:
            request = self.context.get("request")
            url = obj.logo.file.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url
        return None

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = self.instance
        story = SuccessStory()
        if instance:
            for field in self.Meta.fields:
                if hasattr(instance, field) and field not in attrs:
                    setattr(story, field, getattr(instance, field))
        for key, value in attrs.items():
            setattr(story, key, value)
        try:
            story.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        return attrs


class PublishActionSerializer(serializers.Serializer):
    published_at = serializers.DateTimeField(required=False, allow_null=True)


def apply_publish(obj, user, published_at=None) -> None:
    assert_status_change_allowed(user, PublishStatus.PUBLISHED, obj.status)
    obj.status = PublishStatus.PUBLISHED
    obj.published_at = published_at or timezone.now()
    obj.updated_by = user
    obj.full_clean()
    obj.save()


def apply_archive(obj, user) -> None:
    assert_status_change_allowed(user, PublishStatus.ARCHIVED, obj.status)
    obj.status = PublishStatus.ARCHIVED
    obj.updated_by = user
    obj.full_clean()
    obj.save()


def apply_draft(obj, user) -> None:
    assert_status_change_allowed(user, PublishStatus.DRAFT, obj.status)
    obj.status = PublishStatus.DRAFT
    obj.published_at = None
    obj.updated_by = user
    obj.save(update_fields=["status", "published_at", "updated_by", "updated_at"])
