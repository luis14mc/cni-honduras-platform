# Roadmap · 4 Meses

Plan de alto nivel CNI Honduras Platform.  
> **Última actualización:** 2026-06-19 — refleja avances reales.

## Mes 1 — Fundaciones ✅ (mayormente completado)

- [x] Workspace IA y documentación (`ai-workspace/`, `docs/`).
- [x] API v1 agregador (`/api/v1/`).
- [x] Geo: departamentos importados, GeoJSON, municipios (298).
- [x] Frontend conectado: prensa, sectores, primera integración API.
- [x] Docker Compose operativo (db + backend + frontend).
- [ ] Consolidar CMS bilingüe editable (parcial — modelos existen).

## Mes 2 — Inversión y mapa ✅ (completado)

- [x] Modelos `investment` (sectores, oportunidades, proyectos, casos de éxito).
- [x] Endpoints `/api/v1/investment/` + filtros + `map-summary`.
- [x] Páginas invertir/portafolio consumiendo API.
- [x] Mapa interactivo E2E (backend + frontend Leaflet).
- [ ] Contenido i18n 100% en secciones clave (parcial).

## Mes 3 — Formularios y CRM ⏳ (en curso)

- [x] Modelos forms + integrations (WebhookEvent).
- [x] Postulación → API + WebhookEvent.
- [x] Comando `process_webhook_events`.
- [x] Stack SuiteCRM local + SIGI CNI (scripts, docs).
- [x] Stack n8n local + documentación flujo.
- [ ] Formularios contacto/asesoría wired (frontend).
- [ ] Workflow n8n exportado y E2E validado.
- [ ] ADR-0002 integración CRM producción.
- [ ] Auth y roles (`users`).

## Mes 4 — Calidad y producción 🔲

- [ ] `media_library` API pública + optimización imágenes.
- [ ] CI (lint/build frontend, checks backend).
- [ ] Configuración producción (env, TLS, despliegue).
- [ ] Hardening, accesibilidad, SEO final.
- [ ] Lanzamiento / despliegue `crm.cni.hn`.

## Riesgos (actualizados)

| Riesgo | Mitigación |
|--------|------------|
| Alcance CMS bilingüe | Priorizar páginas de inversión y prensa primero |
| E2E CRM | Validar n8n + SuiteCRM en staging antes de prod |
| Múltiples stacks Docker | Documentación de arranque unificada (`docs/00-...`) |
| Contenido estático vs API | Backlog: migrar página por página |

## Seguimiento

- Avances: [`docs/00-project-status-and-achievements.md`](../00-project-status-and-achievements.md)
- Progreso técnico: [`ai-workspace/context/03-current-progress.md`](../../ai-workspace/context/03-current-progress.md)
- Sprints: [`ai-workspace/tasks/current-sprint.md`](../../ai-workspace/tasks/current-sprint.md)
- Changelog: [`ai-workspace/changelog/CHANGELOG.md`](../../ai-workspace/changelog/CHANGELOG.md)
