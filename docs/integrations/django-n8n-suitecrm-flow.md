# Django -> n8n -> SuiteCRM

Documento de trabajo para la integración de formularios públicos del CNI con SuiteCRM usando n8n como orquestador local.

## Objetivo

Separar la captura web de la integración CRM:

- **Django** valida y guarda la información recibida desde el sitio.
- **Django** registra eventos pendientes en `WebhookEvent`.
- **n8n** recibe eventos, transforma datos y conversa con SuiteCRM.
- **SuiteCRM** concentra leads, cuentas, contactos y oportunidades.

## Componentes

| Componente | Puerto / ruta | Responsabilidad |
|------------|---------------|-----------------|
| Backend Django | `http://localhost:8000` | API pública, persistencia local y generación de eventos. |
| n8n | `http://localhost:5678` | Orquestación, transformación y reintentos de integración. |
| SuiteCRM | `http://localhost:8085` | CRM destino. |

## Arranque local de n8n

```bash
cd automation/n8n
cp .env.example .env
docker compose -f docker-compose.n8n.yml up -d
```

Abrir:

```text
http://localhost:5678
```

## Webhook n8n esperado

El workflow inicial debe exponer:

```text
POST /webhook/project-application
```

URL para Django:

```text
N8N_PROJECT_APPLICATION_WEBHOOK_URL=http://localhost:5678/webhook/project-application
```

## Evento Django

Django usa `apps.integrations.models.WebhookEvent` como bandeja de salida.

Campos relevantes:

| Campo | Descripción |
|-------|-------------|
| `source` | Origen lógico del evento. Para sitio público: `website`. |
| `event_type` | Tipo de evento. Para postulaciones: `project_application.created`. |
| `payload` | Datos de negocio que n8n debe transformar. |
| `processed` | Marca local para evitar reenvíos tras éxito. |
| `error_message` | Último error de envío o respuesta no exitosa. |
| `created_at` | Fecha de creación del evento. |
| `processed_at` | Fecha en que Django lo marcó como procesado. |

El comando actual es:

```bash
cd backend
venv/bin/python manage.py process_webhook_events
```

Modo de inspección sin enviar:

```bash
cd backend
venv/bin/python manage.py process_webhook_events --dry-run
```

## Payload enviado a n8n

`process_webhook_events` envía a n8n este sobre JSON:

```json
{
  "event_id": 123,
  "source": "website",
  "event_type": "project_application.created",
  "payload": {
    "application_id": 45,
    "full_name": "Nombre del inversionista",
    "email": "inversionista@example.com",
    "phone": "+504 0000-0000",
    "company": "Empresa S.A.",
    "country": "Honduras",
    "project_name": "Proyecto Solar",
    "sector": "energia",
    "department": "",
    "project_location": "Choluteca",
    "investment_range": "US$1 millón a US$5 millones",
    "estimated_investment": null,
    "expected_jobs": 50,
    "details": "Descripcion del proyecto enviada desde el formulario.",
    "message": "Descripcion del proyecto enviada desde el formulario.",
    "consent": true,
    "source": "website_project_application"
  },
  "created_at": "2026-06-12T10:00:00-06:00"
}
```

Notas:

- `event_id` es el identificador del `WebhookEvent`, no necesariamente el id de la postulación.
- El contenido exacto de `payload` lo define Django al crear el evento.
- n8n debe tratar `payload` como la fuente de datos para mapear hacia SuiteCRM.

## Mapeo inicial a SuiteCRM

| Payload Django | SuiteCRM sugerido |
|----------------|-------------------|
| `full_name`, `email`, `phone` | Lead / Contact |
| `company`, `country` | Account / Lead |
| `project_name`, `details` | Opportunity name / description |
| `sector`, `department`, `project_location` | Campos custom o descripción de Opportunity |
| `investment_range`, `estimated_investment` | Opportunity amount o campo custom |
| `expected_jobs` | Campo custom de impacto |
| `source` | Lead source / campaign source |

## Respuesta esperada de n8n

Django marca el evento como procesado si n8n responde con cualquier código HTTP `2xx`.

Respuesta mínima recomendada:

```json
{
  "ok": true,
  "suitecrm": {
    "lead_id": "uuid-or-id",
    "opportunity_id": "uuid-or-id"
  }
}
```

Si n8n responde `4xx` o `5xx`, Django conserva `processed=false`, registra `error_message` y crea un `SuiteCRMIntegrationLog` fallido.

## Seguridad

En esta etapa no se conecta SuiteCRM todavía desde Django.

Recomendaciones para el workflow n8n:

- Validar un token compartido usando `DJANGO_WEBHOOK_TOKEN`.
- No guardar credenciales reales en archivos exportados.
- Usar credenciales de n8n para SuiteCRM en lugar de pegarlas dentro del workflow.
- Mantener `.env` fuera de Git.

## Pendientes

- [ ] Crear workflow n8n `Project Application to SuiteCRM`.
- [ ] Definir autenticación contra SuiteCRM local.
- [ ] Confirmar campos custom necesarios en SuiteCRM.
- [ ] Activar token en el envío Django -> n8n.
- [ ] Definir estrategia de deduplicación por email/empresa/proyecto.
