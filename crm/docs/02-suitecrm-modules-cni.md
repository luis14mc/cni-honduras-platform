# 02 · Módulos SuiteCRM para CNI

Mapeo funcional entre módulos estándar de **SuiteCRM** y el dominio de negocio del **Consejo Nacional de Inversiones (CNI)**.

SuiteCRM es el sistema de registro para leads, oportunidades y seguimiento comercial. La plataforma web (Django/Next.js) alimenta este CRM vía **n8n**, no escribe directamente en SuiteCRM.

## Mapeo de módulos

| Módulo SuiteCRM | Uso en CNI | Origen típico de datos |
|-----------------|------------|------------------------|
| **Accounts** | Empresas / organizaciones inversionistas | Formularios web, registro manual, importación |
| **Contacts** | Personas de contacto (inversionistas, representantes) | Postulación de proyectos, contacto, asesoría |
| **Opportunities** | Proyectos de inversión en pipeline | `ProjectApplication`, oportunidades del portafolio |
| **Cases** | Solicitudes, tickets, trámites de soporte | Formulario contacto, asesoría, seguimiento interno |
| **Tasks** | Seguimientos y pendientes del equipo CNI | Workflow n8n, asignación manual |
| **Meetings** | Reuniones con inversionistas | Calendario CRM, registro manual |
| **Calls** | Llamadas de seguimiento | Registro manual / integración futura |
| **Documents** | Expedientes, fichas, PDFs legales | CMS, descargas, adjuntos de postulación |
| **Campaigns** | Promoción, eventos, descargas de recursos | Campañas web, leads de recursos |

## Flujos por formulario web (referencia)

| Formulario plataforma | Entidad CRM inicial | Evolución |
|-----------------------|---------------------|-----------|
| Postulación de proyectos | **Lead** / **Opportunity** | Contact + Account al calificar |
| Contacto | **Lead** o **Case** | Contact si se califica |
| Asesoría | **Lead** + **Task** | Case si requiere trámite |
| Descarga de recurso | **Lead** (Campaign) | Contact en nurturing |

## Campos de trazabilidad recomendados

Al integrar vía n8n, conservar en SuiteCRM:

- **Origen** (`lead_source`): `website`
- **Sector de interés**
- **Departamento / ubicación**
- **Idioma** (es / en)
- **ID de postulación Django** (`submission_id` del WebhookEvent)

Esto permite deduplicar y auditar desde `WebhookEvent` y `SuiteCRMIntegrationLog` en Django.

## Roles sugeridos (alto nivel)

| Rol CRM | Responsabilidad |
|---------|-----------------|
| Administrador CRM | Configuración, usuarios, módulos |
| Promotor / analista | Leads, oportunidades, seguimiento |
| Solo lectura | Reportes ejecutivos |

## Notas

- No duplicar lógica de negocio entre Django y SuiteCRM: Django es **captura + cola de eventos**; SuiteCRM es **CRM operativo**.
- Los modelos `InvestmentOpportunity` / `InvestmentProject` en Django son **contenido público**; las **Opportunities** en CRM son **pipeline comercial** (pueden vincularse pero no son la misma entidad).

## Referencias

- [03-suitecrm-integration-flow.md](03-suitecrm-integration-flow.md)
- `docs/crm/01-suitecrm-functional-map.md` (monorepo raíz)
- `ai-workspace/context/06-crm-context.md`
