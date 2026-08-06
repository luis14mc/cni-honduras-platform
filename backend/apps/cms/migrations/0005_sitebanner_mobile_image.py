from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("cms", "0004_document_external_url_seo"),
        ("media_library", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitebanner",
            name="mobile_image",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="mobile_banners",
                to="media_library.mediaasset",
            ),
        ),
    ]
