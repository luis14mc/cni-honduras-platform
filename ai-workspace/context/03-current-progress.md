# 03 · Current Progress

> Snapshot al crear el ai-workspace. Actualizar a medida que avanza el proyecto.

## Hecho
- Estructura de **frontend** Next.js 16 con App Router y todas las rutas públicas creadas bajo `src/app/[locale]`.
- Sistema **i18n** propio (es/en) con navegación, rewrites y SEO en `src/config`.
- Diseño avanzado (Tailwind 4, framer-motion, copy en `src/i18n/copy`).
- **Mapa** con Leaflet / react-leaflet.
- Backend Django con apps `cms`, `geo`, `investment`, `media_library`, `users`, `core`.
- Endpoints iniciales: `api/cms/` y `api/geo/` (departamentos: list + detail).
- Docker Compose operativo (`db` PostGIS, `backend`, `frontend`).

## En progreso / parcial
- App `investment` existe pero sin `models.py` aún (solo `apps.py`).
- CMS: alcance de modelos y endpoints por consolidar.
- Integración frontend ↔ backend (consumo de API) por formalizar.

## Pendiente (alto nivel)
- Definir modelos y API de `investment`.
- Mapa de contenido CMS y media_library.
- Conexión CRM (ver `06-crm-context.md` y `docs/crm/`).
- Autenticación/roles en `users`.

## Notas
- No hay endpoints expuestos para `investment`, `users`, `media_library` todavía.
- Confirmar estado real ejecutando `docker compose up` antes de asumir.
