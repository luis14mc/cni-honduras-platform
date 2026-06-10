# 02 · Technical Stack

## Frontend (`frontend/`)
- **Next.js 16.1.6** (App Router, `--webpack` en dev).
- **React 19.2** / **React DOM 19.2**.
- **TypeScript 5**.
- **Tailwind CSS 4** (`@tailwindcss/postcss`).
- **Leaflet 1.9** + **react-leaflet 5** (mapa por departamentos).
- **framer-motion 12**, **lucide-react**, **clsx**, **tailwind-merge**, **zod**, **sharp**.
- i18n propio en `src/i18n` (locales `es`, `en`; default `es`). Rutas bajo `src/app/[locale]`.
- Navegación y rewrites en `src/config` (`siteNavigation`, `routeRewrites`, `pageSeo`).
- Middleware en `src/middleware.ts` (locale + redirecciones legacy).

## Backend (`backend/`)
- **Django 5** + **Django REST Framework**.
- **GeoDjango** sobre **PostGIS**.
- Settings por entorno: `config.settings.development` (ver docker-compose).
- Apps en `backend/apps/`: `cms`, `geo`, `investment`, `media_library`, `users`, `core`.
- URLs raíz en `config/urls.py`:
  - `api/cms/` → `apps.cms.api_urls`
  - `api/geo/` → `apps.geo.api_urls`
- Requirements divididos: `requirements/dev.txt`, `requirements/prod.txt`.

## Datos
- **PostgreSQL 15 + PostGIS 3.4** (`postgis/postgis:15-3.4`).
- `DATABASE_URL=postgis://cni_user:cni_pass@db:5432/cni_db`.

## Infra / Dev
- **docker-compose.yml**: servicios `db`, `backend` (8000), `frontend` (3000).
- Gestor de paquetes frontend: **pnpm**.

## Convenciones de versiones
No actualizar dependencias sin pedido explícito. Respetar versiones fijadas en `package.json` y `requirements/`.
