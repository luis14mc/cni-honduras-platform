from unittest.mock import patch

from django.db import DatabaseError
from django.test import TestCase
from django.urls import reverse


class HealthTests(TestCase):
    def test_ready_when_database_responds(self):
        response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_unavailable_when_database_query_fails(self):
        with patch("config.urls.connection.cursor", side_effect=DatabaseError):
            response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "unavailable"})
