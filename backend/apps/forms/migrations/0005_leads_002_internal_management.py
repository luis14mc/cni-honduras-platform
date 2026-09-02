import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("forms_app", "0004_project_application_leads_001"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="projectapplication",
            name="assigned_to",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="assigned_project_applications",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Responsable interno",
            ),
        ),
        migrations.CreateModel(
            name="ProjectApplicationNote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("body", models.TextField(max_length=5000, verbose_name="Contenido")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notes",
                        to="forms_app.projectapplication",
                        verbose_name="Postulación",
                    ),
                ),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="project_application_notes",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Autor",
                    ),
                ),
            ],
            options={
                "verbose_name": "Nota interna de postulación",
                "verbose_name_plural": "Notas internas de postulaciones",
                "ordering": ("-created_at", "-id"),
            },
        ),
        migrations.CreateModel(
            name="ProjectApplicationHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("status_changed", "Cambio de estado"),
                            ("assigned", "Asignado"),
                            ("reassigned", "Reasignado"),
                            ("unassigned", "Sin asignar"),
                            ("note_added", "Nota agregada"),
                        ],
                        db_index=True,
                        max_length=32,
                        verbose_name="Tipo de evento",
                    ),
                ),
                ("from_status", models.CharField(blank=True, default="", max_length=16, verbose_name="Estado anterior")),
                ("to_status", models.CharField(blank=True, default="", max_length=16, verbose_name="Estado nuevo")),
                ("metadata", models.JSONField(blank=True, default=dict, verbose_name="Metadatos")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="project_application_history_actions",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Actor",
                    ),
                ),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="history_entries",
                        to="forms_app.projectapplication",
                        verbose_name="Postulación",
                    ),
                ),
                (
                    "from_assignee",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Responsable anterior",
                    ),
                ),
                (
                    "to_assignee",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Responsable nuevo",
                    ),
                ),
            ],
            options={
                "verbose_name": "Historial de postulación",
                "verbose_name_plural": "Historial de postulaciones",
                "ordering": ("-created_at", "-id"),
            },
        ),
    ]
