"""Write serializers for the authenticated CMS-admin editorial API."""

from __future__ import annotations

import mimetypes
import uuid

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
        from apps.media_library.serializers import absolute_file_url

        return absolute_file_url(obj.file, self.context)

    def get_file_size_bytes(self, obj: MediaAsset) -> int | None:
        if not obj.file:
            return None
        # FieldFile.size is a property that hits storage; hasattr() already raises
        # FileNotFoundError when the blob is missing — never use hasattr here.
        try:
            return obj.file.size
        except (FileNotFoundError, OSError, ValueError):
            return None

    def get_mime_type(self, obj: MediaAsset) -> str | None:
        if not obj.file or not obj.file.name:
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
            "content_blocks_es",
            "content_blocks_en",
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

    def _normalize_blocks(self, blocks):
        if blocks is None:
            return None
        if not isinstance(blocks, list):
            raise serializers.ValidationError("content_blocks debe ser una lista.")
        normalized = []
        for idx, block in enumerate(blocks):
            if not isinstance(block, dict) or "type" not in block:
                raise serializers.ValidationError(
                    {f"item_{idx}": "Cada bloque debe ser un objeto con type."}
                )
            item = dict(block)
            # Preserve client/persisted ids; assign once for legacy blocks without id.
            existing_id = item.get("id")
            if not isinstance(existing_id, str) or not existing_id.strip():
                item["id"] = f"b-{idx}-{slugify(str(item.get('type', 'block')))}-{uuid.uuid4().hex[:12]}"
            else:
                item["id"] = existing_id.strip()
            # preview_url is transient — resolved on read from MediaAsset
            item.pop("preview_url", None)
            normalized.append(item)
        return normalized

    def _enrich_blocks(self, blocks):
        from apps.media_library.serializers import absolute_file_url

        if not blocks or not isinstance(blocks, list):
            return []
        media_ids = [
            b.get("media_id")
            for b in blocks
            if isinstance(b, dict) and b.get("type") == "image" and b.get("media_id")
        ]
        assets = {
            a.id: a for a in MediaAsset.objects.filter(id__in=media_ids)
        } if media_ids else {}
        enriched = []
        for block in blocks:
            if not isinstance(block, dict):
                continue
            item = dict(block)
            if item.get("type") == "image" and item.get("media_id") in assets:
                asset = assets[item["media_id"]]
                try:
                    item["preview_url"] = absolute_file_url(asset.file, self.context)
                except (OSError, ValueError):
                    item["preview_url"] = None
                if not item.get("alt"):
                    item["alt"] = asset.alt_text or ""
            enriched.append(item)
        return enriched

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Legacy rows may store NULL instead of [] for JSON block columns.
        data["content_blocks_es"] = self._enrich_blocks(instance.content_blocks_es)
        data["content_blocks_en"] = self._enrich_blocks(instance.content_blocks_en)
        return data

    def validate(self, attrs):
        attrs = super().validate(attrs)
        for key in ("content_blocks_es", "content_blocks_en"):
            if key in attrs:
                attrs[key] = self._normalize_blocks(attrs[key])

        title_es = (
            attrs.get("title_es")
            if "title_es" in attrs
            else (getattr(self.instance, "title_es", "") if self.instance else "")
        )
        title = attrs.get("title") if "title" in attrs else (getattr(self.instance, "title", "") if self.instance else "")
        effective_title = (title_es or title or "").strip()

        if self.instance is None and not effective_title:
            raise serializers.ValidationError(
                {"title_es": "El título en español es obligatorio."}
            )

        if not attrs.get("slug") and not (self.instance and self.instance.slug):
            if effective_title:
                attrs["slug"] = unique_slug_for_model(
                    News,
                    slugify(effective_title),
                    getattr(self.instance, "pk", None),
                )

        instance = self.instance
        status = attrs.get("status", getattr(instance, "status", PublishStatus.DRAFT))
        if status == PublishStatus.PUBLISHED and not effective_title:
            raise serializers.ValidationError(
                {"title_es": "El título en español es obligatorio para publicar."}
            )
        return attrs


class DocumentAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    cover_image_detail = MediaAssetNestedSerializer(source="cover_image", read_only=True)
    file_url = serializers.SerializerMethodField()
    sibling_languages = serializers.SerializerMethodField()
    sibling_id = serializers.SerializerMethodField()
    clear_file = serializers.BooleanField(required=False, write_only=True, default=False)

    class Meta:
        model = Document
        fields = (
            "id",
            "language",
            "resource_key",
            "title",
            "title_es",
            "title_en",
            "slug",
            "file",
            "file_url",
            "clear_file",
            "external_url",
            "description",
            "description_es",
            "description_en",
            "category",
            "is_featured",
            "order",
            "document_date",
            "cover_image",
            "cover_image_detail",
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
            "sibling_languages",
            "sibling_id",
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
            "cover_image_detail",
            "file_url",
            "sibling_languages",
            "sibling_id",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
            "resource_key": {"required": False, "allow_blank": True},
            "file": {"required": False, "allow_null": True},
        }

    def _absolute_file_url(self, file_field) -> str | None:
        from apps.media_library.serializers import absolute_file_url

        return absolute_file_url(file_field, self.context)

    def get_file_url(self, obj: Document) -> str | None:
        return self._absolute_file_url(obj.file)

    def _sibling_entry(self, obj: Document) -> dict[str, int]:
        cache = self.context.get("sibling_map")
        if cache is not None:
            return cache.get(obj.resource_key or "", {})
        if not obj.resource_key:
            return {}
        return {
            row["language"]: row["id"]
            for row in Document.all_objects.filter(resource_key=obj.resource_key).values(
                "id", "language"
            )
        }

    def get_sibling_languages(self, obj: Document) -> list[str]:
        return sorted(self._sibling_entry(obj).keys())

    def get_sibling_id(self, obj: Document) -> int | None:
        siblings = self._sibling_entry(obj)
        other = "en" if obj.language == "es" else "es"
        return siblings.get(other)

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
        clear_file = attrs.pop("clear_file", False)

        uploaded = attrs.get("file")
        if uploaded is not None:
            try:
                validate_upload_file(uploaded)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"file": exc.messages}) from exc

        # Switching to external URL clears the stored file when requested or implied.
        external = attrs.get("external_url")
        if external is not None and str(external).strip():
            if uploaded:
                raise serializers.ValidationError(
                    {
                        "file": "Seleccione un archivo subido o una URL externa, no ambos.",
                        "external_url": "Seleccione un archivo subido o una URL externa, no ambos.",
                    }
                )
            if clear_file or (self.instance and self.instance.has_uploaded_file() and "file" not in attrs):
                attrs["file"] = None
        elif clear_file:
            attrs["file"] = None

        # Sync title into language-specific modeltranslation column when present.
        language = attrs.get("language") or getattr(self.instance, "language", "es")
        title = attrs.get("title")
        if title is not None:
            if language == "en":
                attrs.setdefault("title_en", title)
            else:
                attrs.setdefault("title_es", title)
        description = attrs.get("description")
        if description is not None:
            if language == "en":
                attrs.setdefault("description_en", description)
            else:
                attrs.setdefault("description_es", description)

        if not attrs.get("resource_key") and not (self.instance and self.instance.resource_key):
            slug = attrs.get("slug") or (self.instance.slug if self.instance else "")
            title_for_key = attrs.get("title") or (self.instance.title if self.instance else "")
            key_source = slug or slugify(str(title_for_key))
            if key_source:
                attrs["resource_key"] = key_source

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
    featured_image_detail = MediaAssetNestedSerializer(source="featured_image", read_only=True)
    person_photo_detail = MediaAssetNestedSerializer(source="person_photo", read_only=True)
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
            "featured_image",
            "featured_image_detail",
            "person_photo",
            "person_photo_detail",
            "person_name",
            "person_role",
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
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "logo_detail",
            "featured_image_detail",
            "person_photo_detail",
            "sector_detail",
            "image_url",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
        }

    def get_image_url(self, obj: SuccessStory) -> str | None:
        """List thumbnail: featured_image, then logo, then legacy image file."""
        request = self.context.get("request")

        def abs_url(file_field) -> str | None:
            if not file_field:
                return None
            url = file_field.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url

        if obj.featured_image_id and obj.featured_image and obj.featured_image.file:
            return abs_url(obj.featured_image.file)
        if obj.logo_id and obj.logo and obj.logo.file:
            return abs_url(obj.logo.file)
        if obj.image:
            return abs_url(obj.image)
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
    try:
        obj.full_clean()
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.message_dict) from exc
    obj.save()


def apply_archive(obj, user) -> None:
    assert_status_change_allowed(user, PublishStatus.ARCHIVED, obj.status)
    obj.status = PublishStatus.ARCHIVED
    obj.updated_by = user
    try:
        obj.full_clean()
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.message_dict) from exc
    obj.save()


def apply_draft(obj, user) -> None:
    assert_status_change_allowed(user, PublishStatus.DRAFT, obj.status)
    obj.status = PublishStatus.DRAFT
    obj.published_at = None
    obj.updated_by = user
    obj.save(update_fields=["status", "published_at", "updated_by", "updated_at"])
