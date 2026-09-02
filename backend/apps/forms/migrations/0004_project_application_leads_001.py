import uuid

from django.db import migrations, models
import django.db.models.deletion
import apps.forms.models


def populate_reference_codes(apps, schema_editor):
    ProjectApplication = apps.get_model("forms_app", "ProjectApplication")
    year = 2026
    for submission in ProjectApplication.objects.filter(reference_code__isnull=True).iterator():
        submission.reference_code = f"CNI-PROJ-{year}-{uuid.uuid4().hex[:8].upper()}"
        submission.save(update_fields=("reference_code",))


class Migration(migrations.Migration):
    dependencies = [
        ("forms_app", "0003_resourcedownloadlead_document"),
        ("geo", "0004_strategicinfrastructure"),
        ("investment", "0008_investmentproject_location"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectapplication",
            name="reference_code",
            field=models.CharField(editable=False, max_length=23, null=True),
        ),
        migrations.AddField(
            model_name="projectapplication",
            name="website",
            field=models.URLField(blank=True, default="", verbose_name="Sitio web"),
        ),
        migrations.AddField(
            model_name="projectapplication",
            name="sector_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="project_submissions", to="investment.sector", verbose_name="Sector canónico"),
        ),
        migrations.AddField(
            model_name="projectapplication",
            name="department_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="project_submissions", to="geo.department", verbose_name="Departamento canónico"),
        ),
        migrations.AddField(
            model_name="projectapplication",
            name="municipality",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="project_submissions", to="geo.municipality", verbose_name="Municipio"),
        ),
        migrations.AlterField(
            model_name="projectapplication",
            name="investment_range",
            field=models.CharField(blank=True, choices=[("under_10m", "Menos de USD 10 millones"), ("10m_50m", "USD 10 a 50 millones"), ("50m_100m", "USD 50 a 100 millones"), ("over_100m", "Más de USD 100 millones")], default="", max_length=20, verbose_name="Rango de inversión"),
        ),
        migrations.AlterField(
            model_name="projectapplication",
            name="status",
            field=models.CharField(choices=[("new", "Nuevo"), ("reviewing", "En revisión"), ("contacted", "Contactado"), ("qualified", "Calificado"), ("rejected", "Rechazado"), ("converted", "Convertido")], db_index=True, default="new", max_length=16, verbose_name="Estado"),
        ),
        migrations.RunPython(populate_reference_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="projectapplication",
            name="reference_code",
            field=models.CharField(db_index=True, default=apps.forms.models.generate_project_reference, editable=False, max_length=23, unique=True, verbose_name="Código de referencia"),
        ),
    ]
