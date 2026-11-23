import logging
from decimal import Decimal

from django.core import signing
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.forms.throttles import FormsRateThrottle, ProjectSubmissionRateThrottle
from apps.integrations.models import (
    WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED,
    WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED,
    WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
    WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED,
    WEBHOOK_SOURCE_WEBSITE,
    WebhookEvent,
)

from .resource_downloads import (
    DOWNLOAD_TTL_SECONDS,
    REMEMBER_SALT,
    REMEMBER_TTL_SECONDS,
    get_gated_resource,
    sign_resource_download,
)
from .models import AdvisoryRequest, ContactSubmission, ProjectApplication, ResourceDownloadLead
from .serializers import (
    AdvisoryRequestSerializer,
    ContactSubmissionSerializer,
    GatedResourceDownloadSerializer,
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
    _enqueue(
        WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
        build_project_application_webhook_payload(submission),
        submission,
    )


def _base_submission_payload(submission, model_label: str) -> dict:
    """Campos comunes de ``BaseSubmission`` para el contrato v1 de cni-crm."""
    return {
        "submission_model": model_label,
        "submission_id": submission.pk,
        "full_name": submission.full_name,
        "email": submission.email,
        "phone": submission.phone,
        "company": submission.company,
        "country": submission.country,
        "source": submission.source,
        "created_at": submission.created_at.isoformat() if submission.created_at else None,
    }


def build_contact_submission_webhook_payload(submission: ContactSubmission) -> dict:
    return {**_base_submission_payload(submission, "forms.ContactSubmission"), "message": submission.message}


def build_advisory_request_webhook_payload(submission: AdvisoryRequest) -> dict:
    return {
        **_base_submission_payload(submission, "forms.AdvisoryRequest"),
        "message": submission.message,
        "advisory_type": submission.advisory_type,
        "sector": submission.sector,
    }


def build_resource_download_webhook_payload(
    submission: ResourceDownloadLead, *, is_repeat: bool | None = None
) -> dict:
    return {
        **_base_submission_payload(submission, "forms.ResourceDownloadLead"),
        "resource_name": submission.resource_name,
        "details": submission.details,
        "strapi_document_id": submission.strapi_document_id,
        "resource_locale": submission.resource_locale,
        "consented_at": submission.consented_at.isoformat() if submission.consented_at else None,
        **({"is_repeat": is_repeat} if is_repeat is not None else {}),
    }


def _enqueue(event_type: str, payload: dict, submission) -> None:
    # El fallo al encolar nunca rompe el envío público: queda en el log.
    try:
        WebhookEvent.objects.create(
            source=WEBHOOK_SOURCE_WEBSITE,
            event_type=event_type,
            payload=payload,
        )
    except Exception:
        logger.exception(
            "Failed to create WebhookEvent %s for %s pk=%s",
            event_type,
            type(submission).__name__,
            submission.pk,
        )


class ContactSubmissionViewSet(PublicCreateViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer

    def perform_create(self, serializer):
        super().perform_create(serializer)
        _enqueue(
            WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED,
            build_contact_submission_webhook_payload(serializer.instance),
            serializer.instance,
        )


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

    def perform_create(self, serializer):
        super().perform_create(serializer)
        _enqueue(
            WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED,
            build_advisory_request_webhook_payload(serializer.instance),
            serializer.instance,
        )


class ResourceDownloadLeadViewSet(PublicCreateViewSet):
    queryset = ResourceDownloadLead.objects.all()
    serializer_class = ResourceDownloadLeadSerializer

    def create(self, request, *args, **kwargs):
        if "strapi_document_id" not in request.data:
            return super().create(request, *args, **kwargs)

        form = GatedResourceDownloadSerializer(data=request.data)
        form.is_valid(raise_exception=True)
        data = form.validated_data
        token = data.get("remember_token")
        fields = ("full_name", "email", "company", "country", "details")
        if token:
            try:
                lead_id = signing.loads(token, salt=REMEMBER_SALT, max_age=REMEMBER_TTL_SECONDS)
                previous = self.get_queryset().get(pk=lead_id, consented_at__isnull=False)
            except (signing.BadSignature, ResourceDownloadLead.DoesNotExist) as error:
                raise ValidationError({"remember_token": "Download session expired."}) from error
            contact = {field: getattr(previous, field) for field in fields}
            consented_at = previous.consented_at
        else:
            contact = {field: data[field] for field in fields}
            consented_at = timezone.now()

        title, key = get_gated_resource(data["strapi_document_id"], data["locale"])
        url = sign_resource_download(key)
        lead = self.get_queryset().create(
            **contact,
            resource_name=title,
            strapi_document_id=data["strapi_document_id"],
            resource_locale=data["locale"],
            source="web-resource-download",
            consented_at=consented_at,
        )
        _enqueue(
            WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED,
            build_resource_download_webhook_payload(lead, is_repeat=bool(token)),
            lead,
        )
        return Response(
            {
                "download_url": url,
                "expires_in": DOWNLOAD_TTL_SECONDS,
                "remember_token": token or signing.dumps(lead.pk, salt=REMEMBER_SALT),
            },
            status=status.HTTP_201_CREATED,
            headers={"Cache-Control": "private, no-store"},
        )

    def perform_create(self, serializer):
        super().perform_create(serializer)
        _enqueue(
            WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED,
            build_resource_download_webhook_payload(serializer.instance),
            serializer.instance,
        )
