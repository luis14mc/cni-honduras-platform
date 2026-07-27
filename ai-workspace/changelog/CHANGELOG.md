# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/). Fechas en `YYYY-MM-DD`.

## [Unreleased]

### Planned
- Workflow n8n exportado y E2E formulario → SuiteCRM.
- Formularios contacto/asesoría conectados al backend.
- CI lint + build.
- ADR-0002, ADR-0003.

---

## [2026-06-19] — Documentación de avances

### Changed
- Actualizado `ai-workspace/` (context, backlog, sprint, ADR-0001).
- Actualizado `docs/` (architecture, API roadmap, roadmap 4 meses).
- Nuevo [`docs/00-project-status-and-achievements.md`](../docs/00-project-status-and-achievements.md).
- README raíz del monorepo.

---

## [2026-06-16] — Mapa interactivo E2E

### Added
- Backend: filtros geo/investment; `GET /api/v1/investment/map-summary/`.
- Backend: serialización GeoJSON en departamentos/municipios (fix WKT).
- Frontend: `HondurasMap` conectado a API v1 (departments + map-summary).
- Tipos `investment-map.ts`; filtro client-side por sector; sidebar con métricas.

---

## [2026-06-12] — Geo municipios, n8n, permisos CRM

### Added
- Comando `import_municipalities` (298 municipios).
- Stack n8n local (`automation/n8n/`).
- Scripts `dev-unlock-suitecrm-custom.sh`, `dev-lock-suitecrm-custom.sh`.
- Doc `crm/docs/10-suitecrm-dev-permissions.md`.

---

## [2026-06-11] — SuiteCRM SIGI CNI + integraciones

### Added
- Estructura `crm/` (Docker SuiteCRM 8+, Apache DocumentRoot `/public`).
- Scripts SIGI CNI: customizations, fields_meta_data, layouts (es_es + en_us).
- Docs operativas CRM (`crm/docs/05`–`09`).
- Comando `process_webhook_events` (Django → n8n).
- WebhookEvent al crear ProjectApplication.
- Modelos: geo (CNIRegion, Municipality), investment, forms, integrations.
- API v1 agregador; frontend investment services; sectores conectados a API.
- Django Admin mejorado (postulaciones, webhooks).

---

## [2026-06-10] — Fundaciones documentación

### Added
- `ai-workspace/` (context, tasks, decisions, changelog).
- `docs/` (architecture, api, crm, roadmap, integrations).
