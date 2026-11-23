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
- **forms**: 4 modelos de envío; los cuatro formularios encolan un `WebhookEvent`.
- **integrations**: WebhookEvent y `process_webhook_events`.
- **cms**: Page, News, Document; viewsets registrados.
- Django Admin mejorado (postulaciones, webhooks).

### Documentación
- `ai-workspace/`, `docs/`, roadmap 4 meses.

## En progreso / parcial

- **Formularios frontend**: solo postulación wired; contacto/asesoría con `action="#"`.
- **CMS**: modelos existen; mayoría de páginas aún con copy estático i18n.
- **Casos de éxito**: API lista; `portafolio/casos` usa contenido estático.
- **media_library**: admin only; sin API pública.
- **users**: app stub; sin auth DRF.

## Pendiente (alto nivel)

- ADR-0002 (estrategia CRM formal) y ADR-0003 (auth/roles).
- Validar la entrega al CRM de extremo a extremo.
- CI/CD (lint + build).
- Producción: env, TLS, despliegue.
- Root README y contenido CMS bilingüe editable.

## Notas

- Legacy `/api/cms/` y `/api/geo/` se mantienen; **usar `/api/v1/`** en frontend nuevo.
- Confirmar datos locales: `docker compose up` + migraciones + seeds/import geo.
