"""Entrega los ``WebhookEvent`` pendientes a cni-crm (CRM-035).

Destino: ``CNI_CRM_INTAKE_URL`` con ``Authorization: Bearer CNI_CRM_INTAKE_TOKEN``.
Si no está configurado, se usa el webhook legado de n8n
(``N8N_PROJECT_APPLICATION_WEBHOOK_URL``) solo para postulaciones.

Reglas de entrega:

* 2xx → procesado. Si cni-crm devuelve ``crm_record_id`` se guarda en el envío
  (``crm_synced`` / ``crm_record_id``).
* 400, 401, 403, 404, 409, 413, 422 → fallo definitivo: no se reintenta.
* Otros errores (red, 408, 429, 5xx) → reintento con espera creciente
  (1, 2, 4 … hasta 60 minutos) y, tras ``MAX_ATTEMPTS``, fallo definitivo.
"""

import json
from datetime import timedelta
from urllib import error, request

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from apps.integrations.models import (
    CRM_EVENT_TYPES,
    WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED,
    WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED,
    WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
    WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED,
    SuiteCRMIntegrationLog,
    WebhookEvent,
)

CONTRACT_VERSION = 1
MAX_RESPONSE_BODY_LENGTH = 500
MAX_ATTEMPTS = 10
MAX_BACKOFF_MINUTES = 60
PERMANENT_STATUS_CODES = frozenset({400, 401, 403, 404, 409, 413, 422})


def build_outbound_payload(event: WebhookEvent) -> dict:
    occurred = event.created_at.isoformat() if event.created_at else None
    return {
        "contract_version": CONTRACT_VERSION,
        "event_id": event.id,
        "source": event.source,
        "event_type": event.event_type,
        "occurred_at": occurred,
        "payload": event.payload,
        # Compatibilidad con el contrato que esperaba n8n.
        "created_at": occurred,
    }


def truncate_body(body: str, max_length: int = MAX_RESPONSE_BODY_LENGTH) -> str:
    if len(body) <= max_length:
        return body
    return f"{body[:max_length]}…"


def post_json(url: str, payload: dict, token: str = "") -> tuple[int, str]:
    data = json.dumps(payload, default=str).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = request.Request(url, data=data, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=30) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8", errors="replace")
            return status_code, body
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body


def backoff_for(attempts: int) -> timedelta:
    return timedelta(minutes=min(2 ** max(attempts - 1, 0), MAX_BACKOFF_MINUTES))


def submission_model_for(event_type: str):
    from apps.forms.models import (
        AdvisoryRequest,
        ContactSubmission,
        ProjectApplication,
        ResourceDownloadLead,
    )

    return {
        WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED: ProjectApplication,
        WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED: ContactSubmission,
        WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED: AdvisoryRequest,
        WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED: ResourceDownloadLead,
    }.get(event_type)


def mark_submission_synced(event: WebhookEvent, crm_record_id: str) -> None:
    model = submission_model_for(event.event_type)
    submission_id = (event.payload or {}).get("submission_id") or (event.payload or {}).get(
        "application_id"
    )
    if model is None or not submission_id or not crm_record_id:
        return
    model.objects.filter(pk=submission_id).update(
        crm_synced=True, crm_record_id=str(crm_record_id)[:120]
    )


