from django.conf import settings
from django.db import models


class MediaType(models.TextChoices):
    IMAGE = "image", "Image"
    VIDEO = "video", "Video"
    FILE = "file", "File"


class MediaAsset(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="media_assets/%Y/%m/")
    alt_text = models.CharField(max_length=255, blank=True)
    caption = models.TextField(blank=True)
    media_type = models.CharField(
        max_length=16,
        choices=MediaType.choices,
        default=MediaType.FILE,
        db_index=True,
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_media_assets",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "Media asset"
        verbose_name_plural = "Media assets"

    def __str__(self) -> str:
        return self.title

