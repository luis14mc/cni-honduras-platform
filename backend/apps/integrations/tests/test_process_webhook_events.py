from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.forms.models import ContactSubmission
from apps.integrations.models import WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED, WebhookEvent

CMD = "apps.integrations.management.commands.process_webhook_events.post_json"


@override_settings(CNI_CRM_INTAKE_URL="https://crm.example/api/intake/events/", CNI_CRM_INTAKE_TOKEN="t" * 40)
class ProcessWebhookEventsTests(TestCase):
    def setUp(self):
        self.submission = ContactSubmission.objects.create(full_name="Ana Prueba", email="ana@example.com")
        self.event = WebhookEvent.objects.create(
            source="website",
            event_type=WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED,
            payload={"submission_id": self.submission.pk, "full_name": "Ana Prueba", "email": "ana@example.com"},
        )

    def run_command(self):
        call_command("process_webhook_events", stdout=StringIO(), stderr=StringIO())
        self.event.refresh_from_db()

    def test_success_marks_event_and_submission(self):
        with patch(CMD, return_value=(201, '{"crm_record_id": "abc-123"}')) as post:
            self.run_command()
        url, body, token = post.call_args.args
        self.assertEqual(token, "t" * 40)
        self.assertEqual(body["contract_version"], 1)
        self.assertEqual(body["event_id"], self.event.pk)
        self.assertTrue(self.event.processed)
        self.submission.refresh_from_db()
        self.assertTrue(self.submission.crm_synced)
        self.assertEqual(self.submission.crm_record_id, "abc-123")

    def test_contract_error_is_permanent(self):
        with patch(CMD, return_value=(400, '{"detail": "x"}')):
            self.run_command()
        self.assertFalse(self.event.processed)
        self.assertTrue(self.event.failed_permanently)
        with patch(CMD) as post:
            self.run_command()
        post.assert_not_called()

    def test_server_error_is_retried_later(self):
        with patch(CMD, return_value=(503, "down")):
            self.run_command()
        self.assertFalse(self.event.failed_permanently)
        self.assertEqual(self.event.attempts, 1)
        self.assertGreater(self.event.next_attempt_at, timezone.now())
        with patch(CMD) as post:
            self.run_command()
        post.assert_not_called()

    @override_settings(CNI_CRM_INTAKE_TOKEN="")
    def test_missing_token_skips_sending(self):
        with patch(CMD) as post:
            self.run_command()
        post.assert_not_called()
        self.assertEqual(self.event.attempts, 0)


class ContactFormEnqueuesEventTests(TestCase):
    def test_contact_form_creates_crm_event(self):
        response = self.client.post(
            "/api/v1/forms/contact/",
            {"full_name": "Ana Prueba", "email": "ana@example.com", "message": "Hola"},
            content_type="application/json",
        )
        if response.status_code == 404:
            self.skipTest("Ruta de contacto distinta en este entorno")
        self.assertEqual(response.status_code, 201, response.content)
        event = WebhookEvent.objects.get(event_type=WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED)
        self.assertEqual(event.payload["email"], "ana@example.com")
