# Generated for S2-T8 — public metric flag

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("investment", "0006_opportunity_editorial_metrics_fund_uses"),
    ]

    operations = [
        migrations.AddField(
            model_name="opportunitymetric",
            name="is_public",
            field=models.BooleanField(
                db_index=True,
                default=False,
                help_text="Si es verdadero, la métrica puede aparecer en la API/página pública (máx. 4).",
            ),
        ),
    ]
