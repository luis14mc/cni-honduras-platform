from django.db import models


class WebhookEvent(models.Model):
    source = models.CharField(max_length=120, db_index=True, verbose_name="Origen")
    event_type = models.CharField(max_length=150, db_index=True, verbose_name="Tipo de evento")
    payload = models.JSONField(default=dict, blank=True, verbose_name="Payload")
    processed = models.BooleanField(default=False, db_index=True, verbose_name="Procesado")
    error_message = models.TextField(blank=True, default="", verbose_name="Mensaje de error")
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Procesado en")

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Evento de webhook"
        verbose_name_plural = "Eventos de webhook"

    def __str__(self) -> str:
        return f"{self.source}:{self.event_type} ({self.pk})"


class SuiteCRMIntegrationLog(models.Model):
    related_model = models.CharField(
        max_length=150, blank=True, default="", db_index=True, verbose_name="Modelo relacionado"
    )
    related_object_id = models.CharField(
        max_length=120, blank=True, default="", db_index=True, verbose_name="ID de objeto relacionado"
    )
    action = models.CharField(max_length=120, verbose_name="Acción")
    payload = models.JSONField(default=dict, blank=True, verbose_name="Payload enviado")
    response = models.JSONField(default=dict, blank=True, verbose_name="Respuesta")
    success = models.BooleanField(default=False, db_index=True, verbose_name="Éxito")
    error_message = models.TextField(blank=True, default="", verbose_name="Mensaje de error")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")
        verbose_name = "Log de integración SuiteCRM"
        verbose_name_plural = "Logs de integración SuiteCRM"

    def __str__(self) -> str:
        return f"{self.action} · {self.related_model}#{self.related_object_id}"
