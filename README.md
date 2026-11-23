# CNI Honduras Platform

Monorepo de la plataforma web del **Consejo Nacional de Inversiones (CNI)** de Honduras: sitio público bilingüe, API geoespacial, módulo de inversión, formularios integrados con el servicio externo `cni-crm`.

> **Estado y logros:** [`docs/00-project-status-and-achievements.md`](docs/00-project-status-and-achievements.md)

## Estructura

```
cni-honduras-platform/
├── frontend/          # Next.js 16, React 19, Tailwind 4, Leaflet
├── backend/           # Django 5, DRF, GeoDjango, PostGIS
├── ai-workspace/      # Contexto para IA y desarrolladores
├── docs/              # Arquitectura, API, roadmap
└── docker-compose.yml # db + backend + frontend
```

## Inicio rápido

```bash
# Plataforma principal
docker compose up -d

# Frontend:  http://localhost:3000
# API v1:    http://localhost:8000/api/v1/
# Admin:     http://localhost:8000/admin/
```

### Desarrollo local (sin Docker)

```bash
# Backend
cd backend && source venv/bin/activate
python manage.py migrate && python manage.py runserver

# Frontend
cd frontend && npm run dev
```

## API v1 (resumen)

| Dominio | Ejemplos |
|---------|----------|
| Geo | `/api/v1/geo/departments/`, `/municipalities/?department=` |
| Investment | `/api/v1/investment/sectors/`, `/projects/`, `/map-summary/` |
| CMS | `/api/v1/cms/news/` |
| Forms | `POST /api/v1/forms/project-application/` |

Detalle: [`docs/api/01-api-roadmap.md`](docs/api/01-api-roadmap.md)

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/00-project-status-and-achievements.md`](docs/00-project-status-and-achievements.md) | **Avances y logros** |
| [`ai-workspace/context/`](ai-workspace/context/) | Contexto técnico y de negocio |
| [`docs/architecture/`](docs/architecture/) | Arquitectura de solución |
| [`docs/roadmap/`](docs/roadmap/) | Roadmap 4 meses |
| [Contrato con cni-crm](docs/integrations/cni-crm-intake.md) | Entrega de formularios al CRM |

## Qué no commitear

- `backend/.env`
- Credenciales, ZIPs de instaladores, `Zone.Identifier`

## Repositorio

https://github.com/luis14mc/cni-honduras-platform
