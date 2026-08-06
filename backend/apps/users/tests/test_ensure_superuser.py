import os
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase


class EnsureSuperuserCommandTests(TestCase):
    def setUp(self):
        self.env = {
            "DJANGO_ADMIN_USERNAME": "bootstrap-admin",
            "DJANGO_ADMIN_EMAIL": "admin@example.com",
            "DJANGO_ADMIN_PASSWORD": "temporary-strong-password",
        }

    def test_creates_superuser_when_missing(self):
        with patch.dict(os.environ, self.env, clear=False):
            call_command("ensure_superuser", stdout=StringIO())

        user = get_user_model().objects.get(username="bootstrap-admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.email, "admin@example.com")
        self.assertTrue(user.check_password("temporary-strong-password"))

    def test_updates_existing_user(self):
        user_model = get_user_model()
        user_model.objects.create_user(
            username="bootstrap-admin",
            email="old@example.com",
            password="old-password",
        )

        with patch.dict(os.environ, self.env, clear=False):
            call_command("ensure_superuser", stdout=StringIO())

        user = user_model.objects.get(username="bootstrap-admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.email, "admin@example.com")
        self.assertTrue(user.check_password("temporary-strong-password"))

    def test_missing_env_vars_raise_command_error(self):
        env = {
            "DJANGO_ADMIN_USERNAME": "only-user",
            "DJANGO_ADMIN_EMAIL": "",
            "DJANGO_ADMIN_PASSWORD": "",
        }
        with patch.dict(os.environ, env, clear=False):
            with self.assertRaises(CommandError):
                call_command("ensure_superuser", stdout=StringIO())

        self.assertFalse(get_user_model().objects.filter(username="only-user").exists())
