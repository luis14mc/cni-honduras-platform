# 03 · Flujo de integración SuiteCRM

Documentación del flujo **actual y previsto** entre la plataforma web CNI, Django, n8n y SuiteCRM.

## Principio

- **Django** y **Next.js** no llaman a SuiteCRM directamente.
- **n8n** es el orquestador entre el backend y el CRM.
- **SuiteCRM** vive en `crm/` como servicio separado (`crm.cni.hn` en producción).

## Diagrama

```
┌─────────────┐     POST      ┌──────────────────┐
│  Next.js    │ ────────────► │ Django REST API  │
│ /postulacion│               │ ProjectApplication│
└─────────────┘               └────────┬─────────┘
                                       │ save
                                       ▼
                              ┌──────────────────┐
                              │  WebhookEvent    │
                              │  processed=False │
                              └────────┬─────────┘
                                       │
                         manage.py process_webhook_events
                                       │ POST JSON
                                       ▼
                              ┌──────────────────┐
                              │      n8n         │
                              │  (webhook flow)  │
                              └────────┬─────────┘
                                       │ REST API
                                       ▼
                              ┌──────────────────┐
                              │    SuiteCRM      │
                              │  Leads / Opps…   │
                              └──────────────────┘
```

## Paso a paso

### 1. Formulario web (Next.js)

- Ruta pública: `/postulacion` (y equivalente EN).
- Envía datos al endpoint Django:
  ```
  POST /api/v1/forms/project-application/
  ```
- Respuesta **201** al usuario; no depende del CRM.

### 2. Django — ProjectApplication

- Modelo `ProjectApplication` en `apps.forms`.
- Admin: revisión manual, estados (nuevo, en revisión, contactado, etc.).

### 3. Django — WebhookEvent (automático)

Al crear una postulación exitosa, Django encola:

| Campo | Valor |
|-------|-------|
| `source` | `website` |
| `event_type` | `project_application.created` |
| `processed` | `False` |
| `payload` | Datos de la postulación (submission_id, contacto, proyecto, etc.) |

Implementado en `apps.forms.viewsets` (sin llamada externa en este paso).

### 4. Command — process_webhook_events

```bash
python manage.py process_webhook_events [--limit N] [--dry-run]
```

- Lee eventos `processed=False` y `event_type=project_application.created`.
- Envía POST a n8n si está configurado:
  ```
  N8N_PROJECT_APPLICATION_WEBHOOK_URL
  ```
- Payload hacia n8n:
  ```json
  {
    "event_id": 1,
    "source": "website",
    "event_type": "project_application.created",
    "payload": { "...": "..." },
    "created_at": "2026-06-11T12:00:00+00:00"
  }
  ```

**Éxito (HTTP 2xx):**

- `WebhookEvent.processed = True`
- `WebhookEvent.processed_at = now`
- `SuiteCRMIntegrationLog` con `action=send_to_n8n`, `success=True`

**Error:**

- `WebhookEvent.processed` permanece `False`
- `WebhookEvent.error_message` con detalle
- `SuiteCRMIntegrationLog` con `success=False`
- El command continúa con el siguiente evento

### 5. n8n (externo)

Responsabilidades típicas del workflow n8n:

1. Recibir webhook de Django.
2. Validar / transformar payload.
3. Crear o actualizar registro en SuiteCRM (Lead, Contact, Opportunity).
4. Opcional: notificar equipo (email, Slack).
5. Opcional: callback a Django (futuro) para marcar `crm_synced` en `ProjectApplication`.

> La configuración del workflow n8n **no** vive en este repositorio.

### 6. SuiteCRM

- Servicio en `crm/` (MariaDB + app).
- Usuarios CNI gestionan pipeline en módulos documentados en [02-suitecrm-modules-cni.md](02-suitecrm-modules-cni.md).

## Variables de entorno relevantes

| Variable | Dónde | Propósito |
|----------|-------|-----------|
| `N8N_PROJECT_APPLICATION_WEBHOOK_URL` | `backend/.env` | URL webhook n8n |
| `SUITECRM_*` | `crm/.env` | Stack CRM local/prod |

## Estado actual vs futuro

| Capacidad | Estado |
|-----------|--------|
| Guardar postulación en Django | ✅ |
| Crear WebhookEvent | ✅ |
| Command `process_webhook_events` → n8n | ✅ |
| Admin Django (postulaciones, eventos, logs) | ✅ |
| Stack SuiteCRM base (`crm/`) | ✅ (estructura) |
| Workflow n8n → SuiteCRM | 🔲 pendiente |
| Sync bidireccional `crm_synced` | 🔲 pendiente |
| SuiteCRM en `crm.cni.hn` producción | 🔲 pendiente |

## Operación recomendada

1. Cron o scheduler ejecuta periódicamente:
   ```bash
   python manage.py process_webhook_events --limit 50
   ```
2. Equipo revisa fallos en Django Admin → **Eventos de webhook** / **Logs de integración**.
3. n8n reintentos para eventos fallidos (política definida en n8n).

## Referencias en el monorepo

- `backend/apps/forms/` — formularios y postulaciones
- `backend/apps/integrations/` — WebhookEvent, logs, command
- `crm/README.md` — servicio SuiteCRM separado
- `docs/crm/01-suitecrm-functional-map.md` — mapa funcional legacy en docs raíz
