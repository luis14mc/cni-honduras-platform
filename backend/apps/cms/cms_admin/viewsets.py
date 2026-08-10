"""Authenticated CMS-admin ViewSets for editorial content management."""

from __future__ import annotations

from django.db.models import Q
from django.utils.dateparse import parse_date
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.cms.models import Document, News, PublishStatus, SiteBanner
from apps.investment.models import SuccessStory
from apps.media_library.models import MediaAsset

from .permissions import (
    CMSModelPermission,
    IsCMSStaff,
    assert_status_change_allowed,
    can_change_model,
    can_delete_model,
    can_publish,
)
from .serializers import (
    DocumentAdminSerializer,
    MediaAssetAdminSerializer,
    NewsAdminSerializer,
    PublishActionSerializer,
    SiteBannerAdminSerializer,
    SuccessStoryAdminSerializer,
    apply_archive,
    apply_draft,
    apply_publish,
)
from .upload_validation import infer_media_type, validate_upload_file


class CMSPaginationMixin:
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_list(self, request, queryset):
        from rest_framework.pagination import PageNumberPagination

        paginator = PageNumberPagination()
        paginator.page_size = self.page_size
        paginator.page_size_query_param = self.page_size_query_param
        paginator.max_page_size = self.max_page_size
        page = paginator.paginate_queryset(queryset, request, view=self)
        return page, paginator


class EditorialFilterMixin:
    search_fields: tuple[str, ...] = ()
    status_field = "status"

    def filter_queryset(self, queryset):
        params = self.request.query_params
        search = (params.get("search") or "").strip()
        if search and self.search_fields:
            q = Q()
            for field in self.search_fields:
                q |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(q)

        status_val = params.get("status")
        if status_val:
            queryset = queryset.filter(**{self.status_field: status_val})

        date_from = parse_date(params.get("date_from") or "")
        if date_from:
            queryset = queryset.filter(published_at__date__gte=date_from)
        date_to = parse_date(params.get("date_to") or "")
        if date_to:
            queryset = queryset.filter(published_at__date__lte=date_to)

        media_type = params.get("media_type")
        if media_type:
            queryset = queryset.filter(media_type=media_type)

        category = params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        placement = params.get("placement")
        if placement:
            queryset = queryset.filter(placement=placement)

        return queryset.order_by(*queryset.model._meta.ordering)


class EditorialViewSetMixin(EditorialFilterMixin, CMSPaginationMixin):
    permission_classes = [IsCMSStaff, CMSModelPermission]

    def get_queryset(self):
        return self.queryset.all()

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        status_val = serializer.validated_data.get("status", PublishStatus.DRAFT)
        assert_status_change_allowed(user, status_val)
        extra = {"created_by": user, "updated_by": user}
        if status_val == PublishStatus.PUBLISHED:
            from django.utils import timezone

            extra.setdefault("published_at", timezone.now())
        serializer.save(**extra)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        new_status = serializer.validated_data.get("status", instance.status)
        assert_status_change_allowed(user, new_status, instance.status)
        extra: dict = {"updated_by": user}
        if (
            new_status == PublishStatus.PUBLISHED
            and not serializer.validated_data.get("published_at")
            and not instance.published_at
        ):
            from django.utils import timezone

            extra["published_at"] = timezone.now()
        serializer.save(**extra)

    def perform_destroy(self, instance):
        if not can_delete_model(
            self.request.user, self.app_label, self.model_name
        ):
            raise PermissionDenied("No tiene permiso para eliminar este contenido.")
        instance.delete()

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        obj = self.get_object()
        if not can_change_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para modificar este contenido.")
        ser = PublishActionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        apply_publish(obj, request.user, ser.validated_data.get("published_at"))
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        obj = self.get_object()
        if not can_change_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para modificar este contenido.")
        apply_archive(obj, request.user)
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        obj = self.get_object()
        if not can_change_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para modificar este contenido.")
        apply_draft(obj, request.user)
        return Response(self.get_serializer(obj).data)


