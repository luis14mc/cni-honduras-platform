from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("cms", "0002_institutionallink_alter_document_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="page",
            options={
                "ordering": ["-published_at", "-updated_at", "-id"],
                "permissions": [("can_publish", "Puede publicar contenido")],
                "verbose_name": "Page",
                "verbose_name_plural": "Pages",
            },
        ),
    ]
