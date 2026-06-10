# API Roadmap

Estado y plan de la API REST (Django + DRF). Base: `/api/`.

## Implementado
| Recurso | Método | Ruta | Notas |
|--------|--------|------|-------|
| Departamentos | GET | `/api/geo/departments/` | Lista |
| Departamento | GET | `/api/geo/departments/<slug>/` | Detalle por slug |
| CMS | — | `/api/cms/` | Rutas registradas; alcance por consolidar |

## Planeado

### Fase 1 — Contenido y geo
- [ ] Consolidar endpoints `cms` (páginas, secciones, contenido bilingüe).
- [ ] Geometrías de departamentos como GeoJSON para Leaflet.

### Fase 2 — Inversión
- [ ] `GET /api/investment/opportunities/` (lista, filtros por sector/departamento).
- [ ] `GET /api/investment/opportunities/<slug>/` (detalle).
- [ ] `GET /api/investment/sectors/`.

### Fase 3 — Medios y usuarios
- [ ] `/api/media/` (assets, imágenes optimizadas).
- [ ] Auth DRF (token/session) + permisos por rol en `users`.

### Fase 4 — Formularios / CRM
- [ ] `POST /api/leads/contact/`.
- [ ] `POST /api/leads/project-application/`.
- [ ] `POST /api/leads/advisory/`.
- [ ] Conector → SuiteCRM (ver `docs/crm/`).

## Convenciones
Ver `ai-workspace/context/05-api-conventions.md`:
- Rutas por app `/api/<app>/`, plural para listas, slug para detalle.
- Vistas CBV de DRF, nombres con prefijo de app.
- Errores HTTP estándar, cuerpo `{ "detail": ... }`.
- Paginación DRF en listas.
