# 05 · API Conventions

## Base
- Prefijo versionado: `/api/v1/` (agregador en `config/api_v1.py`). **Usar este para nuevo desarrollo.**
- Por app bajo v1: `/api/v1/<app>/`
  - `/api/v1/cms/` · `/api/v1/geo/` · `/api/v1/investment/` · `/api/v1/forms/` · `/api/v1/integrations/`
- **Legacy (no eliminar)**: `/api/cms/` y `/api/geo/` se mantienen por compatibilidad.
- Cada app expone un `router` (DRF `DefaultRouter`) o `urlpatterns` en su `api_urls.py`. `investment`, `forms` e `integrations` tienen routers placeholder listos para registrar viewsets.

## Patrón de rutas (ejemplo real: geo)
```
GET /api/geo/departments/            → DepartmentListView   (lista)
GET /api/geo/departments/<slug>/     → DepartmentDetailView (detalle por slug)
```
- Listas: ruta en plural (`departments/`).
- Detalle: identificado por **slug** (`<slug:slug>/`), no por id, cuando aplique.
- Vistas basadas en clases de DRF (`ListView` / `DetailView` style).

## Convenciones recomendadas
- Respuestas JSON. Serializers DRF por recurso.
- Nombres de rutas (`name=`) con prefijo de app: `geo-department-list`.
- Paginación DRF para listas grandes.
- Datos geográficos: GeoJSON cuando el cliente (Leaflet) lo requiera.
- Idioma: el contenido bilingüe se resuelve por campos o parámetro; documentar al consolidar CMS.

## Errores
- Usar códigos HTTP estándar (200, 201, 400, 404, 422, 500).
- Cuerpo de error JSON consistente: `{ "detail": "..." }` (estilo DRF).

## CORS / CSRF
- CORS permitido a `http://localhost:3000` y `http://127.0.0.1:3000` en dev (ver docker-compose).

## Pendiente de definir
- API de `investment`, `media_library`, `users`.
- Autenticación (token/session) y permisos por rol.
