# ADR-0001 · Arquitectura actual

- **Estado**: Aceptado (documenta el estado existente; actualizado 2026-06-19)
- **Fecha**: 2026-06-10
- **Contexto**: Arquitectura implementada del monorepo CNI Honduras Platform.

## Decisión

### Separación frontend / backend / servicios satélite
- **Frontend**: Next.js 16 (App Router, React 19, Tailwind 4) — sitio público bilingüe.
- **Backend**: Django 5 + DRF + GeoDjango — API v1, CMS, formularios, webhooks.
- **CRM**: `cni-crm` opera como servicio independiente.

Comunicación frontend ↔ backend: **REST** bajo `/api/v1/`.

### Datos geográficos
- PostgreSQL 15 + **PostGIS 3.4** + GeoDjango.
- Departamentos, municipios, regiones CNI; geometrías como **GeoJSON** en API.
- Mapa Leaflet consume `/api/v1/geo/departments/` + `/api/v1/investment/map-summary/`.

### Internacionalización
- i18n propio en frontend (`src/i18n`), locales `es` (default) y `en`.
- Rutas `[locale]`; navegación/SEO en `src/config`.

### Organización backend
Apps por dominio:
- `cms`, `geo`, `investment`, `forms`, `integrations`, `media_library`, `users`, `core`

API versionada:
```
/api/v1/cms/ | geo/ | investment/ | forms/ | integrations/
```
Legacy: `/api/cms/`, `/api/geo/`.

### Integración CRM (patrón adoptado)
Django entrega los formularios mediante una cola persistente.
`forms → WebhookEvent → process_webhook_events → cni-crm`

### Orquestación dev
| Stack | Compose | Puertos |
|-------|---------|---------|
| Plataforma | `docker-compose.yml` | 3000, 8000, 5432 |

## Consecuencias
- **Positivo**: separación clara, geo nativo, CRM aislado, integración desacoplada vía eventos.
- **Costo**: la prueba E2E del CRM requiere una instancia accesible de `cni-crm`.

## Decisiones futuras
- **ADR-0002**: operación y validación del CRM.
- **ADR-0003**: autenticación y roles CNI.

## Referencias
- [`docs/00-project-status-and-achievements.md`](../../docs/00-project-status-and-achievements.md)
- [`docs/architecture/01-solution-architecture.md`](../../docs/architecture/01-solution-architecture.md)
