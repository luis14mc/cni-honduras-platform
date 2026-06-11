import json
from urllib import error, request

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.integrations.models import (
    WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
    SuiteCRMIntegrationLog,
    WebhookEvent,
)

MAX_RESPONSE_BODY_LENGTH = 500


def build_outbound_payload(event: WebhookEvent) -> dict:
    return {
        "event_id": event.id,
        "source": event.source,
        "event_type": event.event_type,
        "payload": event.payload,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


def truncate_body(body: str, max_length: int = MAX_RESPONSE_BODY_LENGTH) -> str:
    if len(body) <= max_length:
        return body
    return f"{body[:max_length]}…"


def post_json(url: str, payload: dict) -> tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=30) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8", errors="replace")
            return status_code, truncate_body(body)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, truncate_body(body)


class Command(BaseCommand):
    help = "Process pending WebhookEvents and send them to the configured n8n webhook."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="Maximum number of pending events to process (default: 10).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show pending events and payloads without sending or updating records.",
        )

    def handle(self, *args, **options):
        limit = options["limit"]
        dry_run = options["dry_run"]
        webhook_url = getattr(settings, "N8N_PROJECT_APPLICATION_WEBHOOK_URL", "").strip()

        pending_events = list(
            WebhookEvent.objects.filter(
                processed=False,
                event_type=WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
            ).order_by("created_at", "id")[:limit]
        )

        if not pending_events:
            self.stdout.write(self.style.SUCCESS("No pending webhook events to process."))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {len(pending_events)} pending event(s) would be sent to n8n."
                )
            )
            for event in pending_events:
                outbound_payload = build_outbound_payload(event)
                self.stdout.write(
                    f"- WebhookEvent #{event.id} ({event.event_type}) "
                    f"created_at={event.created_at.isoformat()}"
                )
                self.stdout.write(json.dumps(outbound_payload, ensure_ascii=False, indent=2))
            return

        if not webhook_url:
            self.stderr.write(
                self.style.WARNING(
                    "N8N_PROJECT_APPLICATION_WEBHOOK_URL is not configured. "
                    "Skipping webhook processing."
                )
            )
            return

        processed_count = 0
        failed_count = 0

        for event in pending_events:
            outbound_payload = build_outbound_payload(event)
            try:
                status_code, response_body = post_json(webhook_url, outbound_payload)
            except error.URLError as exc:
                self._handle_failure(event, outbound_payload, str(exc.reason or exc))
                failed_count += 1
                continue
            except Exception as exc:
                self._handle_failure(event, outbound_payload, str(exc))
                failed_count += 1
                continue

            if 200 <= status_code < 300:
                event.processed = True
                event.processed_at = timezone.now()
                event.error_message = ""
                event.save(update_fields=["processed", "processed_at", "error_message"])

                SuiteCRMIntegrationLog.objects.create(
                    action="send_to_n8n",
                    related_model="WebhookEvent",
                    related_object_id=str(event.id),
                    payload=outbound_payload,
                    response={
                        "status_code": status_code,
                        "body": response_body,
                    },
                    success=True,
                )
                processed_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"WebhookEvent #{event.id} sent successfully (HTTP {status_code})."
                    )
                )
            else:
                error_message = f"HTTP {status_code}: {response_body}"
                self._handle_failure(event, outbound_payload, error_message, status_code, response_body)
                failed_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished: {processed_count} processed, {failed_count} failed, "
                f"{len(pending_events) - processed_count - failed_count} skipped."
            )
        )

    def _handle_failure(
        self,
        event: WebhookEvent,
        outbound_payload: dict,
        error_message: str,
        status_code: int | None = None,
        response_body: str = "",
    ) -> None:
        short_error = truncate_body(error_message, max_length=500)
        event.error_message = short_error
        event.save(update_fields=["error_message"])

        response = {"status_code": status_code, "body": response_body} if status_code else {}
        SuiteCRMIntegrationLog.objects.create(
            action="send_to_n8n",
            related_model="WebhookEvent",
            related_object_id=str(event.id),
            payload=outbound_payload,
            response=response,
            success=False,
            error_message=short_error,
        )
        self.stderr.write(
            self.style.ERROR(f"WebhookEvent #{event.id} failed: {short_error}")
        )
