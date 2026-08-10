import os
from urllib.parse import urlparse

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from apps.media_library.models import MediaAsset


def unique_slug_for_model(model, base_slug: str, exclude_pk=None) -> str:
    """Generate a unique slug for editorial models."""
    slug_base = (base_slug or "item")[:255]
    candidate = slug_base
    counter = 1
    while True:
        qs = model.all_objects.filter(slug=candidate)
        if exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        if not qs.exists():
            return candidate
        suffix = f"-{counter}"
        candidate = f"{slug_base[: 255 - len(suffix)]}{suffix}"
        counter += 1


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

    def save(self, *args, **kwargs):
        if not self.slug:
            title = (self.title_es or self.title or "").strip()
            if title:
                self.slug = unique_slug_for_model(News, slugify(title), self.pk)
        super().save(*args, **kwargs)


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
    file_es = models.FileField(
        upload_to="documents/%Y/%m/",
        blank=True,
        validators=[FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)],
    )
    file_en = models.FileField(
        upload_to="documents/%Y/%m/",
        blank=True,
        validators=[FileExtensionValidator(DOCUMENT_ALLOWED_EXTENSIONS)],
    )
    external_url_es = models.URLField(blank=True, default="")
    external_url_en = models.URLField(blank=True, default="")
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
    cover_image_es = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_es_documents",
    )
    cover_image_en = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_en_documents",
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

    def _has_uploaded_file(self, lang: str = "es") -> bool:
        field = self.file_es if lang == "es" else self.file_en
        return bool(field and getattr(field, "name", ""))

    def _has_external_url(self, lang: str = "es") -> bool:
        value = self.external_url_es if lang == "es" else self.external_url_en
        return bool(value and value.strip())

    def _has_en_content(self) -> bool:
        return bool((self.title_en or "").strip()) or bool((self.description_en or "").strip())

    def clean(self):
        super().clean()
        errors: dict[str, str] = {}

        for lang in ("es", "en"):
            has_file = self._has_uploaded_file(lang)
            has_external = self._has_external_url(lang)
            file_key = "file_es" if lang == "es" else "file_en"
            url_key = "external_url_es" if lang == "es" else "external_url_en"
            if has_file and has_external:
                errors[file_key] = (
                    "Seleccione un archivo subido o una URL externa, no ambos."
                )
                errors[url_key] = (
                    "Seleccione un archivo subido o una URL externa, no ambos."
                )

            if has_file:
                field = self.file_es if lang == "es" else self.file_en
                if hasattr(field, "size") and field.size and field.size > DOCUMENT_MAX_BYTES:
                    errors[file_key] = (
                        f"El archivo excede el límite de "
                        f"{DOCUMENT_MAX_BYTES // (1024 * 1024)} MB."
                    )

        if self.status == PublishStatus.PUBLISHED:
            if not self._has_uploaded_file("es") and not self._has_external_url("es"):
                errors["file_es"] = (
                    "Un documento publicado debe tener archivo o URL externa en español."
                )
            if self._has_en_content() and not self._has_uploaded_file("en") and not self._has_external_url("en"):
                errors["file_en"] = (
                    "Si hay contenido en inglés, debe proporcionar recurso EN (archivo o URL)."
                )

        if errors:
            raise ValidationError(errors)

    def _sync_file_metadata(self) -> None:
        if self._has_uploaded_file("es"):
            name = getattr(self.file_es, "name", "") or ""
            ext = os.path.splitext(name)[1].lstrip(".").lower()
            if ext:
                self.file_type = ext
            if hasattr(self.file_es, "size") and self.file_es.size:
                self.file_size_bytes = self.file_es.size
            return

        if self._has_external_url("es"):
            path = urlparse(self.external_url_es).path
            ext = os.path.splitext(path)[1].lstrip(".").lower()
            if ext in DOCUMENT_ALLOWED_EXTENSIONS:
                self.file_type = ext
            self.file_size_bytes = None
            return

        if self._has_uploaded_file("en"):
            name = getattr(self.file_en, "name", "") or ""
            ext = os.path.splitext(name)[1].lstrip(".").lower()
            if ext:
                self.file_type = ext
            if hasattr(self.file_en, "size") and self.file_en.size:
                self.file_size_bytes = self.file_en.size
            return

        if self._has_external_url("en"):
            path = urlparse(self.external_url_en).path
            ext = os.path.splitext(path)[1].lstrip(".").lower()
            if ext in DOCUMENT_ALLOWED_EXTENSIONS:
                self.file_type = ext
            self.file_size_bytes = None

    def save(self, *args, **kwargs):
        if not self.slug:
            title = (self.title_es or self.title or "").strip()
            if title:
                self.slug = unique_slug_for_model(Document, slugify(title), self.pk)
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
    link_url = models.CharField(max_length=500, blank=True, default="")
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
    mobile_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mobile_banners",
    )

    class Meta:
        ordering = ["-priority", "-published_at", "-id"]
        verbose_name = "Banner temporal"
        verbose_name_plural = "Banners temporales"

    def __str__(self) -> str:
        return self.title

    def _validate_link_url(self):
        url = (self.link_url or "").strip()
        if not url:
            return

        lowered = url.lower()
        for prefix in ("javascript:", "data:", "vbscript:", "file:"):
            if lowered.startswith(prefix):
                raise ValidationError({"link_url": "Esquema de URL no permitido."})

        if self.link_external:
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https") or not parsed.netloc:
                raise ValidationError(
                    {"link_url": "La URL externa debe ser absoluta y usar http o https."}
                )
            return

        if not url.startswith("/"):
            raise ValidationError({"link_url": "La ruta interna debe comenzar con /."})
        if url.startswith("//"):
            raise ValidationError({"link_url": "La ruta interna no puede comenzar con //."})
        if urlparse(url).scheme:
            raise ValidationError({"link_url": "La ruta interna no puede incluir un esquema de URL."})

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({"ends_at": "La fecha de fin debe ser posterior al inicio."})
        if self.cta_label and not self.link_url:
            raise ValidationError(
                {"cta_label": "Indique una URL de destino cuando el banner tiene etiqueta de CTA."}
            )
        self._validate_link_url()

    @classmethod
    def active_in_window(cls, queryset=None):
        """Visible when published and within optional start/end window."""
        now = timezone.now()
        qs = queryset if queryset is not None else cls.objects.published()
        return qs.filter(
            models.Q(starts_at__isnull=True) | models.Q(starts_at__lte=now),
            models.Q(ends_at__isnull=True) | models.Q(ends_at__gte=now),
        )
