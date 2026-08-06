import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        "Create or reset a Django superuser from environment variables. "
        "Intended as a temporary bootstrap when shell access is unavailable."
    )

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_ADMIN_USERNAME", "").strip()
        email = os.environ.get("DJANGO_ADMIN_EMAIL", "").strip()
        password = os.environ.get("DJANGO_ADMIN_PASSWORD", "")

        missing = [
            name
            for name, value in (
                ("DJANGO_ADMIN_USERNAME", username),
                ("DJANGO_ADMIN_EMAIL", email),
                ("DJANGO_ADMIN_PASSWORD", password),
            )
            if not value
        ]
        if missing:
            raise CommandError(
                "When CREATE_DJANGO_SUPERUSER=true, set: "
                + ", ".join(missing)
            )

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' {action}."))
