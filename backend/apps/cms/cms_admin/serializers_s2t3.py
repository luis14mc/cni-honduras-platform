"""CMS-admin serializers for S2-T3 (investment, pages, admin)."""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.cms.models import InstitutionalLink, Page
from apps.investment.models import InvestmentOpportunity, Sector

from .serializers import EditorialAuditMixin, MediaAssetNestedSerializer, SectorNestedSerializer

User = get_user_model()


class SectorAdminSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Sector
        fields = (
            "id",
            "name",
            "name_es",
            "name_en",
            "slug",
            "short_description",
            "short_description_es",
            "short_description_en",
            "description",
            "description_es",
            "description_en",
            "icon",
            "image",
            "image_url",
            "color_hex",
            "is_featured",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "image_url")
        extra_kwargs = {
            "name": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
        }

    def get_image_url(self, obj: Sector) -> str | None:
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url
        return None

    def validate(self, attrs):
        name = attrs.get("name") or attrs.get("name_es") or attrs.get("name_en")
        if not name and self.instance is None:
            raise serializers.ValidationError({"name_es": "El nombre es obligatorio."})
        if not attrs.get("name") and attrs.get("name_es"):
            attrs["name"] = attrs["name_es"]
        slug = attrs.get("slug")
        if slug:
            qs = Sector.objects.filter(slug=slug)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"slug": "Ya existe un sector con este slug."})
        return attrs


class InvestmentOpportunityAdminSerializer(serializers.ModelSerializer):
    sector_detail = SectorNestedSerializer(source="sector", read_only=True)

    class Meta:
        model = InvestmentOpportunity
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "sector",
            "sector_detail",
            "department",
            "region",
            "estimated_investment",
            "estimated_jobs",
            "status",
            "is_public",
            "is_featured",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "sector_detail")
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        instance = self.instance
        investment = attrs.get("estimated_investment", getattr(instance, "estimated_investment", None))
        if investment is not None and investment < Decimal("0"):
            raise serializers.ValidationError(
                {"estimated_investment": "La inversión estimada no puede ser negativa."}
            )
        jobs = attrs.get("estimated_jobs", getattr(instance, "estimated_jobs", None))
        if jobs is not None and jobs < 0:
            raise serializers.ValidationError(
                {"estimated_jobs": "Los empleos estimados no pueden ser negativos."}
            )
        slug = attrs.get("slug")
        if slug:
            qs = InvestmentOpportunity.objects.filter(slug=slug)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"slug": "Ya existe una oportunidad con este slug."})
        is_public = attrs.get("is_public", getattr(instance, "is_public", True))
        title = attrs.get("title", getattr(instance, "title", ""))
        sector = attrs.get("sector", getattr(instance, "sector", None))
        if is_public:
            if not str(title).strip():
                raise serializers.ValidationError(
                    {"title": "El título es obligatorio para oportunidades públicas."}
                )
            if sector is None:
                raise serializers.ValidationError(
                    {"sector": "El sector es obligatorio para oportunidades públicas."}
                )
        return attrs


class PageAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    featured_image_detail = MediaAssetNestedSerializer(source="featured_image", read_only=True)
    is_protected = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = (
            "id",
            "title",
            "title_es",
            "title_en",
            "slug",
            "content",
            "content_es",
            "content_en",
            "excerpt",
            "excerpt_es",
            "excerpt_en",
            "featured_image",
            "featured_image_detail",
            "seo_title",
            "seo_title_es",
            "seo_title_en",
            "seo_description",
            "seo_description_es",
            "seo_description_en",
            "status",
            "published_at",
            "is_protected",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
        )
        read_only_fields = (
            "id",
            "is_protected",
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

    def get_is_protected(self, obj: Page) -> bool:
        from .page_protection import is_protected_page_slug

        return is_protected_page_slug(obj.slug)


class InstitutionalLinkAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalLink
        fields = (
            "id",
            "section",
            "title",
            "title_es",
            "title_en",
            "description",
            "description_es",
            "description_en",
            "url",
            "is_external",
            "icon",
            "accent_color",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        if not attrs.get("title") and attrs.get("title_es"):
            attrs["title"] = attrs["title_es"]
        if not attrs.get("title") and self.instance is None:
            raise serializers.ValidationError({"title_es": "El título es obligatorio."})
        return attrs


class CMSStaffUserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), source="groups", write_only=True, required=False
    )
    last_login_display = serializers.DateTimeField(source="last_login", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "group_ids",
            "last_login",
            "last_login_display",
            "date_joined",
        )
        read_only_fields = ("id", "last_login", "last_login_display", "date_joined", "groups")

    def get_groups(self, obj) -> list[str]:
        return list(obj.groups.values_list("name", flat=True))


class CMSStaffUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), source="groups", required=False
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "is_active",
            "is_staff",
            "group_ids",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        groups = validated_data.pop("groups", [])
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.is_staff = True
        user.set_password(password)
        user.save()
        if groups:
            user.groups.set(groups)
        return user


class CMSStaffUserUpdateSerializer(serializers.ModelSerializer):
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), source="groups", required=False
    )

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "group_ids",
        )

    def validate(self, attrs):
        actor = self.context["request"].user
        target = self.instance
        from .user_guards import assert_safe_superuser_change

        making_inactive = attrs.get("is_active") is False
        removing_super = attrs.get("is_superuser") is False and target.is_superuser
        assert_safe_superuser_change(
            actor, target, making_inactive=making_inactive, removing_super=removing_super
        )
        if target.pk == actor.pk and attrs.get("is_superuser") is False:
            raise serializers.ValidationError(
                {"is_superuser": "No puede quitarse privilegios de superusuario."}
            )
        return attrs

    def update(self, instance, validated_data):
        groups = validated_data.pop("groups", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        return instance


class SetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        validate_password(attrs["password"])
        return attrs


class GroupPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "name", "content_type")


class GroupAdminSerializer(serializers.ModelSerializer):
    permissions = GroupPermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), source="permissions", write_only=True, required=False
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ("id", "name", "permissions", "permission_ids", "user_count")

    def get_user_count(self, obj) -> int:
        return obj.user_set.count()

    def update(self, instance, validated_data):
        perms = validated_data.pop("permissions", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save()
        if perms is not None:
            instance.permissions.set(perms)
        return instance
