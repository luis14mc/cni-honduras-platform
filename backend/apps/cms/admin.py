from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django.utils import timezone
from modeltranslation.admin import TranslationAdmin

from .models import (
    Document,
    InstitutionalLink,
    News,
    Page,
    PublishStatus,
    SiteBanner,
)


class EditorialAdminMixin(admin.ModelAdmin):
    readonly_fields = ("created_at", "updated_at", "published_at", "created_by", "updated_by")
    list_filter = ("status", "published_at", "created_at", "updated_at")
    actions = ("make_published", "make_draft", "make_archived")

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if not request.user.has_perm("cms.can_publish"):
            fields.append("status")
        return fields

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.has_perm("cms.can_publish"):
            for key in ("make_published", "make_draft", "make_archived"):
                actions.pop(key, None)
        return actions

    @admin.action(description="Publicar seleccionados")
    def make_published(self, request, queryset):
        now = timezone.now()
        queryset.update(
            status=PublishStatus.PUBLISHED,
            published_at=now,
            updated_at=now,
            updated_by=request.user,
        )

    @admin.action(description="Marcar como borrador (despublicar)")
    def make_draft(self, request, queryset):
        now = timezone.now()
        queryset.update(
            status=PublishStatus.DRAFT,
            published_at=None,
            updated_at=now,
            updated_by=request.user,
        )

    @admin.action(description="Archivar seleccionados")
    def make_archived(self, request, queryset):
        now = timezone.now()
        queryset.update(status=PublishStatus.ARCHIVED, updated_at=now, updated_by=request.user)

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        if obj.status == PublishStatus.PUBLISHED and not obj.published_at:
            obj.published_at = timezone.now()
        super().save_model(request, obj, form, change)


@admin.register(Page)
class PageAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = ("id", "title", "slug", "status", "published_at", "updated_at")
    search_fields = ("title", "slug", "excerpt", "content", "seo_title", "seo_description")
    prepopulated_fields = {"slug": ("title",)}

    fieldsets = (
        (None, {"fields": ("title", "slug", "status", "published_at")}),
        ("Contenido", {"fields": ("excerpt", "content")}),
        ("Imagen destacada", {"fields": ("featured_image",)}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )


@admin.register(News)
class NewsAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = (
        "title",
        "category",
        "status",
        "is_featured",
        "published_at",
        "featured_image_preview",
        "updated_at",
    )
    list_filter = ("status", "category", "is_featured", "published_at")
    search_fields = (
        "title",
        "slug",
        "summary",
        "content",
        "author_name",
        "seo_title",
        "seo_description",
    )
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = EditorialAdminMixin.readonly_fields + ("featured_image_preview",)

    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "status", "published_at", "is_featured")}),
        ("Contenido", {"fields": ("summary", "content")}),
        ("Imagen destacada", {"fields": ("featured_image", "featured_image_preview")}),
        ("Fuente", {"fields": ("author_name", "source", "external_url")}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )

    @admin.display(description="Vista previa")
    def featured_image_preview(self, obj):
        if obj.featured_image_id and obj.featured_image.file:
            return format_html(
                '<img src="{}" alt="" style="max-height:120px;max-width:240px;border-radius:4px;" />',
                obj.featured_image.file.url,
            )
        return "—"


@admin.register(Document)
class DocumentAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "status",
        "is_featured",
        "order",
        "published_at",
        "cover_image_preview",
        "updated_at",
    )
    list_filter = ("status", "category", "is_featured", "published_at")
    search_fields = ("title", "slug", "description", "seo_title", "seo_description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = (
        "created_at",
        "updated_at",
        "published_at",
        "created_by",
        "updated_by",
        "file_type",
        "file_size_bytes",
        "cover_image_preview",
        "file_link",
    )

    fieldsets = (
        (None, {"fields": ("title", "slug", "status", "published_at", "category", "is_featured", "order", "document_date")}),
        ("Archivo ES", {"fields": ("file_es", "external_url_es", "file_type", "file_size_bytes", "file_link")}),
        ("Archivo EN", {"fields": ("file_en", "external_url_en")}),
        ("Portada", {"fields": ("cover_image_es", "cover_image_en", "cover_image_preview")}),
        ("Descripción", {"fields": ("description",)}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )

    @admin.display(description="Vista previa")
    def cover_image_preview(self, obj):
        if obj.cover_image_es_id and obj.cover_image_es.file:
            return format_html(
                '<img src="{}" alt="" style="max-height:120px;max-width:240px;border-radius:4px;" />',
                obj.cover_image_es.file.url,
            )
        return "—"

    @admin.display(description="Enlace")
    def file_link(self, obj):
        if obj.file_es:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">Abrir archivo ES</a>',
                obj.file_es.url,
            )
        if obj.external_url_es:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">Abrir URL externa ES</a>',
                obj.external_url_es,
            )
        return "—"

    @admin.action(description="Publicar seleccionados")
    def make_published(self, request, queryset):
        now = timezone.now()
        published_count = 0
        failed_titles: list[str] = []

        for doc in queryset:
            doc.status = PublishStatus.PUBLISHED
            if not doc.published_at:
                doc.published_at = now
            doc.updated_at = now
            doc.updated_by = request.user
            try:
                doc.full_clean()
                doc.save()
                published_count += 1
            except ValidationError:
                failed_titles.append(doc.title)

        if published_count:
            self.message_user(
                request,
                f"{published_count} documento(s) publicado(s) correctamente.",
                level=messages.SUCCESS,
            )
        if failed_titles:
            preview = ", ".join(failed_titles[:5])
            extra = f" y {len(failed_titles) - 5} más" if len(failed_titles) > 5 else ""
            self.message_user(
                request,
                (
                    f"{len(failed_titles)} documento(s) no se publicaron porque no cumplen "
                    f"las validaciones (requieren archivo o URL externa, no ambos): "
                    f"{preview}{extra}."
                ),
                level=messages.WARNING,
            )


