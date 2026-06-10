# ADR-0001 · Arquitectura actual

- **Estado**: Aceptado (documenta el estado existente)
- **Fecha**: 2026-06-10
- **Contexto**: Se documenta la arquitectura ya implementada para servir de base a futuras decisiones.

## Decisión

### Separación frontend / backend
- **Frontend**: Next.js 16 (App Router, React 19, Tailwind 4) como sitio público bilingüe.
- **Backend**: Django 5 + DRF + GeoDjango como API y CMS.
- Comunicación vía API REST bajo `/api/`.

### Datos geográficos
- PostgreSQL 15 + **PostGIS 3.4** y **GeoDjango** para manejar geometrías por departamento (mapa Leaflet en frontend).

### Internacionalización
- i18n propio en frontend (`src/i18n`), locales `es` (default) y `en`, rutas bajo `[locale]`.
- Navegación/SEO centralizados en `src/config`.

### Organización backend
- Apps por dominio: `cms`, `geo`, `investment`, `media_library`, `users`, `core`.
- Endpoints por app bajo `/api/<app>/` (hoy: `cms`, `geo`).

### Orquestación
- `docker-compose.yml` con `db` (PostGIS), `backend` (8000), `frontend` (3000).

## Consecuencias
- **Positivo**: separación clara de responsabilidades, escalable por dominio, soporte geoespacial nativo, bilingüe desde el inicio.
- **Negativo / costo**: dos stacks a mantener; integración frontend↔backend y CRM aún por formalizar.

## Decisiones futuras (placeholders)
- ADR-0002: estrategia de integración con SuiteCRM.
- ADR-0003: autenticación y roles.
