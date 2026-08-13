from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("media_library", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="mediaasset",
            name="file_size_bytes",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="mediaasset",
            name="mime_type",
            field=models.CharField(blank=True, default="", max_length=128, null=True),
        ),
        migrations.AddField(
            model_name="mediaasset",
            name="original_filename",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
