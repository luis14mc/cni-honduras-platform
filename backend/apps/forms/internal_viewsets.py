"""Authenticated CMS viewsets for internal project application management."""

from __future__ import annotations

from django.db.models import Q
from django.utils.dateparse import parse_date
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.cms.cms_admin.permissions import CMSModelPermission, IsCMSStaff, can_change_model
from apps.cms.cms_admin.viewsets import CMSPaginationMixin

from .internal_serializers import (
    ProjectApplicationDetailSerializer,
    ProjectApplicationHistorySerializer,
    ProjectApplicationListSerializer,
    ProjectApplicationNoteCreateSerializer,
    ProjectApplicationNoteSerializer,
    ProjectApplicationPatchSerializer,
    StaffUserBriefSerializer,
    filter_assignable_staff_users,
)
from .models import ProjectApplication
from .services import apply_management_update, create_internal_note


class ProjectApplicationFilterMixin:
    search_fields = (
        "reference_code",
        "company",
        "full_name",
        "email",
        "project_name",
    )

    def filter_queryset(self, queryset):
        params = self.request.query_params
        search = (params.get("search") or "").strip()
        if search:
            q = Q()
            for field in self.search_fields:
                q |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(q)

        status_val = params.get("status")
        if status_val:
            queryset = queryset.filter(status=status_val)

        sector = (params.get("sector") or "").strip()
        if sector:
            queryset = queryset.filter(sector_ref__slug=sector)

        department = (params.get("department") or "").strip()
        if department:
            queryset = queryset.filter(department_ref__slug=department)

        investment_range = (params.get("investment_range") or "").strip()
        if investment_range:
            queryset = queryset.filter(investment_range=investment_range)

        assigned_to = params.get("assigned_to")
        if assigned_to == "unassigned":
            queryset = queryset.filter(assigned_to__isnull=True)
        elif assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        date_from = parse_date(params.get("date_from") or "")
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        date_to = parse_date(params.get("date_to") or "")
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset.order_by("-created_at", "-id")


@method_decorator(csrf_protect, name="dispatch")
class ProjectApplicationInternalViewSet(
    ProjectApplicationFilterMixin,
    CMSPaginationMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Internal bandeja for project applications — CMS session auth required."""

    queryset = ProjectApplication.objects.select_related(
        "sector_ref",
        "department_ref",
        "municipality",
        "assigned_to",
    )
    permission_classes = [IsCMSStaff, CMSModelPermission]
    app_label = "forms_app"
    model_name = "projectapplication"
    lookup_field = "reference_code"
    lookup_url_kwarg = "reference_code"
    http_method_names = ["get", "patch", "head", "options", "post"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectApplicationDetailSerializer
        if self.action == "partial_update":
            return ProjectApplicationPatchSerializer
        if self.action == "notes":
            return ProjectApplicationNoteCreateSerializer
        return ProjectApplicationListSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store, private"
        return response

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page, paginator = self.paginate_list(request, qs)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        update_kwargs = {"actor": request.user}
        if "status" in data:
            update_kwargs["status"] = data["status"]
        if "assigned_to" in data:
            update_kwargs["assigned_to"] = data["assigned_to"]
        apply_management_update(application, **update_kwargs)
        application.refresh_from_db()
        return Response(ProjectApplicationDetailSerializer(application).data)

    @action(detail=True, methods=["get", "post"], url_path="notes")
    def notes(self, request, reference_code=None):
        application = self.get_object()
        if request.method == "GET":
            notes = application.notes.select_related("author").order_by("-created_at", "-id")
            return Response(ProjectApplicationNoteSerializer(notes, many=True).data)

        if not can_change_model(request.user, self.app_label, self.model_name):
            return Response({"detail": "No tiene permiso para agregar notas."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProjectApplicationNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = create_internal_note(application, actor=request.user, body=serializer.validated_data["body"])
        return Response(
            ProjectApplicationNoteSerializer(note).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, reference_code=None):
        application = self.get_object()
        entries = application.history_entries.select_related(
            "actor",
            "from_assignee",
            "to_assignee",
        ).order_by("-created_at", "-id")
        return Response(ProjectApplicationHistorySerializer(entries, many=True).data)

    @action(detail=False, methods=["get"], url_path="assignable-users")
    def assignable_users(self, request):
        users = filter_assignable_staff_users(request.user)
        return Response(StaffUserBriefSerializer(users, many=True).data)
