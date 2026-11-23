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

## Integración con el CRM
- Django persiste `WebhookEvent` y `process_webhook_events` lo entrega a `cni-crm`.

## Datos
- **PostgreSQL 15 + PostGIS 3.4** (plataforma).

## Infra / Dev
- Compose raíz: `db`, `backend` (8000), `frontend` (3000).
- Frontend: **pnpm** / npm.

## Convenciones
No actualizar dependencias sin pedido explícito.
