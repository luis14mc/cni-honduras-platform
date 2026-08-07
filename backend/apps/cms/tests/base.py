"""Shared helpers for CMS-admin test cases."""

from __future__ import annotations

from django.core.cache import cache
from rest_framework.test import APITestCase


class CMSAdminTestCase(APITestCase):
    """Clear throttle/cache state so CMS login rate limits do not leak between tests."""

    def setUp(self):
        cache.clear()
        super().setUp()

    def tearDown(self):
        cache.clear()
        super().tearDown()
