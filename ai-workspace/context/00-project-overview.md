# 00 · Project Overview

## ¿Qué es?
**CNI Honduras Platform** es la plataforma web del Consejo Nacional de Inversiones (CNI) de Honduras. Su objetivo es presentar al país como destino de inversión, mostrar oportunidades, sectores, datos geográficos por departamento y guiar al inversionista a través de trámites y contacto.

## Componentes principales
- **frontend/** — Aplicación Next.js 16 (App Router, React 19, Tailwind 4, Leaflet). Sitio público bilingüe (es/en).
- **backend/** — API y CMS en Django 5 + DRF + GeoDjango sobre PostGIS. Apps: `cms`, `geo`, `investment`, `media_library`, `users`, `core`.
- **database/** — Inicialización y datos de PostGIS.
- **docker/** + **docker-compose.yml** — Orquestación de `db` (PostGIS), `backend` y `frontend`.

## Audiencia del producto
- Inversionistas nacionales e internacionales.
- Equipo CNI que administra contenido vía CMS.

## Audiencia de esta documentación
Asistentes de IA (Cursor, Codex, Claude Code, Antigravity) y desarrolladores humanos. La meta es dar contexto rápido, claro y accionable sin tener que leer todo el código.

## Estado
Plataforma en desarrollo activo. El frontend tiene la estructura de páginas y diseño avanzados; el backend expone endpoints iniciales de `cms` y `geo`.

## Cómo levantar
```bash
docker compose up
# frontend: http://localhost:3000
# backend:  http://localhost:8000
# admin:    http://localhost:8000/admin/
```
