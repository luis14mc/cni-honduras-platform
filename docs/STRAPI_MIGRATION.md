# Strapi 5 — migración editorial (fundación)

Ticket: **MIG-CMS-001**  
Strapi: **5.52.0** (TypeScript)  
Estado: integración **paralela y reversible**. Django CMS, mapa y PostGIS **no se eliminan** en este PR.

## Arquitectura

```text
Next.js
├── Strapi 5  → contenido editorial + multimedia
└── Django/PostGIS → mapa, geografía y APIs especializadas
```

Same-site proxy (MIG-CMS-002): Strapi sigue como **servicio separado**. Next solo reverse-proxea:

```text
<public-site>
├── /                     → Next.js
├── /en/...               → Next.js
├── /cms                  → CMS Django (sin cambios)
├── /admin                → Strapi admin
├── /admin/*              → Strapi admin
├── /strapi-api/*         → Strapi /api/*
└── /content-manager, /upload, /i18n, /users-permissions, …
                          → plugins admin Strapi 5 (no viven bajo /admin)
```

- `STRAPI_ORIGIN` (server-only) = origen interno del servicio Strapi.
- `NEXT_PUBLIC_STRAPI_URL=/strapi-api` = prefijo REST en el browser.
- `STRAPI_PUBLIC_URL` en Strapi = URL pública **de este servicio** (staging: `https://<strapi-service>`). El proxy Next `/admin` es opcional.

- Strapi vive en `cms-strapi/` y usa **PostgreSQL propio** (Neon u otra instancia/schema).
- **No** usar la base PostGIS de Django.
- El frontend **consume Strapi** para noticias, documentos, casos de éxito y oportunidades (MIG-CMS-003).
- Django permanece para mapa, PostGIS, sectores/proyectos y formularios. Durante la migración también sirve los banners actuales y el CMS anterior.
- `frontend/src/lib/strapi/editorial.ts` es la capa pública editorial. Server Components usan `STRAPI_URL` (no el proxy `/strapi-api`).

## Content types

Draft & Publish + i18n (`es` default, `en`) en todos:

| Tipo | REST | Notas |
|------|------|--------|
| News | `GET /api/news` | UID interno `news-item`. Dynamic Zone (`content.*`), `cover`, `lead_points`, `excerpt`, `location_date`, SEO. Draft & Publish |
| Document | `GET /api/documents` | `file` y `cover` localizados (ES/EN pueden diferir). `resource_key` compartido |
| Success Story | `GET /api/success-stories` | `sector` es **string** (no se duplica el modelo Django `Sector`) |
| Banner | `GET /api/banners` | Ventana de vigencia, prioridad, imágenes y CTA. |
| Page | `GET /api/pages` | Dynamic Zone `content.*` y SEO. Rutas públicas `/institucional/<slug>` y `/en/institucional/<slug>`. |
| Resource Category | `GET /api/resource-categories` | Categoría editorial localizada. La relación `resource_category` en Document convive con el enum anterior durante la transición. |
| Investment Opportunity | `GET /api/investment-opportunities` | `public_metrics` (máx. 4). `internal_notes` es editorial y se omite en REST público |

Populate explícito de media (ejemplos):

```http
GET /api/news?locale=es&populate[cover]=true&populate[content][on][content.image][populate]=image&populate[lead_points]=true
GET /api/documents?locale=en&populate=file,cover
GET /api/success-stories?locale=es&populate=logo,featured_image,person_photo
GET /api/investment-opportunities?locale=es&populate=featured_image,public_metrics
```

`populate=*` sirve para smoke tests; en producción preferir populate explícito.

Permisos **Public**: solo `find` / `findOne` de contenido publicado. Sin create/update/delete públicos. El admin de Strapi mantiene CRUD.

## Roles y vista previa (CNI-201)

Super Admin asigna los roles en **Settings → Administration Panel → Users**. **Editor CNI** puede crear, consultar y editar borradores. **Publicador CNI** puede crear, consultar, editar, borrar y publicar contenido. Super Admin conserva la administración de usuarios, estructura y credenciales.

Los permisos de Editor CNI y Publicador CNI se editan en [el bootstrap de Strapi](../cms-strapi/src/bootstrap.ts). En cada arranque, Strapi vuelve a aplicar esa configuración, sobrescribe cualquier cambio de permisos hecho en el panel para esos dos roles y registra la sincronización en el log.

`shared.seo` está disponible en News, Document, Success Story, Investment Opportunity y Page. Conserva los campos SEO existentes durante la migración. Las páginas institucionales consumen el componente completo.

Para activar **Open preview** en Noticias, Banner y Page:

