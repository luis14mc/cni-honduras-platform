from django.contrib import admin
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
    list_display = ("title", "category", "status", "is_featured", "published_at", "updated_at")
    list_filter = ("status", "category", "is_featured", "published_at")
    search_fields = ("title", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}

    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "status", "published_at", "is_featured")}),
        ("Contenido", {"fields": ("summary", "content")}),
        ("Imagen destacada", {"fields": ("featured_image",)}),
        ("Fuente", {"fields": ("author_name", "source", "external_url")}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )


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
        "updated_at",
    )
    list_filter = ("status", "category", "is_featured", "published_at")
    search_fields = ("title", "slug", "description", "category")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at", "file_type", "file_size_bytes")

    fieldsets = (
        (None, {"fields": ("title", "slug", "status", "published_at", "category", "is_featured", "order")}),
        ("Archivo", {"fields": ("file", "file_type", "file_size_bytes", "cover_image")}),
        ("Descripción", {"fields": ("description",)}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )


@admin.register(InstitutionalLink)
class InstitutionalLinkAdmin(TranslationAdmin):
    list_display = ("title", "section", "url", "order", "is_active", "updated_at")
    list_filter = ("section", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("title", "url", "description")
    ordering = ("section", "order")


@admin.register(SiteBanner)
class SiteBannerAdmin(EditorialAdminMixin, TranslationAdmin):
    list_display = ("title", "placement", "status", "priority", "starts_at", "ends_at", "updated_at")
    list_filter = ("status", "placement", "starts_at", "ends_at")
    search_fields = ("title", "body")

    fieldsets = (
        (None, {"fields": ("title", "placement", "status", "published_at", "priority")}),
        ("Contenido", {"fields": ("body", "cta_label", "image")}),
        ("Vigencia", {"fields": ("starts_at", "ends_at")}),
        ("Enlace", {"fields": ("link_url", "link_external")}),
        ("Presentación", {"fields": ("background_color", "text_color", "dismissible")}),
        ("Auditoría", {"fields": ("created_at", "updated_at", "created_by", "updated_by")}),
    )
