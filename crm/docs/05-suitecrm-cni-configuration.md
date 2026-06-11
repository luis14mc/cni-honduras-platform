# 05 · Configuración funcional SIGI CNI

Guía operativa para la **primera instalación manual** de SuiteCRM como CRM interno del Consejo Nacional de Inversiones (CNI).

## Identidad del sistema

| Elemento | Valor |
|----------|-------|
| **Nombre institucional** | **SIGI CNI** — Sistema Integral de Gestión del Inversionista |
| **Objetivo** | Gestionar leads, empresas, contactos, proyectos, solicitudes y seguimiento del inversionista |
| **Alcance** | Sistema interno de seguimiento comercial y operativo |

## Principio rector

> **SuiteCRM no reemplaza el sitio web ni el CMS.**

| Sistema | Rol |
|---------|-----|
| **Next.js + Django (CMS)** | Contenido público, portafolio, formularios, datos geográficos |
| **SIGI CNI (SuiteCRM)** | Pipeline comercial, seguimiento, expedientes, actividades del equipo |

La plataforma web **captura** interés; SuiteCRM **gestiona** el ciclo de vida del inversionista.

## Usuarios objetivo

| Rol / área | Uso principal en SIGI CNI |
|------------|---------------------------|
| **Dirección Ejecutiva** | Dashboards, reportes, priorización |
| **Promoción de Inversiones** | Leads, oportunidades, campañas |
| **Atención al Inversionista** | Cases, contacto inicial, seguimiento |
| **Analistas** | Calificación, datos de proyecto, documentación |
| **Administración CRM** | Usuarios, campos, pipelines, integraciones |

## Módulos principales

Configurar y habilitar según necesidad operativa:

| Módulo SuiteCRM | Uso en CNI | Criterio de uso |
|-----------------|------------|-----------------|
| **Accounts** | Empresas | Toda organización inversionista o aliada identificada |
| **Contacts** | Contactos | Personas vinculadas a empresas o leads independientes |
| **Leads** | Leads / interesados | Primer contacto desde web, eventos o campañas |
| **Opportunities** | Proyectos de inversión | Proyecto calificado con monto, sector y etapa |
| **Cases** | Solicitudes / tickets | Trámites, consultas, soporte al inversionista |
| **Tasks** | Seguimientos | Pendientes asignados al equipo |
| **Meetings** | Reuniones | Agendas con inversionistas o instituciones |
| **Calls** | Llamadas | Registro de contacto telefónico |
| **Documents** | Expedientes | Fichas, PDFs, anexos de proyecto |
| **Campaigns** | Campañas / eventos / descargas | Origen de leads (web, ferias, recursos) |

## Orden sugerido de configuración (primera instalación)

1. **Admin → Studio**: crear campos personalizados ([06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md)).
2. **Admin → Dropdown Editor**: definir listas (ciclo de vida, estados, etapas) ([07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md)).
3. **Opportunities**: configurar pipeline / sales stages según etapas de proyecto.
4. **Leads**: configurar Lead Status según documento de etapas.
5. **Roles y equipos**: asignar acceso por área (Promoción, Atención, Analistas).
6. **Integración n8n** (fase posterior): mapear postulaciones web → Lead/Opportunity.

## Recomendaciones operativas

- **No usar SuiteCRM para contenido público** (noticias, páginas, oportunidades del sitio). Eso vive en Django/CMS.
- **No mezclar exportaciones con promoción de inversión** en esta primera fase: mantener pipelines y vistas separadas por tipo de gestión.
- **Toda postulación web** debe entrar como Lead u Opportunity inicial **vía n8n**, no carga manual masiva.
- **Mantener trazabilidad**: guardar en CRM el `submission_id` de Django y/o `event_id` del WebhookEvent (campo o nota en Lead/Opportunity).

## Relación con otros documentos

| Documento | Contenido |
|-----------|-----------|
| [06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md) | Campos personalizados recomendados |
| [07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md) | Ciclo de vida, estados de lead, etapas de proyecto |
| [02-suitecrm-modules-cni.md](02-suitecrm-modules-cni.md) | Mapeo funcional por módulo |
| [03-suitecrm-integration-flow.md](03-suitecrm-integration-flow.md) | Flujo Django → n8n → SuiteCRM |

## Checklist post-instalación

- [ ] Nombre del sistema visible para usuarios (SIGI CNI)
- [ ] Módulos habilitados según tabla anterior
- [ ] Campos personalizados creados en Studio
- [ ] Dropdowns de ciclo de vida, lead status y etapas de proyecto
- [ ] Pipeline de Opportunities alineado con etapas de proyecto
- [ ] Roles creados para las áreas objetivo
- [ ] Política documentada: web → n8n → CRM (sin doble captura manual)
