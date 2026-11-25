# Despliegue en Railway

Un proyecto con entornos `staging` y `production`. Cada entorno tiene Django, cron, Strapi y Next, con dos bases privadas independientes. Producción también tiene Umami y su propia base. Cada entorno utiliza un par independiente de buckets en Cloudflare R2.

## Ramas de despliegue

| Rama | Entorno Railway | Cómo se promueve |
| --- | --- | --- |
| `master` | Integración y CI | PR de feature auditado |
| `testing` | `staging` · `test.cni.hn` | PR de `master` hacia `testing` |
| `production` | `production` · `cni.hn` | PR de `testing` hacia `production`, con el smoke de staging en verde y aprobación del CNI |

En cada servicio de código fuente (`backend`, `cron-crm`, `cms` y `frontend`), seleccione `testing` como rama de despliegue en staging y `production` en producción. Habilite autodeploy y **Wait for CI** en ambos entornos. Los servicios basados en plantillas conservan su propia fuente. Durante la adopción del flujo, confirme que cada primer merge de promoción incorpora el workflow actualizado y que Railway espera la CI del commit posterior al merge. [Configuración de autodeploy en Railway](https://docs.railway.com/deployments/github-autodeploys).

Proteja `testing` y `production` en GitHub con PR y CI obligatorios y bloqueo de pushes directos. Exija como mínimo una aprobación humana en `production`. Las promociones entre ramas permanentes conservan la historia con merge commits. [Decisión del PO en el #91](https://github.com/luis14mc/cni-honduras-platform/issues/91#issuecomment-7143751224).

## Servicios y ajustes de Railway

Los servicios de aplicación usan Dockerfiles. Configure los campos de la tabla en Settings de cada servicio. Railway retiró el soporte para configurar servicios nuevos con `railway.json`. Los Dockerfiles siguen siendo la fuente del build. [Documentación de Railway sobre Config as Code](https://docs.railway.com/config-as-code).

| Servicio | Fuente y raíz | Start Command | Pre-deploy Command | Healthcheck |
| --- | --- | --- | --- | --- |
| `db-geo` | Plantilla PostGIS, PostgreSQL 16, volumen persistente | Plantilla | — | `pg_isready` y `SELECT PostGIS_Version()` desde la red privada |
| `backend` | GitHub, `/`, `docker/backend/Dockerfile` | `sh -c 'exec gunicorn config.wsgi:application --bind "0.0.0.0:$PORT"'` | `python manage.py migrate --noinput` | `/health/`, 120 s |
| `cron-crm` | GitHub, `/`, el mismo Dockerfile de Django | `python manage.py process_webhook_events` | — | Revisar ejecución, salida y entrega en CRM |
| `db-strapi` | Plantilla PostgreSQL, volumen persistente | Plantilla | — | `pg_isready` desde la red privada |
| `cms` | GitHub, `/cms-strapi`, `Dockerfile` | CMD del Dockerfile | — | `/_health`, 180 s, devuelve HTTP 204 |
| `frontend` | GitHub, `/frontend`, `Dockerfile` | CMD del Dockerfile | — | `/`, 120 s |
| `db-umami` | PostgreSQL de la plantilla Umami, solo producción | Plantilla | — | `pg_isready` desde la red privada |
| `umami` | Plantilla oficial de Umami, 3.2 o posterior, solo producción | Plantilla | — | `/api/heartbeat`, 120 s |

Configure `cron-crm` con `*/5 * * * *` (UTC), Restart Policy **Never**, sin puerto público ni healthcheck HTTP. Confirme que el proceso termina dentro del intervalo en pruebas. El puerto de destino de cada dominio público es el `PORT` indicado en las variables. Los tres PostgreSQL usan red privada, sin TCP proxy público. Compruebe que el PostGIS elegido exporta `DATABASE_URL` y que la base permite usar la extensión.

## Variables

Los valores entre ángulos se obtienen en Railway, Cloudflare, Strapi, CRM o Search Console. Genere las claves de cada entorno por separado y guárdelas en Railway. Las referencias `${{servicio.VARIABLE}}` se resuelven dentro del entorno activo. Configure primero las bases con las credenciales generadas por sus plantillas y sus volúmenes. Las aplicaciones consumen la variable privada `DATABASE_URL` que exporta cada base. Las plantillas gestionan `POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD`. Use nombres de base `cni_geo`, `cni_strapi` y `cni_umami` respectivamente si se crean desde cero y conserve los valores de la plantilla cuando importe una base existente.

### backend

Genere una clave de Django distinta en cada entorno con `python -c "import secrets; print(secrets.token_urlsafe(64))"` y guárdela en `DJANGO_SECRET_KEY` de Railway. Django exige al menos 50 caracteres y rechaza la clave temporal de compilación al arrancar. `DJANGO_ALLOW_BUILD_KEY` se usa únicamente en el paso de compilación de la imagen.

| Variable | staging | production |
| --- | --- | --- |
| `RAILWAY_DOCKERFILE_PATH` | `docker/backend/Dockerfile` | Igual |
| `PORT` | `8000` | Igual |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` | Igual |
| `DJANGO_DEBUG` / `DJANGO_ENABLE_GIS` | `false` / `true` | Igual |
| `DATABASE_URL` | `${{db-geo.DATABASE_URL}}` | Igual |
| `DJANGO_SECRET_KEY` | `<clave Django staging>` | `<clave Django producción>` |
| `DJANGO_ALLOWED_HOSTS` | `api.test.cni.hn,healthcheck.railway.app` | `api.cni.hn,healthcheck.railway.app` |
| `CORS_ALLOWED_ORIGINS` | `https://test.cni.hn` | `https://cni.hn` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `https://test.cni.hn,https://api.test.cni.hn` | `https://cni.hn,https://api.cni.hn` |
| `CORS_ALLOW_CREDENTIALS` / `DJANGO_USE_SECURE_PROXY_HEADERS` / `DJANGO_SECURE_SSL_REDIRECT` | `true` | Igual |
| `DJANGO_SESSION_COOKIE_SAMESITE` / `DJANGO_CSRF_COOKIE_SAMESITE` | `Lax` | Igual |
| `USE_S3_STORAGE` | `true` | Igual |
| `AWS_STORAGE_BUCKET_NAME` | `cni-media-test` | `cni-media-prod` |
| `AWS_S3_CUSTOM_DOMAIN` | `media.test.cni.hn` | `media.cni.hn` |
| `AWS_S3_ENDPOINT_URL` | `<endpoint S3 de R2>` | `<endpoint S3 de R2>` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | `<credencial R2 pública, escritura staging>` | `<credencial R2 pública, escritura producción>` |
| `AWS_S3_REGION_NAME` / `AWS_S3_ADDRESSING_STYLE` | `auto` / `path` | Igual |
| `AWS_QUERYSTRING_AUTH` / `AWS_S3_FILE_OVERWRITE` | `false` | Igual |
| `AWS_DEFAULT_ACL` | Vacía | Igual |
| `GATED_RESOURCE_STRAPI_URL` | `https://cms.test.cni.hn` | `https://cms.cni.hn` |
| `GATED_RESOURCE_STRAPI_TOKEN` | `<token lector de documentos staging>` | `<token lector de documentos producción>` |
| `GATED_RESOURCE_BUCKET` | `cni-private-test` | `cni-private-prod` |
| `GATED_RESOURCE_ENDPOINT` / `GATED_RESOURCE_REGION` | `<endpoint S3 de R2>` / `auto` | Igual |
| `GATED_RESOURCE_ACCESS_KEY` / `GATED_RESOURCE_SECRET_KEY` | `<credencial de solo lectura del bucket privado staging>` | `<credencial de solo lectura del bucket privado producción>` |
| `STRAPI_MIGRATION_URL` / `STRAPI_MIGRATION_TOKEN` (temporales) | `https://cms.test.cni.hn` / `<token de migración staging>` | `https://cms.cni.hn` / `<token de migración producción si corresponde>` |

### cron-crm

| Variable | staging | production |
| --- | --- | --- |
| `RAILWAY_DOCKERFILE_PATH` | `docker/backend/Dockerfile` | Igual |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` | Igual |
| `DATABASE_URL` | `${{db-geo.DATABASE_URL}}` | Igual |
| `DJANGO_SECRET_KEY` | `${{backend.DJANGO_SECRET_KEY}}` | Igual |
| `CNI_CRM_INTAKE_URL` | `<URL HTTPS completa del intake de CRM staging>` | `<URL HTTPS completa del intake de CRM producción>` |
| `CNI_CRM_INTAKE_TOKEN` | `<token Bearer CRM staging>` | `<token Bearer CRM producción>` |

### cms

| Variable | staging | production |
| --- | --- | --- |
| `NODE_ENV` / `HOST` / `PORT` | `production` / `0.0.0.0` / `1337` | Igual |
| `DATABASE_CLIENT` / `DATABASE_SCHEMA` / `DATABASE_SSL` | `postgres` / `public` / `false` (red privada) | Igual |
| `DATABASE_URL` | `${{db-strapi.DATABASE_URL}}` | Igual |
| `APP_KEYS` | `<claves aleatorias separadas por comas para staging>` | `<claves aleatorias separadas por comas para producción>` |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET` | `<un valor aleatorio y distinto para cada variable>` | `<nuevos valores aleatorios y distintos>` |
| `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` / `ADMIN_PATH` | `es` / `/admin` | Igual |
| `STRAPI_PUBLIC_URL` | `https://cms.test.cni.hn` | `https://cms.cni.hn` |
| `STRAPI_PREVIEW_ORIGIN` | `https://test.cni.hn` | `https://cni.hn` |
| `STRAPI_PREVIEW_SECRET` | `<secreto de preview staging>` | `<secreto de preview producción>` |
| `STRAPI_REQUIRE_R2` | `true` | Igual |
| `CF_BUCKET` / `CF_PUBLIC_ACCESS_URL` | `cni-media-test` / `https://media.test.cni.hn` | `cni-media-prod` / `https://media.cni.hn` |
| `CF_ENDPOINT` | `<endpoint S3 de R2>` | `<endpoint S3 de R2>` |
| `CF_ACCESS_KEY_ID` / `CF_ACCESS_SECRET` | `<credencial R2 pública, escritura staging>` | `<credencial R2 pública, escritura producción>` |
| `GATED_RESOURCE_BUCKET` | `cni-private-test` | `cni-private-prod` |
| `GATED_RESOURCE_ENDPOINT` / `GATED_RESOURCE_REGION` | `<endpoint S3 de R2>` / `auto` | Igual |
| `GATED_RESOURCE_ACCESS_KEY` / `GATED_RESOURCE_SECRET_KEY` | `<credencial de escritura del bucket privado staging>` | `<credencial de escritura del bucket privado producción>` |

### frontend

| Variable | staging | production |
| --- | --- | --- |
| `PORT` | `3000` | Igual |
| `NEXT_PUBLIC_SITE_URL` | `https://test.cni.hn` | `https://cni.hn` |
| `NEXT_PUBLIC_API_URL` | `https://api.test.cni.hn/api/v1` | `https://api.cni.hn/api/v1` |
| `NEXT_PUBLIC_CMS_ENV` | `staging` | `production` |
| `NEXT_PUBLIC_MEDIA_HOSTNAME` | `media.test.cni.hn` | `media.cni.hn` |
| `NEXT_PUBLIC_STRAPI_URL` | `/strapi-api` | Igual |
| `STRAPI_URL` / `STRAPI_ORIGIN` | `https://cms.test.cni.hn` | `https://cms.cni.hn` |
| `STRAPI_API_TOKEN` | `<token de lectura editorial y preview staging>` | `<token de lectura editorial y preview producción>` |
| `STRAPI_PREVIEW_SECRET` | `${{cms.STRAPI_PREVIEW_SECRET}}` | Igual |
| `CNI_BANNER_SOURCE` | `django` hasta verificar publicación, luego `strapi` | Mismo criterio |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Sin configurar | `<ID del sitio cni.hn en Umami>` |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | Sin configurar | `https://stats.cni.hn/script.js` |
| `GOOGLE_SITE_VERIFICATION` | Sin configurar | `<valor de Search Console si se usa verificación HTML>` |

Use el origen de cada entorno exactamente como figura en la tabla, sin barra final. Los valores `NEXT_PUBLIC_*`, `STRAPI_ORIGIN` en Next y `STRAPI_PUBLIC_URL` en Strapi están disponibles durante la compilación. Vuelva a compilar al cambiarlos. Los tokens de aplicación y credenciales de almacenamiento se consumen al ejecutar el contenedor.

### umami (solo production)

`PORT=3000`, `DATABASE_URL=${{db-umami.DATABASE_URL}}`, `APP_SECRET=<clave aleatoria de Umami>`. Cambie la contraseña inicial, cree el sitio `cni.hn` y copie el ID al frontend. [Guía de Umami y Search Console](umami-railway.md).

## DNS y almacenamiento

| Nombre en la zona cni.hn | Registro y destino |
| --- | --- |
| `@`, `test` | CNAME al destino que Railway emita para el frontend de su entorno. Cloudflare aplana el CNAME de la raíz. |
| `api`, `api.test` | CNAME al destino emitido para Django por entorno |
| `cms`, `cms.test` | CNAME al destino emitido para Strapi por entorno |
| `stats` | CNAME al destino emitido para Umami en producción |
| `www` | CNAME a `cni.hn` con proxy Cloudflare activo |
| `media`, `media.test` | CNAME gestionado por Cloudflare al conectar `media.cni.hn` a `cni-media-prod` y `media.test.cni.hn` a `cni-media-test` desde R2 |
| Verificación Railway | Un TXT por cada dominio agregado a Railway. Use el nombre y valor exactos que emita ese servicio. |
| Verificación Search Console | TXT de Google en `@` si se verifica la propiedad de dominio |

Para los dominios Railway, empiece con DNS only y confirme certificado TLS antes del corte. Si activa el proxy de Cloudflare, use Full (strict). En Cloudflare cree una Single Redirect con filtro `http.host eq "www.cni.hn"`, destino dinámico `concat("https://cni.hn", http.request.uri.path)`, código **301** y **Preserve query string** habilitado. Los buckets privados `cni-private-test` y `cni-private-prod` quedan con acceso público y `r2.dev` deshabilitados y sin dominios. El endpoint S3 sale del panel R2. Limite cada credencial al bucket y entorno correspondiente. [DNS de Railway](https://docs.railway.com/networking/domains/working-with-domains) · [Dominios de R2](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Orden de despliegue

1. Complete la integración de los sprints 2 y 3 y confirme #93 en `master`. Configure staging primero. Cree las dos bases y los cuatro servicios. Si el entorno reemplaza uno existente, restaure primero una copia de sus datos en las bases de destino y preserve los objetos referenciados. Prepare los dos buckets de staging, las credenciales y el DNS de staging.
2. Despliegue Django y confirme `/health/`. En el contenedor de backend ejecute los comandos siguientes. `import_honduras_geo` ejecuta `import_departments` e `import_municipalities` con el dataset versionado y valida 18 departamentos y 298 municipios. `seed_investment` es solo para desarrollo local y genera casos de demostración.

   ```sh
   python manage.py showmigrations investment
   python manage.py import_honduras_geo
   python manage.py seed_regions
   python manage.py import_territorial_regions
   python manage.py import_strategic_infrastructure
   python manage.py import_road_corridors
   python manage.py import_institutional_links
   python manage.py seed_cms_roles
   python manage.py retire_demo_investment
   python manage.py import_portafolio_cni
   ```

   Confirme `[X] 0011_portfolio_territorial_fields` y que la importación del portafolio terminó antes de compilar Next.
3. Despliegue Strapi y confirme `/_health`, `/api/health` (conectividad de base) y `/admin`. Cree los tokens de lectura y migración en Strapi y cargue sus variables en los servicios correspondientes. En el backend ejecute `python manage.py migrate_editorial_to_strapi` para auditar, luego con `--apply`. Revise y publique los borradores desde el editor. Ejecute con `--verify-published` hasta obtener código 0 y retire el token temporal.
4. Active el cron tras migrar Django. Despliegue Next con `CNI_BANNER_SOURCE=django` para validar el portal, y cambie a `strapi` tras verificar la publicación de banners. El retiro del CMS editorial legado corresponde al PR final del #80.
5. Promueva `master` a `testing` por PR. Una vez desplegado ese commit, ejecute el [smoke test del #86](../CMS_STAGING_SMOKE_TEST.md). Compruebe la entrega al CRM de staging, navegación ES/EN, mapa, ficha, prensa, carga pública y descarga firmada. Repita la prueba de archivos tras un redeploy. Valide inicio, noticia y ficha en Rich Results Test. Compruebe el encabezado `X-Robots-Tag: noindex, nofollow` y la regla `Disallow: /` en `/robots.txt`. Registre el SHA desplegado.
6. Con el smoke en verde para ese SHA, abra el PR de `testing` hacia `production` y obtenga la aprobación del CNI. Prepare las variables, bases y Umami de producción antes del merge. Tras la CI del commit de merge y el autodeploy, confirme el SHA y los healthchecks de Railway. Antes del corte DNS, siga el [checklist de producción](checklist-produccion.md).

## Backups y rollback

Habilite backups programados de los volúmenes PostgreSQL y compruebe la restauración en un entorno aislado. Antes de una migración o corte tome un backup adicional de cada base afectada. Registre las revisiones activas, la versión de las bases y el estado de los buckets R2. Si migra contenido entre proveedores, copie los objetos y verifique URLs públicas y descargas privadas antes de cortar DNS.

Ante un fallo, pause autodeploy y cron, y vuelva a desplegar la última revisión sana desde Railway con su configuración compatible. Si ya corrió una migración incompatible, restaure su backup en una base separada, valide el estado y cambie la referencia de forma coordinada. Restablezca el DNS anterior si el corte ya ocurrió. Revise la cola antes de reactivar el cron, para evitar reenviar formularios ya procesados.

Para una corrección urgente, cree el hotfix desde `production`, abra un PR hacia `production` y espere la CI y la aprobación humana. Tras verificar el despliegue, reincorpore la corrección por PR a `testing` y a `master`. [Flujo de ramas para implementadores](../development/agent-workflow.md#hotfix-de-producción).
