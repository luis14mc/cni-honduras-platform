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

- Strapi vive en `cms-strapi/` y usa **PostgreSQL propio** (Neon u otra instancia/schema).
- **No** usar la base PostGIS de Django.
- El frontend **sigue consumiendo Django** para noticias, documentos, mapa, etc.
- `frontend/src/lib/strapi/` es un cliente listo; **no** sustituye las APIs Django todavía.
- No hay migración automática de datos en este PR.

## Content types

Draft & Publish + i18n (`es` default, `en`) en todos:

| Tipo | REST | Notas |
|------|------|--------|
| News | `GET /api/news` | `content` blocks, `featured_image`, SEO |
| Document | `GET /api/documents` | `file` y `cover` localizados (ES/EN pueden diferir). `resource_key` compartido |
| Success Story | `GET /api/success-stories` | `sector` es **string** (no se duplica el modelo Django `Sector`) |
| Investment Opportunity | `GET /api/investment-opportunities` | `public_metrics` (máx. 4). `internal_notes` es editorial y se omite en REST público |

Populate explícito de media (ejemplos):

```http
GET /api/news?locale=es&populate=featured_image
GET /api/documents?locale=en&populate=file,cover
GET /api/success-stories?locale=es&populate=logo,featured_image,person_photo
GET /api/investment-opportunities?locale=es&populate=featured_image,public_metrics
```

`populate=*` sirve para smoke tests; en producción preferir populate explícito.

Permisos **Public**: solo `find` / `findOne` de contenido publicado. Sin create/update/delete públicos. El admin de Strapi mantiene CRUD.

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
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
# STRAPI_API_TOKEN=   # opcional, solo server-side (nunca NEXT_PUBLIC_)
```

Cliente:

- `frontend/src/lib/strapi/client.ts`
- `frontend/src/lib/strapi/types.ts`
- `frontend/src/lib/strapi/media.ts` → `getStrapiMediaUrl()`

Este PR **no** cambia páginas públicas ni el CMS Django.

## Deployment (staging)

1. Provisionar Postgres/Neon **separado** de Django.
2. Provisionar bucket R2 + token + URL pública `https://pub-….r2.dev`.
3. Variables de entorno de `cms-strapi/.env.example` (sin SQLite).
4. Build: `npm run build` && `npm run start` (Node 20).
5. Crear el primer admin en `/admin` (una sola vez).
6. Settings → Users & Permissions: confirmar Public = find/findOne.
7. Frontend: `NEXT_PUBLIC_STRAPI_URL` apuntando al Strapi de staging. No hardcodear hosts.

Render/Fly/etc. son válidos; este PR no añade un Dockerfile de Strapi.

## Health y smoke test

| Check | Cómo |
|-------|------|
| Proceso vivo | `GET /_health` → 204 |
| Postgres | `GET /api/health` → `{ "status": "ok", "database": "connected" }` |
| Admin | `GET /admin` carga |
| Media R2 | Subir imagen en Media Library; URL absoluta `https://pub-….r2.dev/…` |
| News ES | `GET /api/news?locale=es&populate=*` |
| News EN | `GET /api/news?locale=en&populate=*` |
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

- Consumo real en páginas Next (hoy Django).
- Migración de contenidos Django → Strapi.
- Retirada del CMS Django.
- Relación `sector` con el catálogo Django/PostGIS.
- Dockerfile / servicio de staging para Strapi.
- Token API de solo lectura si se desactiva Public find.
- Campos privados adicionales: no añadirlos a `frontend/src/lib/strapi/types.ts`; omitirlos en REST.

## Variables nuevas (resumen)

**Strapi:** `DATABASE_*`, `DATABASE_URL` (opcional), `DATABASE_SCHEMA`, `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE`, `CF_*`, más secretos estándar Strapi (`APP_KEYS`, `ADMIN_JWT_SECRET`, …).

**Frontend:** `NEXT_PUBLIC_STRAPI_URL`, `STRAPI_API_TOKEN` (opcional, server-only).
