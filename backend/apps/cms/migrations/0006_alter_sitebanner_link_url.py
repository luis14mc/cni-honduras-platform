from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cms", "0005_sitebanner_mobile_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sitebanner",
            name="link_url",
            field=models.CharField(blank=True, default="", max_length=500),
        ),
    ]
