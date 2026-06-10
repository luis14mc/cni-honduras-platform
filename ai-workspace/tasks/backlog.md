# Backlog

Lista priorizada de trabajo pendiente. Mover a `current-sprint.md` al iniciarlo.

## Backend
- [ ] Definir modelos de `investment` (oportunidades, sectores, montos).
- [ ] Serializers + endpoints `/api/investment/`.
- [ ] Consolidar modelos y endpoints de `cms`.
- [ ] API de `media_library` (assets, imágenes).
- [ ] Autenticación y roles en `users` (DRF auth).

## Frontend
- [ ] Conectar páginas a la API real (geo, cms, investment).
- [ ] Formularios: contacto, postulación de proyectos, asesoría (validación zod).
- [ ] Estados de carga/error en consumo de API.
- [ ] Completar contenido i18n faltante (es/en).

## CRM
- [ ] Definir estrategia de integración con SuiteCRM (ADR).
- [ ] Mapear formularios → Leads/Opportunities.
- [ ] Conector backend ↔ CRM (idempotencia por email).

## Infra / Calidad
- [ ] Variables de entorno para producción.
- [ ] CI: lint + build frontend, checks backend.
- [ ] Seeds/datos de demo en `database/`.

## Documentación
- [ ] Mantener `03-current-progress.md` actualizado.
- [ ] ADRs por decisión técnica relevante.
