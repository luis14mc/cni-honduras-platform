# 03 · Current Progress

> **Última actualización:** 2026-06-19  
> Resumen maestro de logros: [`docs/00-project-status-and-achievements.md`](../../docs/00-project-status-and-achievements.md)

## Hecho

### Frontend
- Next.js 16 App Router, **31+ rutas** bajo `[locale]`, i18n es/en, Tailwind 4, framer-motion.
- **Mapa interactivo** (`HondurasMap.tsx`): Leaflet + API v1 (`/geo/departments/`, `/investment/map-summary/`).
- Integración API: home/prensa (CMS), invertir/sectores, portafolio (investment).
- Postulación de proyectos conectada a `POST /api/v1/forms/project-application/`.
- Capa `lib/api.ts` + servicios (`investment`, `cms`, `forms`).

### Backend
- **API v1** (`/api/v1/`): cms, geo, investment, forms, integrations.
- **geo**: Department, CNIRegion, Municipality (PostGIS); 18 deptos + 298 municipios importados; GeoJSON en serializers.
- **investment**: Sector, InvestmentOpportunity, InvestmentProject, SuccessStory; filtros; **`map-summary/`**.
- **forms**: 4 modelos de envío; ProjectApplication encola WebhookEvent.
- **integrations**: WebhookEvent, SuiteCRMIntegrationLog, `process_webhook_events`.
- **cms**: Page, News, Document; viewsets registrados.
- Django Admin mejorado (postulaciones, webhooks).

### CRM (`crm/`)
- SuiteCRM 8+ local (Docker PHP + MariaDB).
- SIGI CNI: scripts Extension, fields_meta_data, layouts, labels es/en, dev unlock/lock.
- 10 documentos operativos.

### Automatización
- n8n Docker local + doc integración Django → n8n → SuiteCRM.

### Documentación
- `ai-workspace/`, `docs/`, `crm/docs/`, roadmap 4 meses.

## En progreso / parcial

- **Formularios frontend**: solo postulación wired; contacto/asesoría con `action="#"`.
- **CMS**: modelos existen; mayoría de páginas aún con copy estático i18n.
- **Casos de éxito**: API lista; `portafolio/casos` usa contenido estático.
- **CRM E2E**: infra lista; workflow n8n sin JSON commiteado; OAuth SuiteCRM pendiente.
- **media_library**: admin only; sin API pública.
- **users**: app stub; sin auth DRF.

## Pendiente (alto nivel)

- ADR-0002 (estrategia CRM formal) y ADR-0003 (auth/roles).
- Workflow n8n exportado y probado end-to-end.
- Webhooks para contacto, asesoría, resource-download.
- CI/CD (lint + build).
- Producción: env, TLS, despliegue.
- Root README y contenido CMS bilingüe editable.

## Notas

- Legacy `/api/cms/` y `/api/geo/` se mantienen; **usar `/api/v1/`** en frontend nuevo.
- SuiteCRM y n8n son stacks Docker **separados** del compose raíz.
- Confirmar datos locales: `docker compose up` + migraciones + seeds/import geo.
