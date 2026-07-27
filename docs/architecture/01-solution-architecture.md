# Solution Architecture

> Última actualización: 2026-06-19

## Visión general
Plataforma web del CNI Honduras: frontend público (Next.js) + backend API/CMS (Django + PostGIS) + CRM (SuiteCRM) + orquestación (n8n), con stacks Docker separados en desarrollo.

## Diagrama lógico

```
  Inversionista
       │
       ▼
┌──────────────────────────┐
│  Frontend Next.js 16      │  :3000
│  i18n es/en · Leaflet     │
└────────────┬─────────────┘
             │ HTTP /api/v1/*
             ▼
┌──────────────────────────┐
│  Backend Django 5 + DRF   │  :8000
│  GeoDjango · forms ·       │
│  WebhookEvent              │
└─────┬──────────────┬───────┘
      │              │
      ▼              ▼ (process_webhook_events)
┌─────────────┐  ┌─────────────┐
│ PostGIS 15  │  │ n8n :5678   │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ SuiteCRM    │  :8085
                 │ MariaDB     │
                 └─────────────┘
```

## Componentes

| Componente | Tecnología | Puerto | Responsabilidad |
|------------|------------|--------|-----------------|
| frontend | Next.js 16 / React 19 | 3000 | UI pública, mapa, formularios |
| backend | Django 5 / DRF / GeoDjango | 8000 | API v1, CMS, webhooks |
| db | PostGIS 15-3.4 | 5432 | Datos plataforma + geometrías |
| suitecrm-app | PHP 8.2 + Apache | 8085 | CRM SIGI CNI |
| suitecrm-db | MariaDB 10.11 | 3307 | Datos CRM |
| n8n | n8n | 5678 | Integración formularios → CRM |

## Dominios backend (apps)

| App | Estado | API v1 |
|-----|--------|--------|
| `geo` | ✅ Completo | departments, regions, municipalities |
| `investment` | ✅ Completo | sectors, opportunities, projects, success-stories, map-summary |
| `cms` | ⚡ Parcial | pages, news, documents |
| `forms` | ⚡ Parcial | 4 tipos POST; 1 wired frontend |
| `integrations` | ⚡ Parcial | webhook-events, logs; processor command |
| `media_library` | 🔲 Admin only | — |
| `users` | 🔲 Stub | — |
| `core` | 🔲 Stub | — |

## Flujos clave

### Mapa interactivo
1. Frontend: `GET /api/v1/geo/departments/` + `GET /api/v1/investment/map-summary/`.
2. Backend serializa geometrías PostGIS → GeoJSON.
3. Leaflet renderiza polígonos; sidebar muestra agregados por departamento.

### Postulación de proyecto
1. `POST /api/v1/forms/project-application/`.
2. Persistencia + `WebhookEvent` (`project_application.created`).
3. `python manage.py process_webhook_events` → n8n → SuiteCRM (pendiente E2E).

## Integraciones
- **CRM**: desacoplado vía n8n. Ver `docs/integrations/django-n8n-suitecrm-flow.md`.
- **SuiteCRM local**: `crm/` — SIGI CNI scripts y docs.

## Entornos
- **Dev**: Docker Compose × 3 stacks opcionales; CORS localhost:3000.
- **Prod**: por definir (TLS, secrets, `crm.cni.hn`).

## Decisiones
- ADR-0001: [`ai-workspace/decisions/ADR-0001-current-architecture.md`](../../ai-workspace/decisions/ADR-0001-current-architecture.md)
- Pendiente: ADR-0002 (CRM), ADR-0003 (auth).

## Estado del proyecto
[`docs/00-project-status-and-achievements.md`](../00-project-status-and-achievements.md)
