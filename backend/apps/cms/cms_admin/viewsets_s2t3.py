"""CMS-admin ViewSets for S2-T3 (investment, pages, administration)."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.cms.models import InstitutionalLink, Page
from apps.investment.models import InvestmentOpportunity, Sector

from .admin_privileges import assert_can_modify_group, assert_can_modify_superuser_target
from .matrix import build_permission_catalog
from .page_protection import is_protected_page_slug
from .permissions import (
    CMSModelPermission,
    IsCMSGroupAdmin,
    IsCMSStaff,
    IsCMSUserAdmin,
    can_change_model,
    can_manage_groups,
)
from .serializers_s2t3 import (
    CMSStaffUserCreateSerializer,
    CMSStaffUserSerializer,
    CMSStaffUserUpdateSerializer,
    GroupAdminSerializer,
    InstitutionalLinkAdminSerializer,
    InvestmentOpportunityAdminSerializer,
    PageAdminSerializer,
    SectorAdminSerializer,
    SetPasswordSerializer,
)
from .user_guards import assert_can_modify_user, assert_safe_superuser_change, assert_safe_superuser_delete
from .viewsets import CMSPaginationMixin, EditorialFilterMixin, EditorialViewSetMixin

User = get_user_model()


class SectorFilterMixin:
    search_fields = ("name", "name_es", "name_en", "slug")

    def filter_queryset(self, queryset):
        params = self.request.query_params
        search = (params.get("search") or "").strip()
        if search:
            q = Q()
            for field in self.search_fields:
                q |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(q)
        is_active = params.get("is_active")
        if is_active in ("true", "false"):
            queryset = queryset.filter(is_active=is_active == "true")
        is_featured = params.get("is_featured")
        if is_featured in ("true", "false"):
            queryset = queryset.filter(is_featured=is_featured == "true")
        return queryset.order_by("order", "name")


@method_decorator(csrf_protect, name="dispatch")
class SectorAdminViewSet(SectorFilterMixin, CMSPaginationMixin, viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorAdminSerializer
    permission_classes = [IsCMSStaff, CMSModelPermission]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    app_label = "investment"
    model_name = "sector"

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        obj = self.get_object()
        if not can_change_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para modificar sectores.")
        obj.is_active = True
        obj.save(update_fields=["is_active", "updated_at"])
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        obj = self.get_object()
        if not can_change_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para modificar sectores.")
        obj.is_active = False
        obj.save(update_fields=["is_active", "updated_at"])
        return Response(self.get_serializer(obj).data)


class OpportunityFilterMixin(EditorialFilterMixin):
    search_fields = (
        "code",
        "title",
        "title_es",
        "title_en",
        "slug",
        "summary",
        "summary_es",
        "description",
        "description_es",
    )

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        params = self.request.query_params
        sector = params.get("sector")
        if sector:
            queryset = queryset.filter(sector_id=sector)
        is_featured = params.get("is_featured")
        if is_featured in ("true", "false"):
            queryset = queryset.filter(is_featured=is_featured == "true")
        lifecycle = params.get("lifecycle_status")
        if lifecycle:
            queryset = queryset.filter(lifecycle_status=lifecycle)
        return queryset


@method_decorator(csrf_protect, name="dispatch")
class InvestmentOpportunityAdminViewSet(
    OpportunityFilterMixin, EditorialViewSetMixin, viewsets.ModelViewSet
):
    queryset = InvestmentOpportunity.all_objects.select_related(
        "sector", "department", "region", "created_by", "updated_by"
    ).prefetch_related("metrics", "fund_uses")
    serializer_class = InvestmentOpportunityAdminSerializer
    app_label = "investment"
    model_name = "investmentopportunity"


@method_decorator(csrf_protect, name="dispatch")
class PageAdminViewSet(EditorialViewSetMixin, viewsets.ModelViewSet):
    queryset = Page.all_objects.select_related("featured_image", "created_by", "updated_by")
    serializer_class = PageAdminSerializer
    app_label = "cms"
    model_name = "page"
    search_fields = ("title", "title_es", "title_en", "slug", "excerpt_es", "excerpt_en")

    def perform_destroy(self, instance):
        if is_protected_page_slug(instance.slug):
            raise ValidationError("Esta página institucional está protegida y no puede eliminarse.")
        super().perform_destroy(instance)


@method_decorator(csrf_protect, name="dispatch")
class InstitutionalLinkAdminViewSet(EditorialFilterMixin, CMSPaginationMixin, viewsets.ModelViewSet):
    queryset = InstitutionalLink.objects.all()
    serializer_class = InstitutionalLinkAdminSerializer
    permission_classes = [IsCMSStaff, CMSModelPermission]
    app_label = "cms"
    model_name = "institutionallink"
    search_fields = ("title", "title_es", "title_en", "url")

    def filter_queryset(self, queryset):
        params = self.request.query_params
        search = (params.get("search") or "").strip()
        if search:
            q = Q()
            for field in self.search_fields:
                q |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(q)
        section = params.get("section")
        if section:
            queryset = queryset.filter(section=section)
        is_active = params.get("is_active")
        if is_active in ("true", "false"):
            queryset = queryset.filter(is_active=is_active == "true")
        return queryset.order_by("section", "order", "id")

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


@method_decorator(csrf_protect, name="dispatch")
class CMSUserAdminViewSet(CMSPaginationMixin, viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=True).prefetch_related("groups").order_by("username")
    permission_classes = [IsCMSUserAdmin]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return CMSStaffUserCreateSerializer
        if self.action in ("update", "partial_update"):
            return CMSStaffUserUpdateSerializer
        return CMSStaffUserSerializer

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        search = (request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        target = self.get_object()
        assert_can_modify_user(self.request.user, target)
        assert_can_modify_superuser_target(self.request.user, target)
        serializer.save()

    def perform_destroy(self, instance):
        assert_can_modify_user(self.request.user, instance)
        assert_can_modify_superuser_target(self.request.user, instance)
        assert_safe_superuser_delete(instance)
        instance.delete()

    @action(detail=True, methods=["post"])
    def set_password(self, request, pk=None):
        user = self.get_object()
        assert_can_modify_user(request.user, user)
        assert_can_modify_superuser_target(request.user, user)
        ser = SetPasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user.set_password(ser.validated_data["password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        assert_can_modify_user(request.user, user)
        assert_can_modify_superuser_target(request.user, user)
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(CMSStaffUserSerializer(user).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        assert_can_modify_user(request.user, user)
        assert_can_modify_superuser_target(request.user, user)
        assert_safe_superuser_change(request.user, user, making_inactive=True)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(CMSStaffUserSerializer(user).data)


@method_decorator(csrf_protect, name="dispatch")
class CMSGroupAdminViewSet(CMSPaginationMixin, viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related("permissions").order_by("name")
    serializer_class = GroupAdminSerializer
    permission_classes = [IsCMSGroupAdmin]
    http_method_names = ["get", "put", "patch", "head", "options"]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"])
    def permission_catalog(self, request):
        if not can_manage_groups(request.user):
            raise PermissionDenied("Se requieren permisos administrativos de grupos.")
        return Response({"models": build_permission_catalog()})

    def update(self, request, *args, **kwargs):
        if not can_manage_groups(request.user):
            raise PermissionDenied("Se requieren permisos administrativos de grupos.")
        group = self.get_object()
        assert_can_modify_group(request.user, group)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not can_manage_groups(request.user):
            raise PermissionDenied("Se requieren permisos administrativos de grupos.")
        group = self.get_object()
        assert_can_modify_group(request.user, group)
        return super().partial_update(request, *args, **kwargs)
