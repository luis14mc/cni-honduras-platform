"""Document: independent language rows + News content_blocks."""

from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


DOCUMENT_ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx", "pptx", "zip"]


def forwards_document_language_rows(apps, schema_editor):
    Document = apps.get_model("cms", "Document")
    used_slugs = set(Document.objects.values_list("slug", flat=True))

    for doc in Document.objects.all().iterator():
        # Existing rows become Spanish versions.
        resource_key = (doc.slug or f"document-{doc.pk}").strip() or f"document-{doc.pk}"
        updates = {
            "language": "es",
            "resource_key": resource_key,
        }
        if getattr(doc, "file_es", None):
            updates["file"] = doc.file_es
        if getattr(doc, "external_url_es", None):
            updates["external_url"] = doc.external_url_es or ""
        if getattr(doc, "cover_image_es_id", None):
            updates["cover_image_id"] = doc.cover_image_es_id

        Document.objects.filter(pk=doc.pk).update(**updates)

        has_en_file = bool(getattr(doc, "file_en", None) and getattr(doc.file_en, "name", ""))
        has_en_url = bool((getattr(doc, "external_url_en", None) or "").strip())
        has_en_cover = bool(getattr(doc, "cover_image_en_id", None))
        has_en_title = bool((getattr(doc, "title_en", None) or "").strip())

        if not (has_en_file or has_en_url or has_en_cover or has_en_title):
            continue

        en_slug = f"{doc.slug}-en"
        base = en_slug
        n = 2
        while en_slug in used_slugs:
            en_slug = f"{base}-{n}"
            n += 1
        used_slugs.add(en_slug)

        en_doc = Document(
            language="en",
            resource_key=resource_key,
            title=getattr(doc, "title_en", None) or doc.title or "",
            title_es=getattr(doc, "title_en", None) or "",
            title_en=getattr(doc, "title_en", None) or doc.title or "",
            slug=en_slug,
            description=getattr(doc, "description_en", None) or "",
            description_es="",
            description_en=getattr(doc, "description_en", None) or "",
            category=doc.category,
            is_featured=doc.is_featured,
            order=doc.order,
            document_date=doc.document_date,
            file_type=doc.file_type,
            file_size_bytes=doc.file_size_bytes,
            seo_title=getattr(doc, "seo_title_en", None) or "",
            seo_description=getattr(doc, "seo_description_en", None) or "",
            status=doc.status,
            published_at=doc.published_at,
            created_by_id=doc.created_by_id,
            updated_by_id=doc.updated_by_id,
        )
        if has_en_file:
            en_doc.file = doc.file_en
        if has_en_url:
            en_doc.external_url = doc.external_url_en
        if has_en_cover:
            en_doc.cover_image_id = doc.cover_image_en_id
        en_doc.save()


def forwards_news_blocks(apps, schema_editor):
    News = apps.get_model("cms", "News")
    for news in News.objects.all().iterator():
        es_html = (getattr(news, "content_es", None) or news.content or "").strip()
        en_html = (getattr(news, "content_en", None) or "").strip()
        blocks_es = [{"id": f"legacy-es-{news.pk}", "type": "paragraph", "html": es_html}] if es_html else []
        blocks_en = [{"id": f"legacy-en-{news.pk}", "type": "paragraph", "html": en_html}] if en_html else []
        News.objects.filter(pk=news.pk).update(
            content_blocks_es=blocks_es,
            content_blocks_en=blocks_en,
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("media_library", "0001_initial"),
        ("cms", "0007_document_localized_assets"),
    ]

    operations = [
        migrations.AddField(
            model_name="news",
            name="content_blocks_es",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="news",
            name="content_blocks_en",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(forwards_news_blocks, noop),
        migrations.AddField(
            model_name="document",
            name="language",
            field=models.CharField(
                choices=[("es", "Español"), ("en", "English")],
                db_index=True,
                default="es",
                max_length=5,
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="resource_key",
            field=models.SlugField(
                blank=True,
                default="",
                help_text="Stable key shared by ES/EN versions of the same resource.",
                max_length=255,
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="file",
            field=models.FileField(
                blank=True,
                upload_to="documents/%Y/%m/",
                validators=[
                    django.core.validators.FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)
                ],
            ),
        ),
        migrations.AddField(
            model_name="document",
            name="external_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="document",
            name="cover_image",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cover_documents",
                to="media_library.mediaasset",
            ),
        ),
        migrations.RunPython(forwards_document_language_rows, noop),
        migrations.RemoveField(model_name="document", name="file_es"),
        migrations.RemoveField(model_name="document", name="file_en"),
        migrations.RemoveField(model_name="document", name="external_url_es"),
        migrations.RemoveField(model_name="document", name="external_url_en"),
        migrations.RemoveField(model_name="document", name="cover_image_es"),
        migrations.RemoveField(model_name="document", name="cover_image_en"),
        migrations.AlterField(
            model_name="document",
            name="resource_key",
            field=models.SlugField(
                db_index=True,
                help_text="Stable key shared by ES/EN versions of the same resource.",
                max_length=255,
            ),
        ),
        migrations.AddConstraint(
            model_name="document",
            constraint=models.UniqueConstraint(
                fields=("resource_key", "language"),
                name="cms_document_unique_resource_language",
            ),
        ),
    ]
