# Generated manually for S2-T8 — editorial opportunity + metrics + fund uses

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


def migrate_opportunity_visibility(apps, schema_editor):
    InvestmentOpportunity = apps.get_model("investment", "InvestmentOpportunity")
    now = timezone.now()
    for obj in InvestmentOpportunity.objects.all():
        was_public = bool(getattr(obj, "is_public", False))
        if was_public:
            obj.status = "published"
            if not obj.published_at:
                obj.published_at = obj.updated_at or now
        else:
            obj.status = "draft"
            obj.published_at = None
        # Copy title into title_es when translation columns exist empty
        if hasattr(obj, "title_es") and not (obj.title_es or "").strip():
            obj.title_es = obj.title or ""
        if hasattr(obj, "summary_es") and not (obj.summary_es or "").strip():
            obj.summary_es = obj.summary or ""
        if hasattr(obj, "description_es") and not (obj.description_es or "").strip():
            obj.description_es = obj.description or ""
        obj.save()


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("investment", "0005_successstory_person_and_featured"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name="investmentopportunity",
            old_name="status",
            new_name="lifecycle_status",
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="code",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Opportunity card code, e.g. OC-CNI-T002",
                max_length=64,
            ),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="target_customer",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="market_demand",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="value_proposition",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="order",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="status",
            field=models.CharField(
                choices=[("draft", "Draft"), ("published", "Published"), ("archived", "Archived")],
                db_index=True,
                default="draft",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="published_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="created_%(class)ss",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="updated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="updated_%(class)ss",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="investmentopportunity",
            name="title",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="investmentopportunity",
            name="description",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Opportunity description (ficha: descripción de la oportunidad).",
            ),
        ),
        migrations.AlterField(
            model_name="investmentopportunity",
            name="sector",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="opportunities",
                to="investment.sector",
            ),
        ),
        # modeltranslation fields
        migrations.AddField(
            model_name="investmentopportunity",
            name="title_es",
            field=models.CharField(blank=True, default="", max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="title_en",
            field=models.CharField(blank=True, default="", max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="summary_es",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="summary_en",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="description_es",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Opportunity description (ficha: descripción de la oportunidad).",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="description_en",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Opportunity description (ficha: descripción de la oportunidad).",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="target_customer_es",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="target_customer_en",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="market_demand_es",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="market_demand_en",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="value_proposition_es",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.AddField(
            model_name="investmentopportunity",
            name="value_proposition_en",
            field=models.TextField(blank=True, default="", null=True),
        ),
        migrations.RunPython(migrate_opportunity_visibility, noop_reverse),
        migrations.RemoveField(
            model_name="investmentopportunity",
            name="is_public",
        ),
        migrations.AlterModelOptions(
            name="investmentopportunity",
            options={
                "ordering": ("order", "-is_featured", "-published_at", "-created_at", "-id"),
                "verbose_name": "Oportunidad de inversión",
                "verbose_name_plural": "Oportunidades de inversión",
            },
        ),
        migrations.CreateModel(
            name="OpportunityMetric",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(max_length=255)),
                ("label_es", models.CharField(max_length=255, null=True)),
                ("label_en", models.CharField(max_length=255, null=True)),
                ("value", models.CharField(blank=True, default="", max_length=255)),
                ("value_es", models.CharField(blank=True, default="", max_length=255, null=True)),
                ("value_en", models.CharField(blank=True, default="", max_length=255, null=True)),
                ("note", models.CharField(blank=True, default="", max_length=255)),
                ("note_es", models.CharField(blank=True, default="", max_length=255, null=True)),
                ("note_en", models.CharField(blank=True, default="", max_length=255, null=True)),
                ("icon", models.CharField(blank=True, default="", max_length=64)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "opportunity",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="metrics",
                        to="investment.investmentopportunity",
                    ),
                ),
            ],
            options={
                "verbose_name": "Métrica de oportunidad",
                "verbose_name_plural": "Métricas de oportunidad",
                "ordering": ("order", "id"),
            },
        ),
        migrations.CreateModel(
            name="OpportunityFundUse",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("component", models.CharField(max_length=255)),
                ("component_es", models.CharField(max_length=255, null=True)),
                ("component_en", models.CharField(max_length=255, null=True)),
                ("amount", models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True)),
                ("description", models.TextField(blank=True, default="")),
                ("description_es", models.TextField(blank=True, default="", null=True)),
                ("description_en", models.TextField(blank=True, default="", null=True)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "opportunity",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fund_uses",
                        to="investment.investmentopportunity",
                    ),
                ),
            ],
            options={
                "verbose_name": "Uso de fondos",
                "verbose_name_plural": "Usos de fondos",
                "ordering": ("order", "id"),
            },
        ),
    ]
