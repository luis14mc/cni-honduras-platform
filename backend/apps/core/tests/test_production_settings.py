import os
from pathlib import Path
import secrets
import subprocess
import sys

from django.test import SimpleTestCase

from config.settings.base import DEFAULT_SECRET_KEY


class ProductionSecretKeyTests(SimpleTestCase):
    def load_production_settings(self, key, *, allow_build_key=False):
        environment = os.environ.copy()
        environment.pop("DJANGO_SECRET_KEY", None)
        environment.pop("DJANGO_ALLOW_BUILD_KEY", None)
        environment.update(DATABASE_URL="sqlite:///:memory:", USE_S3_STORAGE="false")
        if key is not None:
            environment["DJANGO_SECRET_KEY"] = key
        if allow_build_key:
            environment["DJANGO_ALLOW_BUILD_KEY"] = "1"

        return subprocess.run(
            [
                sys.executable,
                "-c",
                "from unittest.mock import patch\n"
                "with patch('environ.Env.read_env'):\n"
                "    import config.settings.production\n",
            ],
            cwd=Path(__file__).resolve().parents[3],
            env=environment,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_rejects_unsafe_runtime_keys(self):
        build_key = "build-only-" + secrets.token_urlsafe(64)
        for label, key in {
            "missing": None,
            "empty": "",
            "default": DEFAULT_SECRET_KEY,
            "short": "x" * 49,
            "build-only": build_key,
        }.items():
            with self.subTest(label=label):
                result = self.load_production_settings(key)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("ImproperlyConfigured: DJANGO_SECRET_KEY", result.stderr)

    def test_accepts_valid_runtime_key(self):
        result = self.load_production_settings(secrets.token_urlsafe(64))
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_allows_temporary_key_during_image_build(self):
        result = self.load_production_settings("build-only-" + secrets.token_urlsafe(64), allow_build_key=True)
        self.assertEqual(result.returncode, 0, result.stderr)
