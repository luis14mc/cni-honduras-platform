# Backlog

> **Última actualización:** 2026-06-19  
> Estado actual: [`docs/00-project-status-and-achievements.md`](../docs/00-project-status-and-achievements.md)

Lista priorizada. Mover a `current-sprint.md` al iniciar.

## Alta prioridad

### Integración y formularios
- [ ] Exportar workflow n8n `project-application-to-suitecrm.json` y validar E2E.
- [ ] Conectar formulario **contacto** a `POST /api/v1/forms/contact/`.
- [ ] Conectar formulario **asesoría** a API forms.
- [ ] WebhookEvent para contacto y asesoría (como postulación).
- [ ] ADR-0002: estrategia CRM producción.

### Frontend ↔ API
- [ ] `portafolio/casos` → API success-stories.
- [ ] Estados loading/error consistentes en todas las páginas API.
- [ ] Validación zod en todos los formularios.

## Media prioridad

### Backend
- [ ] API pública `media_library`.
- [ ] Contenido CMS bilingüe (campos por locale).
- [ ] Auth DRF + roles (`users`) — ADR-0003.
- [ ] Seeds demo unificados (geo + investment + cms).

### Frontend
- [ ] Reducir dependencia de `investmentSectors.ts` estático donde API cubra.
- [ ] Mapa: filtros server-side (opcional) cuando crezca volumen.
- [ ] Completar i18n faltante (es/en).

### CRM
- [ ] Validar SuiteCRM SIGI CNI en entorno staging.
- [ ] Vincular regiones CNI ↔ departamentos en admin (M2M).
- [ ] OAuth SuiteCRM producción.

## Infra / Calidad
- [ ] CI: eslint + `next build` + `manage.py check`.
- [ ] Variables producción (`.env` templates, secrets).
- [ ] Despliegue: frontend, backend, CRM (`crm.cni.hn`).
- [ ] Backups MariaDB SuiteCRM + PostGIS.

## Documentación
- [x] Snapshot avances (`docs/00-project-status-and-achievements.md`) — 2026-06-19.
- [ ] ADR-0002, ADR-0003.
- [ ] Mantener changelog al cerrar cada hito.

## Completado (referencia)

<details>
<summary>Ítems ya entregados (no reabrir)</summary>

- [x] Modelos investment + API v1.
- [x] Geo: departamentos, municipios, regiones + importadores.
- [x] Map-summary + mapa frontend conectado.
- [x] Postulación → API + WebhookEvent.
- [x] SuiteCRM stack + SIGI CNI scripts.
- [x] n8n scaffolding + process_webhook_events.
- [x] ai-workspace + docs base.

</details>
