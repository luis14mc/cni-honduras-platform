# PR #47 — Validación News editorial (Strapi)

Ticket: reestructuración `News` en `cms-strapi/`  
Branch: `feat/strapi-news-editorial-structure`  
PR: [#47](https://github.com/luis14mc/cni-honduras-platform/pull/47)

## Validaciones ejecutadas (2026-09-04)

| Check | Comando | Resultado |
|-------|---------|-----------|
| Dependencias | `npm ci` | OK |
| Build admin + TS | `npm run build` | OK |
| Schema estático | `npm run validate:news-schema` | OK |
| Arranque runtime | `npm start` | **No verificado localmente** — Postgres local rechaza credenciales `strapi`/`cni_strapi` (`.env` presente). CI `strapi-ci` valida arranque + REST en GitHub Actions. |
| Strapi Admin UI | Manual | **No verificado** — requiere DB + login admin |

## Schema confirmado

- `draftAndPublish: true`
- i18n: campos localizados vs compartidos según spec
- Dynamic Zone: `content.paragraph`, `content.heading`, `content.image`, `content.quote`
- `lead_points` → `news.lead-point` (repeatable)
- `cover` y `content.image.image`: `allowedTypes: ["images"]`, single media
- `content.image.image`: `required: true`

## Compatibilidad / referencias antiguas

El frontend Strapi aún mapea campos legacy en `frontend/src/lib/strapi/editorial.ts`:

- `raw.summary` (ahora `excerpt` en Strapi)
- `raw.featured_image` (ahora `cover`)
- `parseStrapiBlocks(raw.content)` (ahora Dynamic Zone, no blocks)

También afectados (fuera de alcance PR #47):

- `frontend/src/lib/strapi/types.ts` (`StrapiNews`)
- `frontend/src/lib/strapi/client.ts` (`populate` usa `featured_image`)

No hay seeds/fixtures Strapi de News en el repo. Datos en staging Postgres, si existían con schema anterior, requieren re-edición manual tras deploy (Strapi altera tablas en boot).

## Riesgo datos

Renombres breaking:

```text
summary → excerpt
featured_image → cover
content (blocks) → content (dynamiczone)
```

Sin migración SQL incluida. Contenido previo en esos campos no se transfiere automáticamente.
