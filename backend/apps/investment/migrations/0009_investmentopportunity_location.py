from django.contrib.gis.db import models as gis_models
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("investment", "0008_investmentproject_location"),
    ]

    operations = [
        migrations.AddField(
            model_name="investmentopportunity",
            name="location",
            field=gis_models.PointField(blank=True, null=True, srid=4326),
        ),
    ]
