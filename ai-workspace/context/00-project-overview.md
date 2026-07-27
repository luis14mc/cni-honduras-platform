# 00 · Project Overview

## ¿Qué es?
**CNI Honduras Platform** es la plataforma web del Consejo Nacional de Inversiones (CNI) de Honduras. Presenta al país como destino de inversión, sectores, oportunidades, mapa territorial, trámites y contacto para inversionistas nacionales e internacionales.

## Componentes principales

| Carpeta | Rol |
|---------|-----|
| **frontend/** | Next.js 16, React 19, Tailwind 4, Leaflet. Sitio público bilingüe es/en. |
| **backend/** | Django 5 + DRF + GeoDjango + PostGIS. API v1, CMS, formularios, webhooks. |
| **crm/** | SuiteCRM 8+ (SIGI CNI). Stack Docker independiente. |
| **automation/n8n/** | Orquestación formularios → CRM. |
| **database/** | Init PostGIS. |
| **docker-compose.yml** | db + backend + frontend (desarrollo). |
| **ai-workspace/** | Contexto para IA y desarrolladores. |
| **docs/** | Arquitectura, API, roadmap, estado del proyecto. |

## Audiencia del producto
- Inversionistas nacionales e internacionales.
- Equipo CNI (contenido, seguimiento comercial, operaciones).

## Audiencia de esta documentación
Asistentes de IA (Cursor, Codex, etc.) y desarrolladores. Contexto accionable sin leer todo el código.

## Estado (2026-06-19)
- **Frontend**: UI avanzada; mapa, sectores, portafolio y prensa conectados a API.
- **Backend**: API v1 operativa (geo, investment, cms, forms, integrations).
- **CRM**: SuiteCRM local configurado (SIGI CNI); integración vía n8n en preparación.
- Ver logros: [`docs/00-project-status-and-achievements.md`](../../docs/00-project-status-and-achievements.md)

## Cómo levantar

```bash
# Plataforma principal
docker compose up -d

# URLs
# frontend:  http://localhost:3000
# backend:   http://localhost:8000/api/v1/
# admin:     http://localhost:8000/admin/

# Opcional — SuiteCRM
cd crm && docker compose -f docker-compose.suitecrm.yml up -d
# http://localhost:8085

# Opcional — n8n
cd automation/n8n && docker compose -f docker-compose.n8n.yml up -d
# http://localhost:5678
```
