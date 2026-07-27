# 06 · CRM Context

## Objetivo
Gestionar leads e interacciones de inversionistas desde la plataforma web en **SuiteCRM (SIGI CNI)**, sin acoplar Django directamente al CRM en la fase actual.

## Flujos que alimentan el CRM
| Formulario (frontend) | Ruta | Estado backend | Estado CRM |
|----------------------|------|----------------|------------|
| Postulación de proyectos | `/postulacion-de-proyectos` | ✅ API + WebhookEvent | ⏳ vía n8n |
| Contacto | `/contacto` | ✅ modelo forms | ❌ frontend sin wire |
| Asesoría | `/asesoria` | ✅ modelo forms | ❌ frontend sin wire |
| Descarga recursos | recursos | ✅ modelo forms | ❌ sin webhook |

## Arquitectura de integración (implementada en infra)

```
Formulario web → Django (forms) → WebhookEvent
       → process_webhook_events → n8n webhook
       → SuiteCRM (Leads / Opportunities / Accounts)
```

Documentación:
- [`docs/integrations/django-n8n-suitecrm-flow.md`](../../docs/integrations/django-n8n-suitecrm-flow.md)
- [`crm/docs/03-suitecrm-integration-flow.md`](../../crm/docs/03-suitecrm-integration-flow.md)

## SuiteCRM local (`crm/`)
- Stack Docker: `crm/docker-compose.suitecrm.yml`
- SIGI CNI: campos custom, layouts, pipeline, scripts automatizados
- Permisos dev: `dev-unlock` / `dev-lock` para `custom/`
- **No** comparte base de datos con Django (MariaDB dedicada)

## Entidades CRM (SuiteCRM)
- **Leads**, **Contacts**, **Accounts**, **Opportunities**
- Campos SIGI CNI: ciclo de vida, sector, departamento, etapas de proyecto, IDs Django/webhook

Ver [`docs/crm/01-suitecrm-functional-map.md`](../../docs/crm/01-suitecrm-functional-map.md) y [`crm/docs/05`–`09`](../../crm/docs/).

## Estado actual (2026-06-19)
| Componente | Estado |
|------------|--------|
| Modelos Django forms + integrations | ✅ |
| WebhookEvent en postulación | ✅ |
| Comando `process_webhook_events` | ✅ |
| n8n Docker + docs | ✅ |
| Workflow n8n JSON en repo | ❌ |
| SuiteCRM SIGI CNI local | ✅ (scripts + docs) |
| E2E formulario → CRM | ⏳ pendiente validación |

## Decisiones pendientes
- **ADR-0002**: formalizar estrategia CRM (n8n vs conector directo).
- Credenciales OAuth SuiteCRM producción.
- Idempotencia y reintentos en producción.

## Consideraciones
- Privacidad de datos personales.
- Trazabilidad: formulario, sector, departamento, locale, `django_submission_id`, `webhook_event_id`.
