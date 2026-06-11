import logging
from decimal import Decimal

from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

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


def build_project_application_webhook_payload(submission: ProjectApplication) -> dict:
    estimated_investment = submission.estimated_investment
    if isinstance(estimated_investment, Decimal):
        estimated_investment = str(estimated_investment)

    return {
        "submission_id": submission.pk,
        "full_name": submission.full_name,
        "email": submission.email,
        "phone": submission.phone,
        "company": submission.company,
        "country": submission.country,
        "project_name": submission.project_name,
        "sector": submission.sector,
        "department": submission.department,
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

    def perform_create(self, serializer):
        super().perform_create(serializer)
        enqueue_project_application_webhook(serializer.instance)


class AdvisoryRequestViewSet(PublicCreateViewSet):
    queryset = AdvisoryRequest.objects.all()
    serializer_class = AdvisoryRequestSerializer


class ResourceDownloadLeadViewSet(PublicCreateViewSet):
    queryset = ResourceDownloadLead.objects.all()
    serializer_class = ResourceDownloadLeadSerializer
