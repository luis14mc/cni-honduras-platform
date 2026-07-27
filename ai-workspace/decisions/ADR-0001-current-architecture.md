# ADR-0001 · Arquitectura actual

- **Estado**: Aceptado (documenta el estado existente; actualizado 2026-06-19)
- **Fecha**: 2026-06-10
- **Contexto**: Arquitectura implementada del monorepo CNI Honduras Platform.

## Decisión

### Separación frontend / backend / servicios satélite
- **Frontend**: Next.js 16 (App Router, React 19, Tailwind 4) — sitio público bilingüe.
- **Backend**: Django 5 + DRF + GeoDjango — API v1, CMS, formularios, webhooks.
- **CRM**: SuiteCRM 8+ en `crm/` — servicio independiente (MariaDB propia).
- **n8n**: Orquestación en `automation/n8n/` — desacopla Django de SuiteCRM.

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
Django **no escribe directo** en SuiteCRM. Flujo:
`forms → WebhookEvent → process_webhook_events → n8n → SuiteCRM`

### Orquestación dev
| Stack | Compose | Puertos |
|-------|---------|---------|
| Plataforma | `docker-compose.yml` | 3000, 8000, 5432 |
| SuiteCRM | `crm/docker-compose.suitecrm.yml` | 8085, 3307 |
| n8n | `automation/n8n/docker-compose.n8n.yml` | 5678 |

## Consecuencias
- **Positivo**: separación clara, geo nativo, CRM aislado, integración desacoplada vía eventos.
- **Costo**: múltiples stacks locales; E2E CRM requiere levantar 3 servicios.

## Decisiones futuras
- **ADR-0002**: estrategia CRM formal (n8n, mapeos, producción).
- **ADR-0003**: autenticación y roles CNI.

## Referencias
- [`docs/00-project-status-and-achievements.md`](../../docs/00-project-status-and-achievements.md)
- [`docs/architecture/01-solution-architecture.md`](../../docs/architecture/01-solution-architecture.md)
