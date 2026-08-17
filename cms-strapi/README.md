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
