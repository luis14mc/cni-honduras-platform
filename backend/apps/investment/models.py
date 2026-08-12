from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify

from apps.cms.models import EditorialModel, PublishStatus
from apps.media_library.models import MediaAsset


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
    """Lifecycle of the deal (independent from editorial publish status)."""

    OPEN = "open", "Abierta"
    IN_PROGRESS = "in_progress", "En progreso"
    CLOSED = "closed", "Cerrada"


class InvestmentOpportunity(EditorialModel):
    """
    Bilingual investment opportunity (one row, modeltranslation ES/EN).

    Dynamic metrics and CAPEX rows live in related models — do not add
    rigid columns for IRR/EBITDA/jobs that vary per opportunity card.
    """

    code = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Opportunity card code, e.g. OC-CNI-T002",
    )
    title = models.CharField(max_length=255, blank=True, default="")
    slug = models.SlugField(max_length=275, unique=True, db_index=True)
    summary = models.TextField(blank=True, default="")
    description = models.TextField(
        blank=True,
        default="",
        help_text="Opportunity description (ficha: descripción de la oportunidad).",
    )
    target_customer = models.TextField(blank=True, default="")
    market_demand = models.TextField(blank=True, default="")
    value_proposition = models.TextField(blank=True, default="")

    sector = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT,
        related_name="opportunities",
        null=True,
        blank=True,
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

    # Legacy rigid metrics — kept nullable for map/portafolio consumers.
    # Prefer OpportunityMetric for new editorial content.
    estimated_investment = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True
    )
    estimated_jobs = models.PositiveIntegerField(null=True, blank=True)
    lifecycle_status = models.CharField(
        max_length=16,
        choices=OpportunityStatus.choices,
        default=OpportunityStatus.OPEN,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "-is_featured", "-published_at", "-created_at", "-id")
        verbose_name = "Oportunidad de inversión"
        verbose_name_plural = "Oportunidades de inversión"

    def __str__(self) -> str:
        code = f" [{self.code}]" if self.code else ""
        return f"{self.title or self.slug}{code}"

    @property
    def is_public(self) -> bool:
        """Backward-compatible alias for consumers expecting is_public."""
        return self.status == PublishStatus.PUBLISHED and self.published_at is not None

    def clean(self):
        super().clean()
        errors: dict[str, str] = {}
        if self.estimated_investment is not None and self.estimated_investment < Decimal("0"):
            errors["estimated_investment"] = "La inversión estimada no puede ser negativa."
        if self.estimated_jobs is not None and self.estimated_jobs < 0:
            errors["estimated_jobs"] = "Los empleos estimados no pueden ser negativos."

        if self.status == PublishStatus.PUBLISHED:
            title_es = (getattr(self, "title_es", None) or self.title or "").strip()
            description_es = (
                getattr(self, "description_es", None) or self.description or ""
            ).strip()
            if not (self.code or "").strip():
                errors["code"] = "El código es obligatorio para publicar."
            if self.sector_id is None:
                errors["sector"] = "El sector es obligatorio para publicar."
            if not title_es:
                errors["title"] = "El título en español es obligatorio para publicar."
            if not description_es:
                errors["description"] = (
                    "La descripción de la oportunidad en español es obligatoria para publicar."
                )
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title or self.code or "oportunidad")
            from apps.cms.models import unique_slug_for_model

            self.slug = unique_slug_for_model(InvestmentOpportunity, base, self.pk)
        super().save(*args, **kwargs)


class OpportunityMetric(models.Model):
    """Dynamic key metric row for an opportunity card (not rigid columns)."""

    opportunity = models.ForeignKey(
        InvestmentOpportunity,
        on_delete=models.CASCADE,
        related_name="metrics",
    )
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=255, blank=True, default="")
    note = models.CharField(max_length=255, blank=True, default="")
    icon = models.CharField(max_length=64, blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        verbose_name = "Métrica de oportunidad"
        verbose_name_plural = "Métricas de oportunidad"

    def __str__(self) -> str:
        return f"{self.label}: {self.value}"


class OpportunityFundUse(models.Model):
    """CAPEX / use-of-funds row for an opportunity card."""

    opportunity = models.ForeignKey(
        InvestmentOpportunity,
        on_delete=models.CASCADE,
        related_name="fund_uses",
    )
    component = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        verbose_name = "Uso de fondos"
        verbose_name_plural = "Usos de fondos"

    def __str__(self) -> str:
        return self.component

    def clean(self):
        super().clean()
        if self.amount is not None and self.amount < Decimal("0"):
            raise ValidationError({"amount": "El monto no puede ser negativo."})


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


class SuccessStory(EditorialModel):
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
    logo = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="success_story_logos",
    )
    featured_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="success_story_featured_images",
    )
    person_photo = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="success_story_person_photos",
    )
    person_name = models.CharField(max_length=200, blank=True, default="")
    person_role = models.CharField(max_length=200, blank=True, default="")
    country_origin = models.CharField(max_length=120, blank=True, default="")
    investment_amount = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True
    )
    jobs_generated = models.PositiveIntegerField(null=True, blank=True)
    testimonial_quote = models.TextField(blank=True, default="")
    testimonial_author = models.CharField(max_length=200, blank=True, default="")
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "-is_featured", "-published_at", "-created_at", "-id")
        verbose_name = "Caso de éxito"
        verbose_name_plural = "Casos de éxito"

    def __str__(self) -> str:
        return self.title

    def clean(self):
        super().clean()
        if self.status == PublishStatus.PUBLISHED:
            if not (self.title or "").strip():
                raise ValidationError({"title": "El título es obligatorio para publicar."})
            if not (self.summary or "").strip() and not (self.content or "").strip():
                raise ValidationError(
                    {"content": "Indique un resumen o contenido mínimo para publicar."}
                )
        if self.investment_amount is not None and self.investment_amount < Decimal("0"):
            raise ValidationError({"investment_amount": "La inversión no puede ser negativa."})
        if self.jobs_generated is not None and self.jobs_generated < 0:
            raise ValidationError({"jobs_generated": "Los empleos generados no pueden ser negativos."})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
