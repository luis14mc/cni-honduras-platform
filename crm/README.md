# SuiteCRM — servicio separado CNI

SuiteCRM es el **CRM del Consejo Nacional de Inversiones (CNI)**. Vive en esta carpeta (`crm/`) como **servicio independiente**: no forma parte de Django (`backend/`) ni de Next.js (`frontend/`).

## Principios

| Aspecto | Decisión |
|---------|----------|
| Dominio futuro | `crm.cni.hn` |
| Base de datos | **MariaDB** dedicada (no comparte PostGIS con Django) |
| Integración con la plataforma | **n8n**, webhooks y API REST de SuiteCRM |
| Código fuente | Se descarga y descomprime **localmente** en `crm/suitecrm/` |
| Git | **No** subir credenciales, `.env`, ZIPs ni datos persistentes |

## Estructura

```
crm/
├── README.md
├── .env.example          # Plantilla de variables (copiar a .env)
├── .gitignore
├── docker-compose.suitecrm.yml
├── php/Dockerfile        # Imagen PHP 8.2 personalizada (extensiones SuiteCRM)
├── apache/               # Configuración Apache para el contenedor app
├── docs/                 # Guías de setup, módulos e integración
├── scripts/              # Checklist y permisos locales
├── suitecrm/             # Código SuiteCRM (local, ignorado por Git)
├── mariadb/              # Datos MariaDB (local, ignorado por Git)
└── ...
```

## Instalación local (resumen)

1. **Descargar SuiteCRM** desde [suitecrm.com](https://suitecrm.com/) (versión compatible con PHP 8.2).
2. **Descomprimir** el contenido en `crm/suitecrm/` (esta carpeta está en `.gitignore`).
3. **Configurar entorno:**
   ```bash
   cd crm
   cp .env.example .env
   # Editar .env con contraseñas seguras (no commitear .env)
   bash scripts/check-suitecrm-files.sh
   bash scripts/fix-suitecrm-permissions.sh   # Linux/WSL
   ```
4. **Levantar servicios** (la primera vez construye la imagen PHP desde `php/Dockerfile`):
   ```bash
   docker compose -f docker-compose.suitecrm.yml up -d --build
   docker exec -it cni-suitecrm-app php -m | grep intl   # debe mostrar intl
   docker exec -it cni-suitecrm-app apache2ctl -S   # DocumentRoot → /var/www/html/public
   ```
5. **Abrir en el navegador:**
   ```
   http://localhost:8085
   ```
   (o el puerto definido en `SUITECRM_PORT` dentro de `.env`).

6. Completar el **asistente de instalación** de SuiteCRM apuntando a la base MariaDB del compose (`suitecrm-db`).

SuiteCRM 8+ sirve la aplicación desde `suitecrm/public/`; Apache local está configurado con **DocumentRoot `/var/www/html/public`** (ver `apache/vhost.conf`).

Guía detallada: [docs/01-suitecrm-setup.md](docs/01-suitecrm-setup.md).

Validación local y checklist: [docs/04-suitecrm-local-validation.md](docs/04-suitecrm-local-validation.md).

## Integración con la plataforma web

La plataforma **no** escribe directamente en SuiteCRM desde Django ni Next.js. El flujo previsto:

```
Formulario web → Django → WebhookEvent → process_webhook_events → n8n → SuiteCRM
```

Detalle: [docs/03-suitecrm-integration-flow.md](docs/03-suitecrm-integration-flow.md).

Mapeo de módulos CRM: [docs/02-suitecrm-modules-cni.md](docs/02-suitecrm-modules-cni.md).

## Configuración operativa SIGI CNI

Documentación para la primera configuración manual del CRM (después del instalador web):

| Documento | Contenido |
|-----------|-----------|
| [docs/05-suitecrm-cni-configuration.md](docs/05-suitecrm-cni-configuration.md) | Identidad SIGI CNI, módulos, usuarios, principios |
| [docs/06-suitecrm-custom-fields.md](docs/06-suitecrm-custom-fields.md) | Campos personalizados Accounts, Contacts, Opportunities |
| [docs/07-suitecrm-pipeline-stages.md](docs/07-suitecrm-pipeline-stages.md) | Ciclo de vida, Lead Status, etapas de proyecto |

## Qué no subir a Git

- `crm/.env` (credenciales reales)
- `crm/suitecrm/` (código descargado)
- `crm/mariadb/`, `crm/data/`, `crm/uploads/`, `crm/cache/`
- Archivos `*.zip`, `*.tar.gz` del instalador

## Relación con el monorepo

- `docker-compose.yml` en la raíz levanta **db PostGIS, backend Django y frontend Next.js**.
- `crm/docker-compose.suitecrm.yml` levanta **solo SuiteCRM + MariaDB**.
- Los stacks pueden correr en paralelo en desarrollo sin mezclar bases de datos.

## Próximos pasos (referencia)

- [ ] Descargar e instalar SuiteCRM en `crm/suitecrm/`
- [ ] Configurar SIGI CNI según [docs/05-suitecrm-cni-configuration.md](docs/05-suitecrm-cni-configuration.md)
- [ ] Crear campos y pipelines: [docs/06](docs/06-suitecrm-custom-fields.md), [docs/07](docs/07-suitecrm-pipeline-stages.md)
- [ ] Conectar n8n con el webhook `N8N_PROJECT_APPLICATION_WEBHOOK_URL` (backend)
- [ ] Desplegar en `crm.cni.hn` con TLS y backups de MariaDB
