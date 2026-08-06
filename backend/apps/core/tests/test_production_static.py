from django.test import SimpleTestCase, override_settings


class ProductionStaticSettingsTests(SimpleTestCase):
    def test_whitenoise_middleware_after_security(self):
        from config.settings import production

        middleware = production.MIDDLEWARE
        security_index = middleware.index("django.middleware.security.SecurityMiddleware")
        whitenoise_index = middleware.index("whitenoise.middleware.WhiteNoiseMiddleware")
        self.assertEqual(whitenoise_index, security_index + 1)

    @override_settings(
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
                "OPTIONS": {"location": "/tmp/media", "base_url": "/media/"},
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        }
    )
    def test_static_and_media_storage_are_separate(self):
        from django.conf import settings

        self.assertNotEqual(
            settings.STORAGES["default"]["BACKEND"],
            settings.STORAGES["staticfiles"]["BACKEND"],
        )
        self.assertIn("StaticFilesStorage", settings.STORAGES["staticfiles"]["BACKEND"])
