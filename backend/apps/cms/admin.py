from django.contrib import admin
from django.utils import timezone

from .models import Document, News, Page, PublishStatus


class EditorialAdminMixin(admin.ModelAdmin):
    readonly_fields = ("created_at", "updated_at", "published_at", "created_by", "updated_by")
    list_filter = ("status", "published_at", "created_at", "updated_at")
    actions = ("make_published", "make_draft", "make_archived")

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
class PageAdmin(EditorialAdminMixin):
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
class NewsAdmin(EditorialAdminMixin):
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
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "is_public", "created_at", "updated_at")
    list_filter = ("is_public", "category", "created_at", "updated_at")
    search_fields = ("title", "slug", "description", "category")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("title", "slug", "file", "category", "is_public")}),
        ("Descripción", {"fields": ("description",)}),
        ("Auditoría", {"fields": ("created_at", "updated_at")}),
    )

