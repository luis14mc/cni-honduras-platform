# 🚀 CNI Strapi 5 (editorial CMS)

Headless CMS editorial **en paralelo** a Django. El mapa y PostGIS permanecen en Django.

Guía completa: [`docs/STRAPI_MIGRATION.md`](../docs/STRAPI_MIGRATION.md)

## Comandos

```bash
cp .env.example .env   # completar Postgres + secretos + R2
npm ci
npm run develop        # watch (local)
npm run build
npm start              # production mode
```

- Health: `GET /_health` (204) y `GET /api/health` (`status`, `database`, `service`).
- Admin directo: `http://localhost:1337/admin` (staging: `https://<strapi-service>/admin`).
- El proxy Next `/admin` es **opcional**; no es requisito de staging.

## News (estructura editorial)

Content type `News` (`news-item`) con i18n nativo (`es`/`en`), Draft & Publish y cuerpo en **Dynamic Zone**:

- `title`, `slug`, `excerpt`, `location_date` — localizados
- `published_date`, `cover`, `featured`, `order`, `category` — compartidos
- `lead_points` → componente `news.lead-point` (repeatable)
- `content` → `content.paragraph`, `content.heading`, `content.image`, `content.quote`
- `seo_title`, `seo_description` — localizados

Populate REST (ejemplo):

```http
GET /api/news?locale=es&populate[cover]=true&populate[lead_points]=true&populate[content][on][content.image][populate]=image
```
