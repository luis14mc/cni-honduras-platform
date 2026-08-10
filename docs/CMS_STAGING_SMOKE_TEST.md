# CMS Staging Smoke Test

Manual checklist for validating the editorial CMS on staging (`test.cni.hn` → `api-test.cni.hn`).

## Prerequisites

- Staff account with Editor role (or Superuser for admin modules)
- Browser devtools open (Network + Console)
- `NEXT_PUBLIC_API_URL=https://api-test.cni.hn/api/v1` on frontend
- Backend CORS/CSRF includes `https://test.cni.hn`

## 1. Authentication

1. Open `/cms/login`
2. Confirm CSRF preflight (`GET /api/v1/cms-admin/csrf/`) returns 200
3. Login with valid credentials
4. Confirm redirect to `/cms` and `sessionid` cookie (HttpOnly) on `api-test.cni.hn`
5. Confirm `GET /api/v1/cms-admin/me/` returns user + permissions
6. Logout — session cleared, redirected to login
7. Return to `/cms` — should redirect to login (401/expired)

## 2. Dashboard

1. Stat cards show non-zero or zero real counts (not mock data)
2. Quick actions link to `/cms/noticias/nueva`, etc.
3. **Necesita atención** shows only items with count > 0
4. Recent activity links open correct editor routes

## 3. Page heroes (estáticos — fuera del CMS)

**Regla:** Page heroes are static frontend assets and are outside CMS scope.

Ningún hero de página pública debe venir de SiteBanner, Page, MediaAsset, News, Document ni SuccessStory.

Validar en staging (hero visible, imagen correcta, sin request CMS para el hero):

| Página | Esperado |
|--------|----------|
| Home `/es` | 4 slides `/images/hero/home/*` — **no** llama `banners/?placement=home_hero` |
| Prensa listado + detalle | Hero estructural `designImages.prensa.hero`; `featured_image` solo en cuerpo |
| Recursos / estudios | Hero estático; portadas CMS solo en cards |
| Casos listado + detalle | Hero estructural; logo/cover CMS en contenido |
| Oportunidades / crecer | Hero `PageHero` estático |
| Sectores detalle | `sectorPhotoHeaders` estáticos — **no** `sector.image` API |
| Institucionales | Heroes de `designAssets` / `PageHero` — sin CMS |

SiteBanner solo para `site_top` / `footer` (no heroes de página). El placement `home_hero` es legacy y no debe usarse en CMS UI.

## 4. News (bloques ES/EN → publish → público)

1. `/cms/noticias/nueva` — título ES + bloques (párrafo, heading, imagen, lista…)
2. Guardar draft — slug auto-generado
3. Tab English — bloques EN independientes; guardar sin borrar ES
4. Publish — status published + `published_at`
5. Público `/es/prensa/{slug}` renderiza bloques; `/en/…` usa bloques EN
6. Editar solo ES — `content_blocks_en` intacto

## 5. Document (registros independientes por idioma)

1. Crear documento `language=es` con PDF o URL + portada + `resource_key`
2. Acción **Crear versión en inglés** — mismo `resource_key`, slug distinto, **sin** copiar PDF
3. Completar título/archivo EN en el registro hermano
4. Listado muestra badges ES/EN, grupo/recurso, portada
5. Público `?lang=es` solo filas ES; `?lang=en` solo filas EN
6. Documentos legacy migrados → `language=es`

## 6. Banner

1. Create + publish banner with valid date window (`site_top` / footer — no hero estructural)
2. Public banners endpoint returns it when active

## 7. Success Story

1. Create + publish case
2. MediaPicker independiente: Logo, Imagen principal, Foto de la persona
3. Campos `person_name` / `person_role`
4. Public investment API lists published story

## Scope note — Opportunities

Opportunity **no** se rediseña en este sprint. Mantener estable; revisión posterior con ejemplos de negocio.

## 8. Sector

1. Create sector, set active
2. Public `/api/v1/investment/sectors/` includes slug

## 9. Opportunity

1. Create with sector, summary, description
2. Set public — visible on public opportunities list

## 10. Page

1. Edit existing page (pages are seeded/protected)
2. Publish if allowed — verify public pages endpoint if exposed

## 11. Media

1. `/cms/multimedia` — upload image
2. MediaPicker in news editor — search, select, preview, clear, change
3. No duplicate upload on double-click

## 12. Users & Roles (superuser)

1. `/cms/usuarios` — list, create, edit
2. `/cms/usuarios/roles` — assign permissions, save without 400
3. Non-superuser cannot access users/roles/config

## 13. Configuración (superuser)

1. `/cms/configuracion` — institutional links CRUD
2. Non-superuser sees unauthorized state

## 14. Global search

1. Header search — debounced results, click navigates to editor
2. Errors show feedback (not silent empty)

## 15. UX checks

- Staging badge visible in header (not in production)
- Breadcrumbs correct on nested routes (`/cms/noticias/42`)
- Unsaved changes prompt on back navigation when form dirty
- Slug auto-generates from ES title on new sector/opportunity until manually edited
- TipTap: bold, lists, link, clear format, undo/redo
- Responsive: sidebar drawer at 390px, usable list tables

## 16. Regression

- No console errors on dashboard
- No hardcoded API URLs in network tab
- PATCH partial translations do not wipe other locale fields