@method_decorator(csrf_protect, name="dispatch")
class MediaAssetViewSet(
    EditorialFilterMixin,
    CMSPaginationMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = MediaAsset.objects.select_related("uploaded_by").all()
    serializer_class = MediaAssetAdminSerializer
    permission_classes = [IsCMSStaff, CMSModelPermission]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    app_label = "media_library"
    model_name = "mediaasset"
    search_fields = ("title", "alt_text", "caption")

    def get_queryset(self):
        return self.filter_queryset(super().get_queryset())

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def create(self, request, *args, **kwargs):
        from .permissions import can_add_model

        if not can_add_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para subir archivos.")

        uploaded = request.FILES.get("file")
        if not uploaded:
            raise ValidationError({"file": "Se requiere un archivo."})
        try:
            validate_upload_file(uploaded)
        except Exception as exc:
            raise ValidationError({"file": str(exc)}) from exc

        title = (request.data.get("title") or "").strip() or uploaded.name
        media_type = infer_media_type(uploaded.name)
        asset = MediaAsset.objects.create(
            title=title,
            file=uploaded,
            alt_text=(request.data.get("alt_text") or "").strip(),
            caption=(request.data.get("caption") or "").strip(),
            media_type=media_type,
            uploaded_by=request.user,
        )
        return Response(
            self.get_serializer(asset).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        if not can_delete_model(request.user, self.app_label, self.model_name):
            raise PermissionDenied("No tiene permiso para eliminar archivos.")
        return super().destroy(request, *args, **kwargs)


@method_decorator(csrf_protect, name="dispatch")
class NewsAdminViewSet(EditorialViewSetMixin, viewsets.ModelViewSet):
    queryset = News.all_objects.select_related("featured_image", "created_by", "updated_by")
    serializer_class = NewsAdminSerializer
    app_label = "cms"
    model_name = "news"
    search_fields = ("title", "title_es", "title_en", "slug", "summary_es", "summary_en")


@method_decorator(csrf_protect, name="dispatch")
class DocumentAdminViewSet(EditorialViewSetMixin, viewsets.ModelViewSet):
    queryset = Document.all_objects.select_related(
        "cover_image_es", "cover_image_en", "created_by", "updated_by"
    )
    serializer_class = DocumentAdminSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    app_label = "cms"
    model_name = "document"
    search_fields = ("title", "title_es", "title_en", "slug")

    def perform_update(self, serializer):
        # Allow direct file upload on document update via multipart
        super().perform_update(serializer)

    def perform_create(self, serializer):
        super().perform_create(serializer)


@method_decorator(csrf_protect, name="dispatch")
class SiteBannerAdminViewSet(EditorialViewSetMixin, viewsets.ModelViewSet):
    queryset = SiteBanner.all_objects.select_related(
        "image", "mobile_image", "created_by", "updated_by"
    )
    serializer_class = SiteBannerAdminSerializer
    app_label = "cms"
    model_name = "sitebanner"
    search_fields = ("title", "title_es", "title_en", "body_es", "body_en")

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        if not can_publish(request.user):
            raise PermissionDenied("No tiene permiso para reordenar banners.")
        items = request.data.get("items")
        if not isinstance(items, list):
            raise ValidationError({"items": "Se esperaba una lista de {id, priority}."})
        for entry in items:
            if not isinstance(entry, dict) or "id" not in entry or "priority" not in entry:
                continue
            SiteBanner.all_objects.filter(pk=entry["id"]).update(priority=entry["priority"])
        qs = self.get_queryset()
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


@method_decorator(csrf_protect, name="dispatch")
class SuccessStoryAdminViewSet(EditorialViewSetMixin, viewsets.ModelViewSet):
    queryset = SuccessStory.all_objects.select_related(
        "sector", "logo", "created_by", "updated_by"
    )
    serializer_class = SuccessStoryAdminSerializer
    app_label = "investment"
    model_name = "successstory"
    search_fields = (
        "title",
        "title_es",
        "title_en",
        "company_name",
        "slug",
    )
