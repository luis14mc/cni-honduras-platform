from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class Department(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    code = models.CharField(max_length=32, blank=True, default="")
    description = models.TextField(blank=True, default="")

    geometry = models.MultiPolygonField(srid=4326)
    center_lat = models.FloatField(null=True, blank=True)
    center_lng = models.FloatField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Departamento"
        verbose_name_plural = "Departamentos"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class CNIRegion(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    color_hex = models.CharField(max_length=7, blank=True, default="")

    geometry = models.MultiPolygonField(srid=4326, null=True, blank=True)
    departments = models.ManyToManyField(
        Department,
        related_name="regions",
        blank=True,
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Región CNI"
        verbose_name_plural = "Regiones CNI"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Municipality(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="municipalities",
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, db_index=True)
    code = models.CharField(max_length=32, blank=True, default="")
    description = models.TextField(blank=True, default="")

    geometry = models.MultiPolygonField(srid=4326, null=True, blank=True)
    center_lat = models.FloatField(null=True, blank=True)
    center_lng = models.FloatField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Municipio"
        verbose_name_plural = "Municipios"
        constraints = [
            models.UniqueConstraint(
                fields=("department", "slug"),
                name="unique_municipality_slug_per_department",
            )
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class StrategicInfrastructure(models.Model):
    class InfrastructureType(models.TextChoices):
        PORT = "port", "Puerto"
        AIRPORT = "airport", "Aeropuerto"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    infrastructure_type = models.CharField(max_length=16, choices=InfrastructureType.choices)
    location = models.PointField(srid=4326)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        related_name="strategic_infrastructure",
        null=True,
        blank=True,
    )
    municipality = models.ForeignKey(
        Municipality,
        on_delete=models.SET_NULL,
        related_name="strategic_infrastructure",
        null=True,
        blank=True,
    )
    description = models.TextField(blank=True, default="")
    operator = models.CharField(max_length=200, blank=True, default="")
    status = models.CharField(max_length=120, blank=True, default="")
    source_name = models.CharField(max_length=200)
    source_url = models.URLField(max_length=500)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Infraestructura estratégica"
        verbose_name_plural = "Infraestructura estratégica"

    def __str__(self) -> str:
        return self.name

    def clean(self):
        super().clean()
        errors = {}
        if self.location and self.location.geom_type != "Point":
            errors["location"] = "La ubicación debe ser un punto."
        if self.municipality_id and not self.department_id:
            errors["department"] = "Se requiere departamento cuando se selecciona un municipio."
        elif self.municipality_id and self.municipality.department_id != self.department_id:
            errors["municipality"] = "El municipio debe pertenecer al departamento seleccionado."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
