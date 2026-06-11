from django.db import models


class SubmissionStatus(models.TextChoices):
    NEW = "new", "Nuevo"
    IN_REVIEW = "in_review", "En revisión"
    CONTACTED = "contacted", "Contactado"
    CLOSED = "closed", "Cerrado"
    SPAM = "spam", "Spam"


class BaseSubmission(models.Model):
    full_name = models.CharField(max_length=200, verbose_name="Nombre completo")
    email = models.EmailField(verbose_name="Correo electrónico")
    phone = models.CharField(max_length=50, blank=True, default="", verbose_name="Teléfono")
    company = models.CharField(max_length=200, blank=True, default="", verbose_name="Empresa")
    country = models.CharField(max_length=120, blank=True, default="", verbose_name="País")

    source = models.CharField(max_length=120, blank=True, default="", db_index=True, verbose_name="Origen")
    status = models.CharField(
        max_length=16,
        choices=SubmissionStatus.choices,
        default=SubmissionStatus.NEW,
        db_index=True,
        verbose_name="Estado",
    )

    crm_synced = models.BooleanField(default=False, db_index=True, verbose_name="Sincronizado con CRM")
    crm_record_id = models.CharField(
        max_length=120, blank=True, default="", verbose_name="ID en CRM"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("-created_at", "-id")

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}>"


class ContactSubmission(BaseSubmission):
    message = models.TextField(blank=True, default="", verbose_name="Mensaje")

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Mensaje de contacto"
        verbose_name_plural = "Mensajes de contacto"


class ProjectApplication(BaseSubmission):
    project_name = models.CharField(
        max_length=255, blank=True, default="", verbose_name="Nombre del proyecto"
    )
    details = models.TextField(blank=True, default="", verbose_name="Detalles del proyecto")
    message = models.TextField(blank=True, default="", verbose_name="Mensaje adicional")
    sector = models.CharField(max_length=150, blank=True, default="", verbose_name="Sector")
    department = models.CharField(max_length=150, blank=True, default="", verbose_name="Departamento")
    project_location = models.CharField(
        max_length=255, blank=True, default="", verbose_name="Ubicación del proyecto"
    )
    investment_range = models.CharField(
        max_length=150, blank=True, default="", verbose_name="Rango de inversión"
    )
    estimated_investment = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True, verbose_name="Inversión estimada"
    )
    expected_jobs = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Empleos esperados"
    )
    consent = models.BooleanField(default=False, verbose_name="Consentimiento de contacto")

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Postulación de proyecto"
        verbose_name_plural = "Postulaciones de proyectos"


class AdvisoryRequest(BaseSubmission):
    message = models.TextField(blank=True, default="", verbose_name="Mensaje")
    advisory_type = models.CharField(
        max_length=150, blank=True, default="", verbose_name="Tipo de asesoría"
    )
    sector = models.CharField(max_length=150, blank=True, default="", verbose_name="Sector")

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Solicitud de asesoría"
        verbose_name_plural = "Solicitudes de asesoría"


class ResourceDownloadLead(BaseSubmission):
    resource_name = models.CharField(
        max_length=255, blank=True, default="", verbose_name="Recurso solicitado"
    )
    details = models.TextField(blank=True, default="", verbose_name="Detalles")

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Lead de descarga de recurso"
        verbose_name_plural = "Leads de descarga de recursos"