class Command(BaseCommand):
    help = "Send pending WebhookEvents to cni-crm (or the legacy n8n webhook)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=25,
            help="Maximum number of pending events to process (default: 25).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show pending events and payloads without sending or updating records.",
        )

    def _destination(self):
        url = getattr(settings, "CNI_CRM_INTAKE_URL", "").strip()
        if url:
            return url, getattr(settings, "CNI_CRM_INTAKE_TOKEN", "").strip(), CRM_EVENT_TYPES, "cni_crm"
        legacy = getattr(settings, "N8N_PROJECT_APPLICATION_WEBHOOK_URL", "").strip()
        return legacy, "", (WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,), "n8n"

    def handle(self, *args, **options):
        limit = options["limit"]
        dry_run = options["dry_run"]
        url, token, event_types, target = self._destination()
        now = timezone.now()

        pending_events = list(
            WebhookEvent.objects.filter(
                processed=False,
                failed_permanently=False,
                event_type__in=event_types,
            )
            .filter(Q(next_attempt_at__isnull=True) | Q(next_attempt_at__lte=now))
            .order_by("created_at", "id")[:limit]
        )

        if not pending_events:
            self.stdout.write(self.style.SUCCESS("No pending webhook events to process."))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {len(pending_events)} pending event(s) would be sent to {target}."
                )
            )
            for event in pending_events:
                self.stdout.write(
                    f"- WebhookEvent #{event.id} ({event.event_type}) "
                    f"created_at={event.created_at.isoformat()}"
                )
                self.stdout.write(
                    json.dumps(build_outbound_payload(event), ensure_ascii=False, indent=2, default=str)
                )
            return

        if not url:
            self.stderr.write(
                self.style.WARNING(
                    "CNI_CRM_INTAKE_URL is not configured. Skipping webhook processing."
                )
            )
            return
        if target == "cni_crm" and not token:
            self.stderr.write(
                self.style.WARNING("CNI_CRM_INTAKE_TOKEN is not configured. Skipping webhook processing.")
            )
            return

        processed_count = 0
        failed_count = 0
        action = f"send_to_{target}"

        for event in pending_events:
            outbound_payload = build_outbound_payload(event)
            try:
                status_code, body = post_json(url, outbound_payload, token)
            except error.URLError as exc:
                self._handle_failure(event, outbound_payload, action, str(exc.reason or exc))
                failed_count += 1
                continue
            except Exception as exc:  # noqa: BLE001 - se registra y se reintenta
                self._handle_failure(event, outbound_payload, action, str(exc))
                failed_count += 1
                continue

            if 200 <= status_code < 300:
                crm_record_id = ""
                try:
                    crm_record_id = str(json.loads(body or "{}").get("crm_record_id") or "")
                except (ValueError, AttributeError):
                    crm_record_id = ""
                event.processed = True
                event.processed_at = timezone.now()
                event.error_message = ""
                event.attempts += 1
                event.next_attempt_at = None
                event.save(
                    update_fields=["processed", "processed_at", "error_message", "attempts", "next_attempt_at"]
                )
                mark_submission_synced(event, crm_record_id)
                SuiteCRMIntegrationLog.objects.create(
                    action=action,
                    related_model="WebhookEvent",
                    related_object_id=str(event.id),
                    payload=outbound_payload,
                    response={"status_code": status_code, "body": truncate_body(body)},
                    success=True,
                )
                processed_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"WebhookEvent #{event.id} sent successfully (HTTP {status_code}).")
                )
            else:
                self._handle_failure(
                    event,
                    outbound_payload,
                    action,
                    f"HTTP {status_code}: {truncate_body(body)}",
                    status_code,
                    truncate_body(body),
                )
                failed_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Finished: {processed_count} processed, {failed_count} failed.")
        )

    def _handle_failure(
        self,
        event: WebhookEvent,
        outbound_payload: dict,
        action: str,
        error_message: str,
        status_code: int | None = None,
        response_body: str = "",
    ) -> None:
        short_error = truncate_body(error_message, max_length=500)
        event.attempts += 1
        permanent = status_code in PERMANENT_STATUS_CODES or event.attempts >= MAX_ATTEMPTS
        event.failed_permanently = permanent
        event.next_attempt_at = None if permanent else timezone.now() + backoff_for(event.attempts)
        event.error_message = short_error
        event.save(update_fields=["error_message", "attempts", "failed_permanently", "next_attempt_at"])

        response = {"status_code": status_code, "body": response_body} if status_code else {}
        SuiteCRMIntegrationLog.objects.create(
            action=action,
            related_model="WebhookEvent",
            related_object_id=str(event.id),
            payload=outbound_payload,
            response=response,
            success=False,
            error_message=short_error,
        )
        label = "permanently failed" if permanent else f"failed (retry #{event.attempts})"
        self.stderr.write(self.style.ERROR(f"WebhookEvent #{event.id} {label}: {short_error}"))