1. Configurar `STRAPI_PREVIEW_ORIGIN` con el origen de Next.js.
2. Configurar el mismo `STRAPI_PREVIEW_SECRET` en Strapi y Next.js. Usar un valor distinto por entorno.
3. Proveer a Next.js un `STRAPI_API_TOKEN` con lectura de Noticias, Page y Banner. El enlace firmado vence a los cinco minutos. El REST público solo lista contenido publicado para estos tipos.
4. Crear una noticia, página o banner, guardar el borrador y abrir la vista previa. Después de publicarla, comprobar la ruta pública o el espacio de banner en el sitio. Repetir en `es` y `en`. Para comprobar la distinción de permisos, iniciar sesión con cada rol por separado.

## Preparación de la migración (CNI-202)

Con acceso de lectura al origen Django y un token de API de Strapi para el destino, ejecutar desde `backend/`:

```bash
python manage.py migrate_editorial_to_strapi
python manage.py migrate_editorial_to_strapi --apply
python manage.py migrate_editorial_to_strapi
# Después de revisar y publicar las variantes correspondientes en Strapi:
python manage.py migrate_editorial_to_strapi --verify-published
```

Configurar `STRAPI_MIGRATION_URL` y `STRAPI_MIGRATION_TOKEN` en el entorno del comando. La primera ejecución solo compara los registros de ambos sistemas por colección e idioma. Con `--apply` se crean únicamente los borradores ausentes. Los documentos existentes se identifican por slug, `resource_key` o la clave de banner de Django; el comando conserva sus ediciones. Los archivos copiados se identifican por contenido y texto alternativo para reutilizarlos al reintentar.

El reporte JSON cuenta variantes por idioma, estados de origen y registros existentes, creados, ausentes o fallidos. Un registro sin traducción se informa por separado. Para la revisión editorial, el script convierte campos HTML a texto y señala los bloques de noticia que requieren conversión manual (listas, botones, separadores e imágenes sin referencia). Las oportunidades copian los campos editoriales públicos disponibles en Strapi; Django sigue sirviendo su información geoespacial y de inversión operativa.

Antes de activar `CNI_BANNER_SOURCE=strapi` en Next.js, revisar los borradores, contrastar contenido y archivos con Django, y publicar en Strapi las variantes que ya estaban publicadas. Verificar los conteos, enlaces y ventanas de los banners ES/EN. `--verify-published` comprueba por colección e idioma que cada entrada publicada y vigente en Django tiene una publicación correspondiente en Strapi. Devuelve un código de salida distinto de cero si falta alguna publicación o falla una consulta. Los borradores, archivados y publicaciones programadas para el futuro quedan fuera de este cotejo. Revisar aparte los archivos y el contenido. Si hay diferencias, mantener el origen anterior. La verificación en el entorno de migración es requisito para retirar `/cms` o los modelos Django. Para revertir el origen de banners, volver a `CNI_BANNER_SOURCE=django`.

Para dar acceso de consulta a postulaciones, contactos, solicitudes de asesoría y descargas, ejecutar `python manage.py seed_cms_roles` en Django y asignar **Revisores de formularios CNI** a las cuentas de staff que deban consultarlos. Revisar los demás grupos y permisos directos de esas cuentas, porque Django suma los permisos de cada asignación.

## Descargas de recursos (CNI-301)

Publicar las categorías en **Resource Category** y vincular los documentos en `resource_category`. El catálogo admite Institucional, Técnicos, Guías, Estudios, Portafolios, Marco legal y otras categorías publicadas en Strapi. Mantener los slugs de categorías anteriores cuando se quiera conservar sus rutas. El enum `category` se sigue leyendo para documentos anteriores sin relación. El acceso se configura por variante de idioma, porque ES y EN pueden usar archivos distintos.

- **Acceso libre**: dejar `access=free` y usar el campo de archivo o la URL externa. `language` permite declarar el idioma del archivo cuando difiere del idioma de la ficha.
- **Acceso con formulario**: subir el archivo a un bucket privado sin acceso público ni CDN, configurar `access=gated` e introducir en `gated_object_key` la clave relativa en ese bucket, por ejemplo `guides/investment.pdf`. Limpiar `file` y `external_url` antes de publicar. La portada se puede mantener en la biblioteca pública. Para reclasificar un archivo que ya era público, retirar también el objeto público anterior.

En Django configurar `GATED_RESOURCE_STRAPI_URL` con el origen de Strapi y `GATED_RESOURCE_STRAPI_TOKEN` con un token **Custom** limitado a `document.gatedFile`. Configurar `GATED_RESOURCE_BUCKET`, `GATED_RESOURCE_ENDPOINT`, `GATED_RESOURCE_REGION`, `GATED_RESOURCE_ACCESS_KEY` y `GATED_RESOURCE_SECRET_KEY` para un principal de lectura del bucket privado. Estas variables pertenecen al backend. En AWS S3 se puede omitir `GATED_RESOURCE_ENDPOINT` y usar la región del bucket. En R2 usar el endpoint S3 de la cuenta y la región `auto`.