@admin.register(InstitutionalLink)
class InstitutionalLinkAdmin(TranslationAdmin):
    list_display = ("title", "section", "icon", "url", "is_external", "order", "is_active", "updated_at")
    list_filter = ("section", "is_active", "is_external")
    list_editable = ("order", "is_active")
    search_fields = ("title", "icon", "url", "description")
    ordering = ("section", "order")
    fieldsets = (
        (None, {"fields": ("section", "icon", "url", "is_external", "order", "is_active")}),
        ("Presentación", {"fields": ("accent_color",)}),
        ("Textos visibles", {"fields": ("title", "description")}),
    )


@admin.register(SiteBanner)
class SiteBannerAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = (
        "title",
        "placement",
        "status",
        "priority",
        "window_status",
        "image_preview",
        "starts_at",
        "ends_at",
        "updated_at",
    )
    list_filter = ("status", "placement", "starts_at", "ends_at")
    search_fields = ("title", "body", "cta_label")
    readonly_fields = EditorialAdminMixin.readonly_fields + (
        "image_preview",
        "mobile_image_preview",
        "window_status",
    )

    fieldsets = (
        (None, {"fields": ("title", "placement", "status", "published_at", "priority")}),
        (
            "Contenido",
            {"fields": ("body", "cta_label", "image", "image_preview", "mobile_image", "mobile_image_preview")},
        ),
        ("Vigencia", {"fields": ("starts_at", "ends_at", "window_status")}),
        ("Enlace", {"fields": ("link_url", "link_external")}),
        ("Presentación", {"fields": ("background_color", "text_color", "dismissible")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )

    @admin.display(description="Vista previa")
    def image_preview(self, obj):
        if obj.image_id and obj.image.file:
            return format_html(
                '<img src="{}" alt="" style="max-height:120px;max-width:240px;border-radius:4px;" />',
                obj.image.file.url,
            )
        return "—"

    @admin.display(description="Vista previa móvil")
    def mobile_image_preview(self, obj):
        if obj.mobile_image_id and obj.mobile_image.file:
            return format_html(
                '<img src="{}" alt="" style="max-height:120px;max-width:120px;border-radius:4px;" />',
                obj.mobile_image.file.url,
            )
        return "—"

    @admin.display(description="Vigencia")
    def window_status(self, obj):
        if obj.pk is None:
            return "—"
        now = timezone.now()
        if obj.status != PublishStatus.PUBLISHED:
            return "No publicado"
        if obj.starts_at and obj.starts_at > now:
            return "Programado"
        if obj.ends_at and obj.ends_at < now:
            return "Vencido"
        return "Activo"

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        obj.updated_by = request.user
        if obj.status == PublishStatus.PUBLISHED and not obj.published_at:
            obj.published_at = timezone.now()
        obj.full_clean()
        super(EditorialAdminMixin, self).save_model(request, obj, form, change)

    @admin.action(description="Publicar seleccionados")
    def make_published(self, request, queryset):
        now = timezone.now()
        published_count = 0
        failed_titles: list[str] = []

        for banner in queryset:
            banner.status = PublishStatus.PUBLISHED
            if not banner.published_at:
                banner.published_at = now
            banner.updated_at = now
            banner.updated_by = request.user
            try:
                banner.full_clean()
                banner.save()
                published_count += 1
            except ValidationError:
                failed_titles.append(banner.title)

        if published_count:
            self.message_user(
                request,
                f"{published_count} banner(s) publicado(s) correctamente.",
                level=messages.SUCCESS,
            )
        if failed_titles:
            preview = ", ".join(failed_titles[:5])
            extra = f" y {len(failed_titles) - 5} más" if len(failed_titles) > 5 else ""
            self.message_user(
                request,
                f"{len(failed_titles)} banner(s) no se publicaron por validaciones: {preview}{extra}.",
                level=messages.WARNING,
            )
