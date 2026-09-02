import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class SubmissionStatus(models.TextChoices):
    NEW = "new", "Nuevo"
    IN_REVIEW = "in_review", "En revisión"
    CONTACTED = "contacted", "Contactado"
    CLOSED = "closed", "Cerrado"
    SPAM = "spam", "Spam"


class ProjectApplicationStatus(models.TextChoices):
    NEW = "new", "Nuevo"
    REVIEWING = "reviewing", "En revisión"
    CONTACTED = "contacted", "Contactado"
    QUALIFIED = "qualified", "Calificado"
    REJECTED = "rejected", "Rechazado"
    CONVERTED = "converted", "Convertido"


class InvestmentRange(models.TextChoices):
    UNDER_10M = "under_10m", "Menos de USD 10 millones"
    FROM_10M_TO_50M = "10m_50m", "USD 10 a 50 millones"
    FROM_50M_TO_100M = "50m_100m", "USD 50 a 100 millones"
    OVER_100M = "over_100m", "Más de USD 100 millones"


def generate_project_reference() -> str:
    return f"CNI-PROJ-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"


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
    reference_code = models.CharField(
        max_length=23,
        unique=True,
        db_index=True,
        editable=False,
        default=generate_project_reference,
        verbose_name="Código de referencia",
    )
    website = models.URLField(blank=True, default="", verbose_name="Sitio web")
    sector_ref = models.ForeignKey(
        "investment.Sector",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="project_submissions",
        verbose_name="Sector canónico",
    )
    department_ref = models.ForeignKey(
        "geo.Department",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="project_submissions",
        verbose_name="Departamento canónico",
    )
    municipality = models.ForeignKey(
        "geo.Municipality",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="project_submissions",
        verbose_name="Municipio",
    )
    status = models.CharField(
        max_length=16,
        choices=ProjectApplicationStatus.choices,
        default=ProjectApplicationStatus.NEW,
        db_index=True,
        verbose_name="Estado",
    )
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
        max_length=20,
        choices=InvestmentRange.choices,
        blank=True,
        default="",
        verbose_name="Rango de inversión",
    )
    estimated_investment = models.DecimalField(
        max_digits=18, decimal_places=2, null=True, blank=True, verbose_name="Inversión estimada"
    )
    expected_jobs = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Empleos esperados"
    )
    consent = models.BooleanField(default=False, verbose_name="Consentimiento de contacto")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_project_applications",
        verbose_name="Responsable interno",
    )

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Postulación de proyecto"
        verbose_name_plural = "Postulaciones de proyectos"


class ProjectApplicationHistoryEventType(models.TextChoices):
    STATUS_CHANGED = "status_changed", "Cambio de estado"
    ASSIGNED = "assigned", "Asignado"
    REASSIGNED = "reassigned", "Reasignado"
    UNASSIGNED = "unassigned", "Sin asignar"
    NOTE_ADDED = "note_added", "Nota agregada"


class ProjectApplicationNote(models.Model):
    application = models.ForeignKey(
        ProjectApplication,
        on_delete=models.CASCADE,
        related_name="notes",
        verbose_name="Postulación",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="project_application_notes",
        verbose_name="Autor",
    )
    body = models.TextField(max_length=5000, verbose_name="Contenido")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Nota interna de postulación"
        verbose_name_plural = "Notas internas de postulaciones"

    def __str__(self) -> str:
        return f"Nota #{self.pk} — {self.application.reference_code}"


class ProjectApplicationHistory(models.Model):
    application = models.ForeignKey(
        ProjectApplication,
        on_delete=models.CASCADE,
        related_name="history_entries",
        verbose_name="Postulación",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_application_history_actions",
        verbose_name="Actor",
    )
    event_type = models.CharField(
        max_length=32,
        choices=ProjectApplicationHistoryEventType.choices,
        db_index=True,
        verbose_name="Tipo de evento",
    )
    from_status = models.CharField(max_length=16, blank=True, default="", verbose_name="Estado anterior")
    to_status = models.CharField(max_length=16, blank=True, default="", verbose_name="Estado nuevo")
    from_assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        verbose_name="Responsable anterior",
    )
    to_assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        verbose_name="Responsable nuevo",
    )
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadatos")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Historial de postulación"
        verbose_name_plural = "Historial de postulaciones"

    def __str__(self) -> str:
        return f"{self.application.reference_code} — {self.event_type}"


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
    document = models.ForeignKey(
        "cms.Document",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="download_leads",
        verbose_name="Documento",
    )
    details = models.TextField(blank=True, default="", verbose_name="Detalles")

    class Meta(BaseSubmission.Meta):
        abstract = False
        verbose_name = "Lead de descarga de recurso"
        verbose_name_plural = "Leads de descarga de recursos"
