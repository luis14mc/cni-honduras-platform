from django.conf import settings
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

    class Meta:
        abstract = True

    def publish(self) -> None:
        self.status = PublishStatus.PUBLISHED
        if not self.published_at:
            self.published_at = timezone.now()

    def unpublish(self) -> None:
        self.status = PublishStatus.DRAFT
        self.published_at = None


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

    def __str__(self) -> str:
        return self.title


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
    category = models.CharField(max_length=100, blank=True, db_index=True)

    class Meta:
        ordering = ["-published_at", "-updated_at", "-id"]
        verbose_name = "News"
        verbose_name_plural = "News"

    def __str__(self) -> str:
        return self.title


class Document(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    file = models.FileField(upload_to="documents/%Y/%m/")
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True, db_index=True)
    is_public = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self) -> str:
        return self.title