Después de aplicar las migraciones Django, verificar un documento libre y uno restringido en cada idioma. La API registra el consentimiento, reutiliza el contacto durante la sesión con un token opaco de 30 minutos y devuelve una URL de descarga válida por 15 minutos. Cada descarga restringida conserva su propia traza en cni-crm. El evento incluye `is_repeat` para identificar las solicitudes que reutilizaron la sesión. El evento `file_download` indica que se inició la descarga. Solo contiene el slug y el tipo de acceso.

Prueba del navegador con datos aislados: desde `frontend/`, ejecutar `pnpm exec playwright test --config playwright.resources.config.ts`. Si se usa Edge instalado localmente, configurar `PLAYWRIGHT_BROWSER_CHANNEL=msedge`.

## i18n

- Plugin i18n habilitado.
- Locales: `es` (default), `en`.
- `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE=es` en el primer boot.
- Bootstrap crea locales faltantes y fuerza default `es`.

## Base de datos (PostgreSQL / Neon)

Variables:

```text
DATABASE_CLIENT=postgres
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_SSL=true
DATABASE_SCHEMA=public
```

Opcional: `DATABASE_URL` (URI Neon, `sslmode=require`).

SQLite **no** está permitido con `NODE_ENV=production`. Staging debe usar Postgres.

Recomendación: proyecto Neon dedicado `cni_strapi`, o schema `strapi` en un cluster **distinto** del PostGIS de Django.

## Cloudflare R2

Provider: `strapi-provider-cloudflare-r2-aws`

```text
CF_ACCESS_KEY_ID=
CF_ACCESS_SECRET=
CF_ENDPOINT=          # https://<ACCOUNT_ID>.r2.cloudflarestorage.com
CF_BUCKET=
CF_PUBLIC_ACCESS_URL= # https://pub-….r2.dev
```

Si `CF_BUCKET` está vacío, Strapi usa almacenamiento local (`public/uploads`) — solo desarrollo. Staging debe configurar R2.

CSP de admin (`config/middlewares.ts`) añade el host de `CF_PUBLIC_ACCESS_URL` a `img-src` y `media-src`.

CORS del bucket: permitir GET desde el origen del admin Strapi (o `*` en pruebas).

## Instalación local

Requisitos: Node 20–22 LTS, PostgreSQL 15/16 (sin PostGIS).

```bash
cd cms-strapi
cp .env.example .env
# Completar APP_KEYS, sales, DATABASE_* (SSL=false en local) y opcionalmente R2
npm install
npm run develop
```

Primera visita: `http://localhost:1337/admin` → crear el primer usuario admin (solo si no existe ninguno).

Publicar contenido: Content Manager → tipo → locale ES/EN → **Publish**. El REST público no devuelve drafts.

## Frontend (Next.js)

Variables (`frontend/.env.local`):

```text
STRAPI_ORIGIN=http://localhost:1337
NEXT_PUBLIC_STRAPI_URL=/strapi-api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# STRAPI_API_TOKEN=   # opcional, solo server-side (nunca NEXT_PUBLIC_)
```

`STRAPI_ORIGIN` vacío: el build Next funciona y **no** registra rewrites Strapi.

En Vercel/staging, definir `STRAPI_ORIGIN` en el entorno del **frontend** (build y runtime). El middleware de Next lo usa para `rewrite` hacia Strapi; no se expone al browser.

Cliente:

- `frontend/src/lib/strapi/client.ts` — relativo `/strapi-api` en browser; absoluto con `NEXT_PUBLIC_SITE_URL` en server
- `frontend/src/lib/strapi/proxy.ts` — rewrites `beforeFiles`
- `frontend/src/lib/strapi/media.ts` → `getStrapiMediaUrl()`

El CMS Django en `/cms` no se proxea.

## Proxy local / staging

1. Strapi: `STRAPI_PUBLIC_URL=http://localhost:3000` (staging: URL pública del frontend).
2. Next: `STRAPI_ORIGIN` apuntando al servicio Strapi (local `:1337` o URL interna de Render).
3. Abrir `http://localhost:3000/admin` (no el puerto 1337) para el panel.
4. Health: `GET /strapi-api/health` → 200 `{ status: ok, database: connected }`.
5. REST: `GET /strapi-api/news?locale=es`.

Rewrites extra (plugins admin Strapi 5): `/content-manager`, `/content-type-builder`, `/upload`, `/uploads`, `/i18n`, `/users-permissions`, `/email`, `/content-releases`, `/review-workflows`, `/cloud`. No se interceptan `/cms`, `/en`, ni el mapa.

## Deployment (staging) — OPS-CMS-001

Proveedor: **Render** Web Service (Node nativo, sin Docker). Misma plataforma que el backend Django de testing.

