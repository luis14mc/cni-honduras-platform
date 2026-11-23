from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("forms_app", "0005_leads_002_internal_management")]

    operations = [
        migrations.AddField(
            model_name="resourcedownloadlead",
            name="strapi_document_id",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="resourcedownloadlead",
            name="resource_locale",
            field=models.CharField(blank=True, default="", max_length=2),
        ),
        migrations.AddField(
            model_name="resourcedownloadlead",
            name="consented_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
