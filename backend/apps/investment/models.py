from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Sector(TimeStampedModel):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    short_description = models.CharField(max_length=255, blank=True, default="")
    icon = models.CharField(max_length=100, blank=True, default="")
    image = models.FileField(upload_to="sectors/%Y/%m/", null=True, blank=True)
    color_hex = models.CharField(max_length=7, blank=True, default="")
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "name")
        verbose_name = "Sector"
        verbose_name_plural = "Sectores"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class OpportunityStatus(models.TextChoices):
    OPEN = "open", "Abierta"
    IN_PROGRESS = "in_progress", "En progreso"
    CLOSED = "closed", "Cerrada"


class InvestmentOpportunity(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=275, unique=True, db_index=True)
    summary = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")

    sector = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT,
        related_name="opportunities",
    )
    department = models.ForeignKey(
        "geo.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    region = models.ForeignKey(
        "geo.CNIRegion",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )

    estimated_investment = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True
    )
    estimated_jobs = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=16,
        choices=OpportunityStatus.choices,
        default=OpportunityStatus.OPEN,
        db_index=True,
    )
    is_public = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Oportunidad de inversión"
        verbose_name_plural = "Oportunidades de inversión"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ProjectStage(models.TextChoices):
    PROMOTION = "promotion", "Promoción"
    ANNOUNCED = "announced", "Anunciado"
    STARTUP = "startup", "Arranque"
    IMPLEMENTING = "implementing", "Implementando"
    STALLED = "stalled", "Parado"
    FINISHED = "finished", "Finalizado"
    CANCELLED = "cancelled", "Cancelado"


class InvestmentProject(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=275, unique=True, db_index=True)
    summary = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")

    sector = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    department = models.ForeignKey(
        "geo.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    region = models.ForeignKey(
        "geo.CNIRegion",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    municipality = models.ForeignKey(
        "geo.Municipality",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )

    investment_amount = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True
    )
    estimated_jobs = models.PositiveIntegerField(null=True, blank=True)
    project_stage = models.CharField(
        max_length=16,
        choices=ProjectStage.choices,
        default=ProjectStage.PROMOTION,
        db_index=True,
    )
    is_public = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Proyecto de inversión"
        verbose_name_plural = "Proyectos de inversión"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class SuccessStory(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=275, unique=True, db_index=True)
    company_name = models.CharField(max_length=200, blank=True, default="")
    sector = models.ForeignKey(
        Sector,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="success_stories",
    )
    summary = models.TextField(blank=True, default="")
    content = models.TextField(blank=True, default="")
    image = models.FileField(upload_to="success_stories/%Y/%m/", null=True, blank=True)
    country_origin = models.CharField(max_length=120, blank=True, default="")
    investment_amount = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True
    )
    jobs_generated = models.PositiveIntegerField(null=True, blank=True)
    is_public = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Caso de éxito"
        verbose_name_plural = "Casos de éxito"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
