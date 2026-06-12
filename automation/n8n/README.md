# n8n Local Automation

Entorno local de n8n para orquestar integraciones entre Django y SuiteCRM.

## Requisitos

- Docker y Docker Compose.
- SuiteCRM local disponible en `http://localhost:8085`.
- Backend Django con `WebhookEvent` y el comando `process_webhook_events`.

## Levantar n8n

```bash
cd automation/n8n
cp .env.example .env
docker compose -f docker-compose.n8n.yml up -d
```

n8n quedará disponible en:

```text
http://localhost:5678
```

## Detener n8n

```bash
cd automation/n8n
docker compose -f docker-compose.n8n.yml down
```

Los datos locales de n8n se guardan en el volumen Docker `n8n_data`. No se debe versionar `.env` ni exportaciones con credenciales reales.

## Variables principales

| Variable | Uso |
|----------|-----|
| `N8N_PORT` | Puerto local expuesto para n8n. Por defecto `5678`. |
| `N8N_HOST` | Host público local usado por n8n. Por defecto `localhost`. |
| `N8N_PROTOCOL` | Protocolo local. Por defecto `http`. |
| `N8N_TIMEZONE` | Zona horaria de ejecuciones. Debe ser `America/Tegucigalpa`. |
| `SUITECRM_BASE_URL` | URL de SuiteCRM vista desde el contenedor n8n. |
| `SUITECRM_CLIENT_ID` | Cliente OAuth/API de SuiteCRM cuando se configure. |
| `SUITECRM_CLIENT_SECRET` | Secreto OAuth/API de SuiteCRM cuando se configure. |
| `DJANGO_WEBHOOK_TOKEN` | Token compartido para validar llamadas desde Django cuando se active autenticación del webhook. |

## Webhook esperado

El primer workflow debe iniciar con un nodo **Webhook**:

```text
POST /webhook/project-application
```

URL local esperada:

```text
http://localhost:5678/webhook/project-application
```

En Django, la variable que debe apuntar a esta URL es:

```text
N8N_PROJECT_APPLICATION_WEBHOOK_URL=http://localhost:5678/webhook/project-application
```

## Flujo previsto

1. El sitio público crea una `ProjectApplication`.
2. Django crea un `WebhookEvent` pendiente.
3. El comando `process_webhook_events` envía el evento a n8n.
4. n8n transforma el payload al formato de SuiteCRM.
5. n8n crea o actualiza registros en SuiteCRM.
6. Django marca el `WebhookEvent` como procesado si n8n responde con HTTP 2xx.

Ver detalle en `docs/integrations/django-n8n-suitecrm-flow.md`.
