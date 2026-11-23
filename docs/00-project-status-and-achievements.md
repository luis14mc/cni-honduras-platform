# Estado del proyecto y logros — CNI Honduras Platform

> **Última actualización:** 2026-06-19  
> Documento maestro de avances. Detalle operativo en `ai-workspace/context/03-current-progress.md`.

## Resumen ejecutivo

La plataforma web del Consejo Nacional de Inversiones (CNI) está en **desarrollo activo** con:

- Sitio público bilingüe (es/en) con **31+ rutas** y diseño institucional avanzado.
- Backend Django/DRF/GeoDjango con **API versionada** `/api/v1/`.
- **Mapa interactivo** conectado a datos reales (departamentos + resumen de inversión).

---

## Logros por área

### Frontend (Next.js 16 / React 19 / Tailwind 4)

| Logro | Detalle |
|-------|---------|
| App Router bilingüe | Rutas bajo `[locale]`, i18n propio, SEO y rewrites |
| Diseño institucional | Home, invertir, portafolio, CNI, vivir, prensa, recursos, etc. |
| Integración API v1 | Home/prensa (CMS), sectores/portafolio (investment), mapa (geo + map-summary) |
| Mapa Leaflet | `HondurasMap.tsx`: departamentos GeoJSON, resumen territorial, filtro por sector |
| Postulación de proyectos | Formulario conectado a `POST /api/v1/forms/project-application/` |
| Capa de servicios | `lib/api.ts`, `services/investment.ts`, `services/cms.ts`, `services/forms.ts` |

### Backend (Django 5 / DRF / GeoDjango / PostGIS)

| Logro | Detalle |
|-------|---------|
| API v1 | Agregador en `config/api_v1.py`: cms, geo, investment, forms, integrations |
| Geo | 18 departamentos, 298 municipios, regiones CNI; geometrías GeoJSON; filtros por slug |
| Investment | Sectores, oportunidades, proyectos, casos de éxito; `map-summary` agregado por departamento |
| CMS | Page, News, Document + media_library (admin) |
| Forms | ContactSubmission, ProjectApplication, AdvisoryRequest, ResourceDownloadLead |
| Integraciones | WebhookEvent, comando `process_webhook_events` |
| Admin mejorado | Acciones masivas en postulaciones y webhooks |
| Seeds / import | `import_departments`, `import_municipalities`, `seed_regions`, `seed_investment` |

### Documentación e IA

| Logro | Detalle |
|-------|---------|
| `ai-workspace/` | Contexto, backlog, ADR-0001, reglas para asistentes |
| `docs/` | Arquitectura, API roadmap, CRM, integraciones, roadmap 4 meses |
| Este documento | Snapshot de avances y logros |

---

## Endpoints API implementados (v1)

| Dominio | Rutas principales |
|---------|-------------------|
| **geo** | `departments/`, `regions/`, `municipalities/?department=&region=` |
| **investment** | `sectors/`, `opportunities/`, `projects/`, `success-stories/`, **`map-summary/`** |
| **cms** | `pages/`, `news/`, `documents/` |
| **forms** | `project-application/` (POST), otros tipos registrados |
| **integrations** | `webhook-events/` (lectura admin) |

Base URL dev: `http://localhost:8000/api/v1`

---

## Fases recientes completadas

### Mapa Backend 01–02
- Filtros en municipios, proyectos y oportunidades.
- Endpoint `GET /api/v1/investment/map-summary/`.
- Serialización GeoJSON corregida en departamentos/municipios.

### Mapa Frontend 01
- `HondurasMap` consume `/geo/departments/` + `/investment/map-summary/` vía `apiGet`.
- Sidebar con métricas por departamento; filtro client-side por sector.
- Colores institucionales CNI (`#334E88`, `#32B372`).

### Integración formularios (parcial)
- Postulación de proyecto → modelo + WebhookEvent → `process_webhook_events` → `cni-crm`.

---

## Pendiente prioritario

1. **Formularios frontend restantes** — contacto, asesoría, descarga de recursos → API forms.
2. **Entrega al CRM** — validar el contrato de intake de extremo a extremo.
3. **Casos de éxito** — conectar `portafolio/casos` a API (hoy contenido estático).
4. **CMS-driven pages** — migrar copy estático a contenido editable.
5. **Auth / users** — roles CNI (ADR-0003).
6. **CI/CD** — lint, build, tests en pipeline.
7. **Producción** — env, TLS, despliegue `crm.cni.hn`.

---

## Cómo levantar el entorno completo

```bash
# Plataforma principal
docker compose up -d
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1/ |
| Django Admin | http://localhost:8000/admin/ |

---

## Referencias

- Progreso detallado: [`ai-workspace/context/03-current-progress.md`](../ai-workspace/context/03-current-progress.md)
- Backlog: [`ai-workspace/tasks/backlog.md`](../ai-workspace/tasks/backlog.md)
- Changelog: [`ai-workspace/changelog/CHANGELOG.md`](../ai-workspace/changelog/CHANGELOG.md)
- API: [`docs/api/01-api-roadmap.md`](api/01-api-roadmap.md)
- CRM: [Contrato con cni-crm](integrations/cni-crm-intake.md)
