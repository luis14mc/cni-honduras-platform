# 02 · Technical Stack

## Frontend (`frontend/`)
- **Next.js 16.1.6** (App Router).
- **React 19.2** / **TypeScript 5**.
- **Tailwind CSS 4**.
- **Leaflet 1.9** + **react-leaflet 5** (mapa departamental).
- **framer-motion**, **lucide-react**, **zod**, **sharp**.
- i18n propio (`src/i18n`), locales `es` / `en`.
- API client: `src/lib/api.ts` → `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`).
- Middleware locale + rewrites en `src/config`.

## Backend (`backend/`)
- **Django 5** + **DRF** + **GeoDjango** + **PostGIS**.
- Settings: `config.settings.development` (docker-compose).
- Apps: `cms`, `geo`, `investment`, `forms`, `integrations`, `media_library`, `users`, `core`.
- URLs:
  - **`/api/v1/`** → `config/api_v1.py` (preferido)
  - Legacy: `/api/cms/`, `/api/geo/`
- Requirements: `requirements/dev.txt`, `requirements/prod.txt`.

## CRM (`crm/`)
- **SuiteCRM 8+** (PHP 8.2 + Apache, MariaDB 10.11).
- Compose: `crm/docker-compose.suitecrm.yml`.
- Customización SIGI CNI vía `custom/Extension` + scripts shell.

## Automatización (`automation/n8n/`)
- **n8n** en Docker; webhook `project-application`.
- Django: `WebhookEvent` + `process_webhook_events`.

## Datos
- **PostgreSQL 15 + PostGIS 3.4** (plataforma).
- **MariaDB** (SuiteCRM, separada).

## Infra / Dev
- Compose raíz: `db`, `backend` (8000), `frontend` (3000).
- Frontend: **pnpm** / npm.

## Convenciones
No actualizar dependencias sin pedido explícito.
