"""CMS-admin serializers for S2-T3 (investment, pages, admin)."""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from apps.cms.models import InstitutionalLink, Page, PublishStatus
from apps.investment.models import (
    InvestmentOpportunity,
    OpportunityFundUse,
    OpportunityMetric,
    Sector,
)

from .admin_privileges import (
    assert_can_assign_groups,
    assert_can_change_superuser_flag,
    assert_can_modify_group,
    assert_can_modify_superuser_target,
    validate_assignable_permissions,
)
from .matrix import cms_assignable_permissions
from .serializers import EditorialAuditMixin, MediaAssetNestedSerializer, SectorNestedSerializer
from .user_guards import assert_safe_superuser_change

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
        from apps.media_library.serializers import absolute_file_url

        return absolute_file_url(obj.image, self.context)

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


class OpportunityMetricAdminSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = OpportunityMetric
        fields = (
            "id",
            "label",
            "label_es",
            "label_en",
            "value",
            "value_es",
            "value_en",
            "note",
            "note_es",
            "note_en",
            "icon",
            "order",
            "is_public",
        )
        extra_kwargs = {
            "label": {"required": False, "allow_blank": True},
            "label_es": {"required": False, "allow_blank": True},
            "label_en": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        label = (
            attrs.get("label_es")
            or attrs.get("label")
            or attrs.get("label_en")
            or ""
        ).strip()
        if not label:
            raise serializers.ValidationError({"label_es": "La etiqueta es obligatoria."})
        if not attrs.get("label"):
            attrs["label"] = label
        if attrs.get("label_es") is None and attrs.get("label"):
            attrs["label_es"] = attrs["label"]
        return attrs


class OpportunityFundUseAdminSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = OpportunityFundUse
        fields = (
            "id",
            "component",
            "component_es",
            "component_en",
            "amount",
            "description",
            "description_es",
            "description_en",
            "order",
        )
        extra_kwargs = {
            "component": {"required": False, "allow_blank": True},
            "component_es": {"required": False, "allow_blank": True},
            "component_en": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        component = (
            attrs.get("component_es")
            or attrs.get("component")
            or attrs.get("component_en")
            or ""
        ).strip()
        if not component:
            raise serializers.ValidationError({"component_es": "El componente es obligatorio."})
        if not attrs.get("component"):
            attrs["component"] = component
        if attrs.get("component_es") is None and attrs.get("component"):
            attrs["component_es"] = attrs["component"]
        amount = attrs.get("amount")
        if amount is not None and amount < Decimal("0"):
            raise serializers.ValidationError({"amount": "El monto no puede ser negativo."})
        return attrs


class InvestmentOpportunityAdminSerializer(EditorialAuditMixin, serializers.ModelSerializer):
    sector_detail = SectorNestedSerializer(source="sector", read_only=True)
    metrics = OpportunityMetricAdminSerializer(many=True, required=False)
    fund_uses = OpportunityFundUseAdminSerializer(many=True, required=False)
    is_public = serializers.SerializerMethodField()

    class Meta:
        model = InvestmentOpportunity
        fields = (
            "id",
            "code",
            "title",
            "title_es",
            "title_en",
            "slug",
            "summary",
            "summary_es",
            "summary_en",
            "description",
            "description_es",
            "description_en",
            "target_customer",
            "target_customer_es",
            "target_customer_en",
            "market_demand",
            "market_demand_es",
            "market_demand_en",
            "value_proposition",
            "value_proposition_es",
            "value_proposition_en",
            "sector",
            "sector_detail",
            "department",
            "region",
            "estimated_investment",
            "estimated_jobs",
            "lifecycle_status",
            "status",
            "published_at",
            "is_public",
            "is_featured",
            "order",
            "metrics",
            "fund_uses",
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
            "sector_detail",
            "is_public",
        )
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
            "status": {"required": False},
        }

    def get_is_public(self, obj: InvestmentOpportunity) -> bool:
        return obj.status == PublishStatus.PUBLISHED and obj.published_at is not None

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = self.instance

        # EditorialAuditMixin mirrors title_es → title. Writing the virtual
        # base field goes through TranslationFieldDescriptor and updates the
        # *active* language column — so a PATCH with only title_es can clobber
        # title_en when get_language() is "en" (e.g. earlier LocalizedViewSet
        # test left lang=en). Drop mirrored bases when locale columns are set.
        for base in (
            "title",
            "summary",
            "description",
            "target_customer",
            "market_demand",
            "value_proposition",
        ):
            if f"{base}_es" in attrs or f"{base}_en" in attrs:
                attrs.pop(base, None)

        investment = attrs.get(
            "estimated_investment", getattr(instance, "estimated_investment", None)
        )
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
            qs = InvestmentOpportunity.all_objects.filter(slug=slug)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"slug": "Ya existe una oportunidad con este slug."})

        # Run model.clean against merged state (publish gates when status=published).
        probe = InvestmentOpportunity()
        if instance:
            for field in InvestmentOpportunity._meta.fields:
                setattr(probe, field.name, getattr(instance, field.name))
        for key, value in attrs.items():
            if key in ("metrics", "fund_uses"):
                continue
            setattr(probe, key, value)
        try:
            probe.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        return attrs

    @staticmethod
    def _sync_children(opportunity: InvestmentOpportunity, metrics, fund_uses) -> None:
        if metrics is not None:
            keep_ids: list[int] = []
            for index, row in enumerate(metrics):
                row = dict(row)
                row_id = row.pop("id", None)
                # Do not mirror label_es → label (descriptor / active language).
                if "order" not in row or row["order"] is None:
                    row["order"] = index
                if row_id:
                    metric = OpportunityMetric.objects.filter(
                        pk=row_id, opportunity=opportunity
                    ).first()
                    if metric:
                        for key, value in row.items():
                            setattr(metric, key, value)
                        metric.save()
                        keep_ids.append(metric.pk)
                        continue
                metric = OpportunityMetric.objects.create(opportunity=opportunity, **row)
                keep_ids.append(metric.pk)
            OpportunityMetric.objects.filter(opportunity=opportunity).exclude(pk__in=keep_ids).delete()

        if fund_uses is not None:
            keep_ids = []
            for index, row in enumerate(fund_uses):
                row = dict(row)
                row_id = row.pop("id", None)
                # Do not mirror component_es → component (same descriptor risk).
                if "order" not in row or row["order"] is None:
                    row["order"] = index
                if row_id:
                    fund = OpportunityFundUse.objects.filter(
                        pk=row_id, opportunity=opportunity
                    ).first()
                    if fund:
                        for key, value in row.items():
                            setattr(fund, key, value)
                        fund.save()
                        keep_ids.append(fund.pk)
                        continue
                fund = OpportunityFundUse.objects.create(opportunity=opportunity, **row)
                keep_ids.append(fund.pk)
            OpportunityFundUse.objects.filter(opportunity=opportunity).exclude(pk__in=keep_ids).delete()

    @transaction.atomic
    def create(self, validated_data):
        metrics = validated_data.pop("metrics", None)
        fund_uses = validated_data.pop("fund_uses", None)
        validated_data.setdefault("status", PublishStatus.DRAFT)
        opportunity = InvestmentOpportunity.all_objects.create(**validated_data)
        self._sync_children(opportunity, metrics, fund_uses)
        return opportunity

    @transaction.atomic
    def update(self, instance, validated_data):
        metrics = validated_data.pop("metrics", None)
        fund_uses = validated_data.pop("fund_uses", None)
        # Saving a published opportunity must not force it back to draft.
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._sync_children(instance, metrics, fund_uses)
        return instance


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
        actor = self.context["request"].user
        groups = attrs.get("groups") or []
        assert_can_assign_groups(actor, groups)
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
        assert_can_modify_superuser_target(actor, target)
        assert_can_change_superuser_flag(actor, attrs, target)
        making_inactive = attrs.get("is_active") is False
        removing_super = attrs.get("is_superuser") is False and target.is_superuser
        assert_safe_superuser_change(
            actor, target, making_inactive=making_inactive, removing_super=removing_super
        )
        if target.pk == actor.pk and attrs.get("is_superuser") is False:
            raise serializers.ValidationError(
                {"is_superuser": "No puede quitarse privilegios de superusuario."}
            )
        groups = attrs.get("groups")
        if groups is not None:
            assert_can_assign_groups(actor, groups)
        if not actor.is_superuser and attrs.get("is_staff") is False and target.is_staff:
            raise serializers.ValidationError(
                {"is_staff": "No puede quitar acceso staff a usuarios del CMS."}
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
        many=True,
        queryset=Permission.objects.none(),
        source="permissions",
        write_only=True,
        required=False,
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ("id", "name", "permissions", "permission_ids", "user_count")
        read_only_fields = ("name",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._bind_permission_queryset(self.fields["permission_ids"])

    @staticmethod
    def _bind_permission_queryset(field: serializers.Field) -> None:
        """ManyRelatedField validates against child_relation.queryset, not queryset."""
        qs = cms_assignable_permissions()
        field.queryset = qs
        field.child_relation.queryset = qs

    def get_user_count(self, obj) -> int:
        return obj.user_set.count()

    def validate_permission_ids(self, permissions):
        validate_assignable_permissions(permissions)
        return permissions

    def validate(self, attrs):
        actor = self.context["request"].user
        group = self.instance
        new_name = attrs.get("name")
        assert_can_modify_group(actor, group, renaming_to=new_name)
        return attrs

    def update(self, instance, validated_data):
        perms = validated_data.pop("permissions", None)
        validated_data.pop("name", None)
        instance.save()
        if perms is not None:
            instance.permissions.set(perms)
        return instance
