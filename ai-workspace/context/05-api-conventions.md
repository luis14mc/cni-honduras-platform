# 05 · API Conventions

## Base
- **Prefijo versionado:** `/api/v1/` (`config/api_v1.py`). **Usar siempre para desarrollo nuevo.**
- Apps bajo v1:
  - `/api/v1/cms/`
  - `/api/v1/geo/`
  - `/api/v1/investment/`
  - `/api/v1/forms/`
  - `/api/v1/integrations/`
- **Legacy (mantener):** `/api/cms/`, `/api/geo/` — mismos routers, sin prefijo v1.

## Frontend
- `API_BASE_URL` en `frontend/src/lib/api.ts` (default `http://localhost:8000/api/v1`).
- Paths relativos en servicios: `/geo/departments/`, `/investment/map-summary/`, etc.

## Patrón de rutas (DRF ViewSets)
```
GET /api/v1/geo/departments/              → lista
GET /api/v1/geo/departments/<slug>/       → detalle por slug
GET /api/v1/geo/municipalities/?department=<slug>&region=<slug>
GET /api/v1/investment/projects/?sector=&department=&municipality=&stage=&featured=
GET /api/v1/investment/opportunities/?sector=&department=&region=&status=&featured=
GET /api/v1/investment/map-summary/       → resumen por departamento (lista)
POST /api/v1/forms/project-application/   → crea postulación + WebhookEvent
```

## Convenciones
- JSON. Serializers DRF por recurso.
- Listas en plural; detalle por **slug** cuando aplique.
- Paginación DRF en listas grandes.
- Geometrías: **GeoJSON** (`type` + `coordinates`), no WKT.
- Filtros vía query params (`department`, `sector`, `region`, etc.).

## Errores
- HTTP estándar (200, 201, 400, 404, 422, 500).
- Cuerpo: `{ "detail": "..." }` (DRF).

## CORS / CSRF
- Dev: `localhost:3000`, `127.0.0.1:3000`.

## Pendiente
- Auth DRF (token/session) y permisos (`users`).
- API pública `media_library`.
- OpenAPI/Swagger (opcional).

## Referencia
- Roadmap: [`docs/api/01-api-roadmap.md`](../../docs/api/01-api-roadmap.md)
