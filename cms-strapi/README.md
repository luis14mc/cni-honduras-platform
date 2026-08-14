# 🚀 CNI Strapi 5 (editorial CMS)

Headless CMS editorial **en paralelo** a Django. El mapa y PostGIS permanecen en Django.

Guía completa: [`docs/STRAPI_MIGRATION.md`](../docs/STRAPI_MIGRATION.md)

## Comandos

```bash
cp .env.example .env   # completar Postgres + secretos + R2
npm run develop        # watch
npm run build
npm run start
```

Health: `GET /api/health` (Postgres) y, vía Next, `GET /strapi-api/health`.
Admin vía proxy: `http://localhost:3000/admin` (`STRAPI_ORIGIN` + `STRAPI_PUBLIC_URL`).
