# 01 · SuiteCRM setup local

Guía para levantar SuiteCRM en desarrollo dentro de `crm/`, separado del stack principal de la plataforma CNI.

## Requisitos

- Docker y Docker Compose
- ~2 GB de espacio libre (código + base de datos)
- SuiteCRM descargado (ZIP oficial) — **no** commitear el archivo

## Paso 1 — Obtener SuiteCRM

1. Descargar la versión estable compatible con PHP 8.2 desde el sitio oficial.
2. Descomprimir el contenido en:
   ```
   crm/suitecrm/
   ```
3. Verificar que exista `crm/suitecrm/public/index.php` (SuiteCRM 8+).

> La carpeta `suitecrm/` está en `.gitignore`. Cada desarrollador la genera localmente.

## Paso 2 — Variables de entorno

```bash
cd crm
cp .env.example .env
```

Editar `.env` con valores seguros:

| Variable | Descripción | Ejemplo dev |
|----------|-------------|-------------|
| `SUITECRM_DOMAIN` | Hostname local / futuro prod | `crm.localhost` |
| `SUITECRM_DB_NAME` | Nombre de la base | `suitecrm` |
| `SUITECRM_DB_USER` | Usuario MariaDB | `suitecrm_user` |
| `SUITECRM_DB_PASSWORD` | Contraseña usuario app | *(cambiar)* |
| `SUITECRM_DB_ROOT_PASSWORD` | Contraseña root MariaDB | *(cambiar)* |
| `SUITECRM_PORT` | Puerto HTTP local | `8085` |
| `SUITECRM_DB_PORT` | Puerto MariaDB expuesto | `3307` |

**No commitear** el archivo `.env`.

## Paso 3 — Levantar contenedores

```bash
docker compose -f docker-compose.suitecrm.yml up -d
```

Servicios:

| Servicio | Imagen | Puerto |
|----------|--------|--------|
| `suitecrm-db` | `mariadb:10.11` | `${SUITECRM_DB_PORT}` → 3306 |
| `suitecrm-app` | `php:8.2-apache` *(temporal)* | `${SUITECRM_PORT}` → 80 |

El contenedor `suitecrm-app` monta `./suitecrm` en `/var/www/html` y usa `apache/vhost.conf`.

## Paso 4 — Instalador web

Abrir:

```
http://localhost:8085
```

(o el valor de `SUITECRM_PORT`).

Datos de conexión a base de datos en el asistente:

| Campo | Valor (desde el host Docker) |
|-------|------------------------------|
| Host | `suitecrm-db` *(desde el contenedor app)* o `127.0.0.1` si conectas desde fuera |
| Puerto | `3306` *(interno)* |
| Base de datos | valor de `SUITECRM_DB_NAME` |
| Usuario | valor de `SUITECRM_DB_USER` |
| Contraseña | valor de `SUITECRM_DB_PASSWORD` |

## Paso 5 — Verificación

- [ ] Login en SuiteCRM funciona
- [ ] MariaDB persiste datos en `crm/mariadb/` (ignorado por Git)
- [ ] No hay credenciales en el repositorio

## Producción (`crm.cni.hn`)

Para producción se recomienda:

- Dominio dedicado con TLS (`crm.cni.hn`)
- Imagen o despliegue revisado (evaluar imagen oficial SuiteCRM cuando aplique)
- Backups automáticos de MariaDB
- Secrets en gestor de secretos (no en `.env` en el repo)
- Reverse proxy (nginx/Traefik) delante de Apache

## Troubleshooting

| Problema | Posible causa |
|----------|----------------|
| 403 / página en blanco | `suitecrm/` vacío o `DocumentRoot` incorrecto |
| Error de conexión DB | `suitecrm-db` no healthy; revisar `.env` |
| Puerto en uso | Cambiar `SUITECRM_PORT` en `.env` |

## Referencias

- [02-suitecrm-modules-cni.md](02-suitecrm-modules-cni.md) — módulos CRM
- [03-suitecrm-integration-flow.md](03-suitecrm-integration-flow.md) — flujo con Django/n8n
