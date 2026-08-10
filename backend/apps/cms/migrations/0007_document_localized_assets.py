"""Migrate Document assets to localized ES/EN fields."""

from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


DOCUMENT_ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx", "pptx", "zip"]


def copy_legacy_document_assets(apps, schema_editor):
    Document = apps.get_model("cms", "Document")
    for doc in Document.objects.all():
        fields = []
        if doc.file:
            doc.file_es = doc.file
            fields.append("file_es")
        if doc.external_url:
            doc.external_url_es = doc.external_url
            fields.append("external_url_es")
        if doc.cover_image_id:
            doc.cover_image_es_id = doc.cover_image_id
            fields.append("cover_image_es_id")
        if fields:
            doc.save(update_fields=fields)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("media_library", "0001_initial"),
        ("cms", "0006_alter_sitebanner_link_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="document",
            name="file_es",
            field=models.FileField(
                blank=True,
                upload_to="documents/%Y/%m/",
                validators=[django.core.validators.FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)],
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="file_en",
            field=models.FileField(
                blank=True,
                upload_to="documents/%Y/%m/",
                validators=[django.core.validators.FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)],
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="external_url_es",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="document",
            name="external_url_en",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="document",
            name="cover_image_es",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cover_es_documents",
                to="media_library.mediaasset",
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="cover_image_en",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cover_en_documents",
                to="media_library.mediaasset",
            ),
        ),
        migrations.RunPython(copy_legacy_document_assets, noop),
        migrations.RemoveField(model_name="document", name="file"),
        migrations.RemoveField(model_name="document", name="external_url"),
        migrations.RemoveField(model_name="document", name="cover_image"),
    ]
