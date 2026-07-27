# API Roadmap

Estado y plan de la API REST (Django + DRF). **Base preferida:** `/api/v1/`.

> Última actualización: 2026-06-19

## Implementado — `/api/v1/geo/`

| Recurso | Método | Ruta | Notas |
|---------|--------|------|-------|
| Departamentos | GET | `/departments/` | Lista; geometría GeoJSON |
| Departamento | GET | `/departments/<slug>/` | Detalle |
| Regiones CNI | GET | `/regions/` | Lista + departamentos |
| Municipios | GET | `/municipalities/` | Filtros: `?department=`, `?region=` |

## Implementado — `/api/v1/investment/`

| Recurso | Método | Ruta | Notas |
|---------|--------|------|-------|
| Sectores | GET | `/sectors/` | Solo activos |
| Oportunidades | GET | `/opportunities/` | Filtros: sector, department, region, status, featured |
| Oportunidad | GET | `/opportunities/<slug>/` | |
| Proyectos | GET | `/projects/` | Filtros: sector, department, region, municipality, stage, featured |
| Proyecto | GET | `/projects/<slug>/` | |
| Casos de éxito | GET | `/success-stories/` | Filtro sector |
| **Map summary** | GET | `/map-summary/` | Agregado por departamento |

## Implementado — `/api/v1/cms/`

| Recurso | Método | Ruta | Notas |
|---------|--------|------|-------|
| Páginas | GET | `/pages/` | |
| Noticias | GET | `/news/` | Usado en home/prensa |
| Documentos | GET | `/documents/` | |

## Implementado — `/api/v1/forms/`

| Recurso | Método | Ruta | Notas |
|---------|--------|------|-------|
| Postulación proyecto | POST | `/project-application/` | Crea WebhookEvent |
| Contacto | POST | `/contact/` | Modelo listo; frontend pendiente |
| Asesoría | POST | `/advisory/` | Modelo listo; frontend pendiente |
| Lead descarga recurso | POST | `/resource-download/` | Modelo listo |

## Implementado — `/api/v1/integrations/`

| Recurso | Método | Ruta | Notas |
|---------|--------|------|-------|
| Webhook events | GET | `/webhook-events/` | Admin/lectura |
| SuiteCRM logs | GET | `/suitecrm-logs/` | Admin/lectura |

## Legacy (mantener)

| Prefijo | Equivalente v1 |
|---------|----------------|
| `/api/geo/` | `/api/v1/geo/` |
| `/api/cms/` | `/api/v1/cms/` |

## Planeado

### Fase A — Formularios y CRM
- [ ] WebhookEvent para contacto, asesoría, resource-download.
- [ ] Endpoint health/readiness para integraciones.

### Fase B — Medios y CMS
- [ ] `/api/v1/media/` (assets públicos).
- [ ] CMS bilingüe (campos es/en por recurso).

### Fase C — Auth
- [ ] Token/session DRF + permisos por rol (`users`).
- [ ] Endpoints admin protegidos.

### Fase D — Calidad
- [ ] OpenAPI schema (drf-spectacular u otro — evaluar).
- [ ] Rate limiting formularios públicos.

## Convenciones
Ver [`ai-workspace/context/05-api-conventions.md`](../../ai-workspace/context/05-api-conventions.md).

## Estado general
Ver [`docs/00-project-status-and-achievements.md`](../00-project-status-and-achievements.md).
