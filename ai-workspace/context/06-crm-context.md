# 06 · CRM Context

## Objetivo
Gestionar leads e interacciones de inversionistas que llegan desde la plataforma (contacto, postulación de proyectos, asesoría) en un CRM, con **SuiteCRM** como referencia funcional.

## Flujos que alimentan el CRM
- **Formulario de contacto** (`/contacto`).
- **Postulación de proyectos** (`/postulacion-de-proyectos`).
- **Solicitud de asesoría** (`/asesoria`).

## Entidades CRM de referencia (SuiteCRM)
- **Leads**: prospecto inicial (datos del inversionista + interés).
- **Contacts**: persona ya calificada.
- **Accounts**: empresa / organización.
- **Opportunities**: oportunidad de inversión en seguimiento.
- **Cases / Tasks**: gestión y trámites asociados.

Ver mapeo detallado en `docs/crm/01-suitecrm-functional-map.md`.

## Integración (a definir)
- Estrategia: API/conector entre backend Django y SuiteCRM (REST de SuiteCRM v8 / webhooks).
- Mapear modelos `investment` y formularios → Leads/Opportunities.
- Evitar duplicados; idempotencia por email/identificador.

## Estado actual
- No implementado en el código todavía.
- Decisión de arquitectura de integración pendiente (futuro ADR).

## Consideraciones
- Privacidad de datos personales del inversionista.
- Trazabilidad de origen (qué formulario / sector / departamento generó el lead).
