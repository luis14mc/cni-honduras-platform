# Solution Architecture

## Visión general
Plataforma web del CNI Honduras: frontend público (Next.js) + backend API/CMS (Django + PostGIS), orquestados con Docker Compose.

## Diagrama lógico
```
                 ┌─────────────────────────┐
  Inversionista  │  Frontend Next.js 16     │
  ───────────▶   │  React 19 / Tailwind 4   │
                 │  i18n es/en · Leaflet    │
                 └───────────┬─────────────┘
                             │ HTTP /api/*
                             ▼
                 ┌─────────────────────────┐
                 │  Backend Django 5 + DRF  │
                 │  GeoDjango · apps por    │
                 │  dominio                 │
                 └───────────┬─────────────┘
                             │ ORM / GeoQuerySet
                             ▼
                 ┌─────────────────────────┐
                 │  PostgreSQL 15 + PostGIS │
                 └─────────────────────────┘
```

## Componentes
| Componente | Tecnología | Puerto | Responsabilidad |
|------------|------------|--------|-----------------|
| frontend   | Next.js 16 / React 19 | 3000 | UI pública bilingüe, mapa, formularios |
| backend    | Django 5 / DRF / GeoDjango | 8000 | API REST, CMS, lógica de dominio |
| db         | PostGIS 15-3.4 | 5432 | Persistencia + geometrías |

## Dominios backend (apps)
- `cms` — contenido editable. Endpoints en `/api/cms/`.
- `geo` — departamentos y datos espaciales. Endpoints en `/api/geo/`.
- `investment` — oportunidades de inversión (modelos por definir).
- `media_library` — gestión de medios.
- `users` — usuarios y roles.
- `core` — utilidades transversales.

## Flujo de datos (ejemplo: mapa)
1. Frontend solicita `GET /api/geo/departments/`.
2. Backend serializa departamentos (geometría PostGIS → GeoJSON).
3. Leaflet renderiza el mapa interactivo.

## Integraciones futuras
- **CRM (SuiteCRM)**: leads/opportunities desde formularios. Ver `docs/crm/`.

## Entornos
- **Dev**: Docker Compose, settings `config.settings.development`, CORS a `localhost:3000`.
- **Prod**: por definir (variables seguras, `requirements/prod.txt`).

## Decisiones
Registradas como ADR en `ai-workspace/decisions/`.
