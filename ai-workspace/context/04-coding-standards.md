# 04 · Coding Standards

## Principios generales
- No romper lo existente. Cambios mínimos y enfocados.
- No actualizar dependencias ni crear migraciones sin pedido explícito.
- No mover `frontend/` ni `backend/`, ni tocar `docker-compose.yml` salvo solicitud.

## Frontend
- **TypeScript estricto**. Tipar props y datos de API.
- Componentes en `src/components`; lógica reusable en `src/lib`.
- Estilos con **Tailwind 4**; combinar clases con `clsx` / `tailwind-merge`.
- Texto y copy mediante el sistema i18n (`src/i18n`, `src/messages`). No hardcodear strings visibles.
- Rutas siempre bajo `[locale]`; usar helpers de `src/config/siteNavigation` (`resolveHref`, `withLocale`, etc.).
- Lint: `pnpm run lint` (eslint + eslint-config-next). Sin warnings nuevos.
- Sin comentarios que narren código obvio.

## Backend
- Seguir estilo Django/DRF estándar. PEP 8.
- Apps autocontenidas en `backend/apps/<app>`: `models.py`, `serializers.py`, `views.py`, `api_urls.py`.
- Endpoints REST bajo `api/<app>/`. Vistas basadas en clases (CBV) como en `geo`.
- GeoDjango para datos espaciales (PostGIS).
- Migraciones solo cuando se solicite explícitamente.

## Git / commits
- Commits pequeños y descriptivos. No commitear secretos.
- No crear commits salvo que el usuario lo pida.

## Naming
- Frontend: `camelCase` (vars), `PascalCase` (componentes/tipos), `kebab-case` (rutas/archivos de página).
- Backend: `snake_case` (Python), `PascalCase` (modelos/serializers).
