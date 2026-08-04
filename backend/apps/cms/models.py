import os
from urllib.parse import urlparse

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone

from apps.media_library.models import MediaAsset


class PublishStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PublishedQuerySet(models.QuerySet):
    def published(self):
        now = timezone.now()
        return self.filter(
            status=PublishStatus.PUBLISHED,
            published_at__isnull=False,
            published_at__lte=now,
        )


class PublishedManager(models.Manager):
    def get_queryset(self):
        return PublishedQuerySet(self.model, using=self._db)

    def published(self):
        return self.get_queryset().published()


class EditorialModel(TimeStampedModel):
    status = models.CharField(
        max_length=16,
        choices=PublishStatus.choices,
        default=PublishStatus.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)ss",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)ss",
    )

    objects = PublishedManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def publish(self) -> None:
        self.status = PublishStatus.PUBLISHED
        if not self.published_at:
            self.published_at = timezone.now()
        self.save(update_fields=["status", "published_at", "updated_at"])

    def unpublish(self) -> None:
        self.status = PublishStatus.DRAFT
        self.published_at = None
        self.save(update_fields=["status", "published_at", "updated_at"])


class Page(EditorialModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField(blank=True)
    excerpt = models.TextField(blank=True)
    featured_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="featured_in_pages",
    )
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        ordering = ["-published_at", "-updated_at", "-id"]
        verbose_name = "Page"
        verbose_name_plural = "Pages"
        permissions = [("can_publish", "Puede publicar contenido")]

    def __str__(self) -> str:
        return self.title


class NewsCategory(models.TextChoices):
    NEWS = "news", "Noticia"
    PRESS_RELEASE = "press_release", "Comunicado"
    EVENT = "event", "Evento"
    ANNOUNCEMENT = "announcement", "Anuncio"
    ARTICLE = "article", "Artículo"


class News(EditorialModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    featured_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="featured_in_news",
    )
    category = models.CharField(
        max_length=32,
        choices=NewsCategory.choices,
        default=NewsCategory.NEWS,
        db_index=True,
    )
    author_name = models.CharField(max_length=150, blank=True, default="")
    source = models.CharField(max_length=150, blank=True, default="CNI")
    external_url = models.URLField(blank=True, default="")
    is_featured = models.BooleanField(default=False, db_index=True)
    seo_title = models.CharField(max_length=255, blank=True, default="")
    seo_description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-published_at", "-updated_at", "-id"]
        verbose_name = "News"
        verbose_name_plural = "News"

    def __str__(self) -> str:
        return self.title


class DocumentCategory(models.TextChoices):
    INSTITUCIONAL = "institucional", "Institucional"
    TECNICOS = "tecnicos", "Técnicos"
    BIBLIOTECA = "biblioteca", "Biblioteca"
    ESTUDIOS = "estudios", "Estudios"


DOCUMENT_ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx", "pptx", "zip"]
DOCUMENT_MAX_BYTES = 25 * 1024 * 1024  # 25 MB


