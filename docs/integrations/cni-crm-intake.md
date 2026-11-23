# Entrega de formularios a cni-crm

Django guarda cada envío y genera un `WebhookEvent` en su base de datos. El comando `process_webhook_events` entrega eventos al repositorio externo [cni-crm](https://github.com/luis14mc/cni-crm).

## Configuración

- `CNI_CRM_INTAKE_URL` contiene la URL completa del endpoint `POST /api/intake/events/`.
- `CNI_CRM_INTAKE_TOKEN` debe coincidir con `CRM_INTAKE_TOKEN` en el servicio receptor. El comando lo envía en el encabezado `Authorization: Bearer <token>`.

Ejecutar `python manage.py process_webhook_events` periódicamente desde el entorno del backend. `--limit` controla el tamaño del lote (25 por defecto). Si falta la URL o el token, el comando emite una advertencia y deja los eventos y sus intentos intactos.

## Contrato v1

El cuerpo JSON incluye `contract_version` (1), `event_id` (ID estable entre intentos), `source`, `event_type`, `occurred_at`, `payload` y `created_at` (alias de compatibilidad de `occurred_at`). Los tipos de evento admitidos son:

- `project_application.created`
- `contact_submission.created`
- `advisory_request.created`
- `resource_download.created`

Una respuesta 2xx marca el evento como procesado. Si incluye `crm_record_id`, el envío local guarda el identificador y se marca como sincronizado. Las respuestas 400, 401, 403, 404, 409, 413 y 422 son fallos definitivos. Los errores de red y los demás fallos se reintentan con espera exponencial de hasta 60 minutos y un máximo de 10 intentos.

## Operación y reversión

Consultar eventos e intentos en Django Admin. El endpoint de lectura para administradores es `GET /api/v1/integrations/webhook-events/`. El modo `--dry-run` presenta el payload en la consola, que puede contener datos personales.

La migración `integrations.0003_archive_legacy_delivery_log` aparta la tabla antigua de logs en `integrations_delivery_log_archive` y conserva sus filas. Para revertir el esquema, ejecutar `python manage.py migrate integrations 0002` antes de volver a la versión anterior del backend. La migración conserva la cola de eventos.
