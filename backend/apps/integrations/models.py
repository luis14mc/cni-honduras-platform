from django.db import models


WEBHOOK_SOURCE_WEBSITE = "website"
WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED = "project_application.created"
WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED = "contact_submission.created"
WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED = "advisory_request.created"
WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED = "resource_download.created"

# Eventos que se entregan a cni-crm (POST /api/intake/events/).
CRM_EVENT_TYPES = (
    WEBHOOK_EVENT_PROJECT_APPLICATION_CREATED,
    WEBHOOK_EVENT_CONTACT_SUBMISSION_CREATED,
    WEBHOOK_EVENT_ADVISORY_REQUEST_CREATED,
    WEBHOOK_EVENT_RESOURCE_DOWNLOAD_CREATED,
)


class WebhookEvent(models.Model):
    source = models.CharField(max_length=120, db_index=True, verbose_name="Origen")
    event_type = models.CharField(max_length=150, db_index=True, verbose_name="Tipo de evento")
    payload = models.JSONField(default=dict, blank=True, verbose_name="Payload")
    processed = models.BooleanField(default=False, db_index=True, verbose_name="Procesado")
    error_message = models.TextField(blank=True, default="", verbose_name="Mensaje de error")
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Procesado en")
    attempts = models.PositiveIntegerField(default=0, verbose_name="Intentos de envío")
    next_attempt_at = models.DateTimeField(
        null=True, blank=True, db_index=True, verbose_name="Próximo intento"
    )
    failed_permanently = models.BooleanField(
        default=False, db_index=True, verbose_name="Fallo definitivo"
    )

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Evento de webhook"
        verbose_name_plural = "Eventos de webhook"

    def __str__(self) -> str:
        return f"{self.source}:{self.event_type} ({self.pk})"
