from io import BytesIO
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.forms.models import ResourceDownloadLead
from apps.forms.resource_downloads import get_gated_resource
from apps.integrations.models import WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED, WebhookEvent


URL = "/api/v1/forms/resource-download/"
RESOLVER = "apps.forms.viewsets.get_gated_resource"
CONFIG = {
    "bucket": "cni-private",
    "endpoint": "https://objects.example.test",
    "region": "us-east-1",
    "access_key": "test-only-key",
    "secret_key": "test-only-secret",
}


@override_settings(GATED_RESOURCE_STORAGE=CONFIG)
class GatedResourceDownloadTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.payload = {
            "strapi_document_id": "resource1",
            "locale": "es",
            "full_name": "Ana Prueba",
            "email": "ana@example.test",
            "company": "Empresa",
            "country": "Honduras",
            "details": "Estudios técnicos",
            "consent": True,
        }

    @patch(RESOLVER, return_value=("Guía CNI", "documents/guide.pdf"))
    def test_saves_consent_and_returns_presigned_attachment_for_fifteen_minutes(self, resolve):
        response = self.client.post(URL, self.payload, format="json")

        self.assertEqual(response.status_code, 201, response.data)
        resolve.assert_called_once_with("resource1", "es")
        self.assertEqual(response["Cache-Control"], "private, no-store")
        url = urlsplit(response.data["download_url"])
        query = parse_qs(url.query)
        self.assertEqual(url.path, "/cni-private/documents/guide.pdf")
        self.assertEqual(query["X-Amz-Expires"], ["900"])
        self.assertEqual(query["response-content-disposition"], ["attachment"])
        self.assertIn("X-Amz-Signature", query)
        self.assertEqual(response.data["expires_in"], 900)
        lead = ResourceDownloadLead.objects.get()
        self.assertEqual(lead.resource_name, "Guía CNI")
        self.assertEqual(lead.strapi_document_id, "resource1")
        self.assertIsNotNone(lead.consented_at)
        self.assertTrue(WebhookEvent.objects.filter(event_type=WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED).exists())

        followup = self.client.post(URL, {
            "strapi_document_id": "resource2",
            "locale": "en",
            "remember_token": response.data["remember_token"],
        }, format="json")

        self.assertEqual(followup.status_code, 201, followup.data)
        remembered = ResourceDownloadLead.objects.get(strapi_document_id="resource2")
        self.assertEqual(remembered.email, lead.email)
        self.assertEqual(remembered.consented_at, lead.consented_at)

    @patch(RESOLVER)
    def test_honeypot_missing_consent_and_invalid_session_never_issue_download(self, resolve):
        for changes in (
            {"website": "spam"},
            {"consent": False},
            {"remember_token": "invalid"},
            {"strapi_document_id": "../free-document"},
        ):
            with self.subTest(changes=changes):
                response = self.client.post(URL, {**self.payload, **changes}, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertNotIn("download_url", response.data)
        resolve.assert_not_called()
        self.assertFalse(ResourceDownloadLead.objects.exists())

    @override_settings(GATED_RESOURCE_STORAGE={})
    @patch(RESOLVER, return_value=("Guía CNI", "documents/guide.pdf"))
    def test_storage_error_does_not_save_lead(self, resolve):
        response = self.client.post(URL, self.payload, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertFalse(ResourceDownloadLead.objects.exists())

    @patch(RESOLVER, return_value=("Guía CNI", "documents/guide.pdf"))
    def test_endpoint_is_rate_limited(self, resolve):
        for _ in range(10):
            self.assertEqual(self.client.post(URL, self.payload, format="json").status_code, 201)
        self.assertEqual(self.client.post(URL, self.payload, format="json").status_code, 429)
        self.assertEqual(resolve.call_count, 10)

    @override_settings(
        GATED_RESOURCE_STRAPI_URL="https://strapi.example.test",
        GATED_RESOURCE_STRAPI_TOKEN="test-only-token",
    )
    @patch("apps.forms.resource_downloads.build_opener")
    def test_resolver_uses_scoped_authorization_and_requested_locale(self, opener):
        opener.return_value.open.return_value = BytesIO(b'{"title":"Guide","objectKey":"docs/guide.pdf"}')
        self.assertEqual(get_gated_resource("resource1", "en"), ("Guide", "docs/guide.pdf"))
        request = opener.return_value.open.call_args.args[0]
        self.assertEqual(request.full_url, "https://strapi.example.test/api/gated-resources/resource1?locale=en")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-only-token")