class Document(EditorialModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    file = models.FileField(
        upload_to="documents/%Y/%m/",
        blank=True,
        validators=[FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)],
    )
    external_url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=32,
        choices=DocumentCategory.choices,
        default=DocumentCategory.BIBLIOTECA,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)
    document_date = models.DateField(null=True, blank=True)
    cover_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_for_documents",
    )
    file_type = models.CharField(max_length=16, blank=True, default="")
    file_size_bytes = models.PositiveIntegerField(null=True, blank=True)
    seo_title = models.CharField(max_length=255, blank=True, default="")
    seo_description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["order", "-published_at", "-created_at", "-id"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self) -> str:
        return self.title

    def _has_uploaded_file(self) -> bool:
        return bool(self.file and getattr(self.file, "name", ""))

    def _has_external_url(self) -> bool:
        return bool(self.external_url and self.external_url.strip())

    def clean(self):
        super().clean()
        has_file = self._has_uploaded_file()
        has_external = self._has_external_url()

        if has_file and has_external:
            raise ValidationError(
                "Seleccione un archivo subido o una URL externa, no ambos."
            )

        if self.status == PublishStatus.PUBLISHED and not has_file and not has_external:
            raise ValidationError(
                "Un documento publicado debe tener un archivo o una URL externa."
            )

        if has_file and hasattr(self.file, "size") and self.file.size:
            if self.file.size > DOCUMENT_MAX_BYTES:
                raise ValidationError(
                    {
                        "file": (
                            f"El archivo excede el límite de "
                            f"{DOCUMENT_MAX_BYTES // (1024 * 1024)} MB."
                        )
                    }
                )

    def _sync_file_metadata(self) -> None:
        if self._has_uploaded_file():
            name = getattr(self.file, "name", "") or ""
            ext = os.path.splitext(name)[1].lstrip(".").lower()
            if ext:
                self.file_type = ext
            if hasattr(self.file, "size") and self.file.size:
                self.file_size_bytes = self.file.size
            return

        if self._has_external_url():
            path = urlparse(self.external_url).path
            ext = os.path.splitext(path)[1].lstrip(".").lower()
            if ext in DOCUMENT_ALLOWED_EXTENSIONS:
                self.file_type = ext
            self.file_size_bytes = None

    def save(self, *args, **kwargs):
        self._sync_file_metadata()
        super().save(*args, **kwargs)


class LinkSection(models.TextChoices):
    HOME_INTEREST = "home_interest", "Home — Enlaces de interés"
    FOOTER_EXTERNAL = "footer_external", "Footer — Externos"
    TRAMITES = "tramites", "Trámites en línea"
    TOP_BAR = "top_bar", "Barra superior"


class InstitutionalLink(TimeStampedModel):
    section = models.CharField(max_length=32, choices=LinkSection.choices, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    url = models.URLField(max_length=500)
    is_external = models.BooleanField(default=True)
    icon = models.CharField(max_length=100, blank=True, default="")
    accent_color = models.CharField(max_length=7, blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["section", "order", "id"]
        verbose_name = "Enlace institucional"
        verbose_name_plural = "Enlaces institucionales"

    def __str__(self) -> str:
        return f"{self.get_section_display()}: {self.title}"


class BannerPlacement(models.TextChoices):
    SITE_TOP = "site_top", "Barra superior global"
    HOME_HERO = "home_hero", "Hero del home"
    FOOTER = "footer", "Footer"


class SiteBanner(EditorialModel):
    placement = models.CharField(max_length=32, choices=BannerPlacement.choices, db_index=True)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    cta_label = models.CharField(max_length=120, blank=True, default="")
    starts_at = models.DateTimeField(null=True, blank=True, db_index=True)
    ends_at = models.DateTimeField(null=True, blank=True, db_index=True)
    priority = models.PositiveIntegerField(default=0, db_index=True)
    link_url = models.URLField(blank=True, default="")
    link_external = models.BooleanField(default=False)
    dismissible = models.BooleanField(default=True)
    background_color = models.CharField(max_length=7, blank=True, default="")
    text_color = models.CharField(max_length=7, blank=True, default="")
    image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="banners",
    )

    class Meta:
        ordering = ["-priority", "-published_at", "-id"]
        verbose_name = "Banner temporal"
        verbose_name_plural = "Banners temporales"

    def __str__(self) -> str:
        return self.title

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({"ends_at": "La fecha de fin debe ser posterior al inicio."})

    @classmethod
    def active_in_window(cls, queryset=None):
        """Visible when published and within optional start/end window."""
        now = timezone.now()
        qs = queryset if queryset is not None else cls.objects.published()
        return qs.filter(
            models.Q(starts_at__isnull=True) | models.Q(starts_at__lte=now),
            models.Q(ends_at__isnull=True) | models.Q(ends_at__gte=now),
        )