| Campo | Valor |
|-------|--------|
| Root directory | `cms-strapi` |
| Environment | Node |
| Node | 20 LTS (`.node-version`) o 22 LTS |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Instance | Starter (o equivalente) |

`NODE_ENV=production` lo asigna Render. `PORT` lo inyecta la plataforma; `HOST=0.0.0.0`.

### Base de datos

PostgreSQL **separado** (Neon u otro). **No** usar la DB PostGIS de Django.

Strapi crea su schema/tablas en el primer `npm start` (`DATABASE_SCHEMA=public`). No hay migraciones SQL manuales en este repo.

### Cloudflare R2

Provider: `strapi-provider-cloudflare-r2-aws` (`config/plugins.ts`).

En staging definir `CF_*` y `STRAPI_REQUIRE_R2=true` para no caer a `public/uploads` (disco efímero).

Smoke media (Media Library): JPG, PNG, WEBP, PDF → abrir `CF_PUBLIC_ACCESS_URL`.

### URL admin (directa)

No es obligatorio el proxy `/admin` de Next.

```text
STRAPI_PUBLIC_URL=https://<strapi-service>
```

- Servicio: `https://<strapi-service>`
- Admin: `https://<strapi-service>/admin`
- Health: `https://<strapi-service>/api/health`
- REST: `https://<strapi-service>/api/news?locale=es`

El primer arranque permite crear el primer usuario admin. Login → Content Manager → Media Library → locale ES/EN → Publish.

### Variables (sin secretos)

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=                    # inyectado por Render
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
ENCRYPTION_KEY=
JWT_SECRET=
DATABASE_CLIENT=postgres
DATABASE_URL=
DATABASE_SSL=true
DATABASE_SCHEMA=public
STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE=es
STRAPI_PUBLIC_URL=https://<strapi-service>
STRAPI_REQUIRE_R2=true
CF_ACCESS_KEY_ID=
CF_ACCESS_SECRET=
CF_ENDPOINT=
CF_BUCKET=
CF_PUBLIC_ACCESS_URL=
```

### Frontend (después de tener URL)

En Vercel/testing, `STRAPI_URL=https://<strapi-service>` (server-only). No hardcodear hosts en el repo.

## Health y smoke test

| Check | Cómo |
|-------|------|
| Proceso vivo | `GET /_health` → 204 |
| Postgres | `GET /api/health` → `{ "status": "ok", "database": "connected", "service": "cms-strapi" }` |
| CI | `strapi-ci`: Postgres 16, `npm ci`, `npm run build`, `npm start`, `/api/health` 200, `/_health` 204, listados públicos 200, `POST /api/news` 401/403 |
| Admin directo | `GET /admin` en `STRAPI_PUBLIC_URL` |
| Media R2 | Subir JPG/PNG/WEBP/PDF; URL absoluta `https://pub-….r2.dev/…` |
| News ES | `GET /api/news?locale=es` |
| Documents ES | `GET /api/documents?locale=es` |
| Stories ES | `GET /api/success-stories?locale=es` |
| Opportunities ES | `GET /api/investment-opportunities?locale=es` |
| Drafts | Un draft no aparece en REST público |
| Writes públicos | `POST /api/news` sin JWT admin → 403 |

## Cómo crear el primer admin

1. Arrancar Strapi (`develop` o `start` tras `build`).
2. Abrir `/admin`.
3. Completar el formulario de registro **solo la primera vez**.
4. Guardar credenciales fuera del repo.

## Cómo publicar

1. Admin → Content Manager → News (u otro tipo).
2. Elegir locale `es` o `en`.
3. Completar campos; media localizada por idioma en Document.
4. Save → **Publish**.
5. Verificar REST con `locale=` correspondiente.

## Limitaciones pendientes (fuera de este PR)

- Consumo real en páginas Next para noticias, documentos, casos y oportunidades (MIG-CMS-003).
- Migración de contenidos Django → Strapi.
- Retirada del CMS Django.
- Relación `sector` con el catálogo Django/PostGIS (Strapi usa string; el frontend normaliza a slug).
- Token API de solo lectura si se desactiva Public find.
- Campos privados adicionales: no añadirlos a `frontend/src/lib/strapi/types.ts`; omitirlos en REST.

## Variables nuevas (resumen)

**Strapi:** `HOST`, `PORT`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET`, `DATABASE_CLIENT`, `DATABASE_URL`, `DATABASE_SSL`, `DATABASE_SCHEMA`, `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE`, `STRAPI_PUBLIC_URL`, `ADMIN_PATH`, `STRAPI_REQUIRE_R2`, `CF_*`.

**Frontend:** `STRAPI_URL` (server-only, editorial RSC), `STRAPI_ORIGIN` (server-only, proxy), `NEXT_PUBLIC_STRAPI_URL` (browser/proxy prefix), `STRAPI_API_TOKEN` (opcional, server-only).
