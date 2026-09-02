import logging
from decimal import Decimal

from rest_framework import mixins, status, viewsets
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.forms.throttles import FormsRateThrottle, ProjectSubmissionRateThrottle
from apps.integrations.models import WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED, WEBHOOK_SOURCE_WEBSITE, WebhookEvent

from .models import AdvisoryRequest, ContactSubmission, ProjectApplication, ResourceDownloadLead
from .serializers import (
    AdvisoryRequestSerializer,
    ContactSubmissionSerializer,
    ProjectApplicationSerializer,
    ResourceDownloadLeadSerializer,
)

logger = logging.getLogger(__name__)


class PublicCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = (AllowAny,)
    throttle_classes = (FormsRateThrottle,)


def build_project_application_webhook_payload(submission: ProjectApplication) -> dict:
    estimated_investment = submission.estimated_investment
    if isinstance(estimated_investment, Decimal):
        estimated_investment = str(estimated_investment)

    return {
        "submission_id": submission.pk,
        "reference_code": submission.reference_code,
        "full_name": submission.full_name,
        "email": submission.email,
        "phone": submission.phone,
        "company": submission.company,
        "country": submission.country,
        "project_name": submission.project_name,
        "sector": submission.sector,
        "sector_slug": submission.sector_ref.slug if submission.sector_ref else "",
        "department": submission.department,
        "department_slug": submission.department_ref.slug if submission.department_ref else "",
        "municipality_slug": submission.municipality.slug if submission.municipality else "",
        "project_location": submission.project_location,
        "investment_range": submission.investment_range,
        "estimated_investment": estimated_investment,
        "expected_jobs": submission.expected_jobs,
        "details": submission.details,
        "message": submission.message,
        "consent": submission.consent,
        "source": submission.source,
        "created_at": submission.created_at.isoformat() if submission.created_at else None,
    }


def enqueue_project_application_webhook(submission: ProjectApplication) -> None:
    try:
        WebhookEvent.objects.create(
            source=WEBHOOK_SOURCE_WEBSITE,
            event_type=WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
            payload=build_project_application_webhook_payload(submission),
        )
    except Exception:
        logger.exception(
            "Failed to create WebhookEvent for ProjectApplication pk=%s",
            submission.pk,
        )


class ContactSubmissionViewSet(PublicCreateViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer


class ProjectApplicationViewSet(PublicCreateViewSet):
    queryset = ProjectApplication.objects.all()
    serializer_class = ProjectApplicationSerializer
    parser_classes = (JSONParser,)
    throttle_classes = (ProjectSubmissionRateThrottle,)
    max_payload_size = 64 * 1024

    def create(self, request, *args, **kwargs):
        content_length = request.META.get("CONTENT_LENGTH")
        if content_length and int(content_length) > self.max_payload_size:
            return Response({"detail": "Payload demasiado grande."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        enqueue_project_application_webhook(serializer.instance)


class AdvisoryRequestViewSet(PublicCreateViewSet):
    queryset = AdvisoryRequest.objects.all()
    serializer_class = AdvisoryRequestSerializer


class ResourceDownloadLeadViewSet(PublicCreateViewSet):
    queryset = ResourceDownloadLead.objects.all()
    serializer_class = ResourceDownloadLeadSerializer
