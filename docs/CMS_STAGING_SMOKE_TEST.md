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

### Flujo operativo obligatorio

1. `/cms/noticias/nueva` — título ES (obligatorio), slug auto, resumen, imagen destacada, bloques
2. Guardar borrador — toast + redirect a `/cms/noticias/{id}`; recargar conserva datos
3. Tab English — bloques EN independientes; guardar ES no borra EN
4. Agregar/reordenar (drag)/duplicar/eliminar bloques; imagen vía MediaPicker persiste `media_id`
5. Publicar — `status=published`, `published_at` set; errores de campo visibles (no genérico)
6. Público `/es/prensa/{slug}` — featured image + blocks; `/en/…` usa bloques EN
7. Editar noticia ya publicada y guardar — **no** debe despublicar

### Bug corregido (S2-T5)

- **Causa:** cada save forzaba `status: "draft"` (despublicaba); `full_clean` en publish → 500 sin field errors; `ensureBlocks` descartaba bloques sin `id`.
- **Fix:** no forzar draft al guardar publicados; `apply_publish` → 400 ValidationError; normalizar ids de bloques.

## 5. Document (registros independientes por idioma)

1. Crear documento `language=es` con PDF o URL + portada + `resource_key`
2. Acción **Crear versión en inglés** — mismo `resource_key`, slug distinto, **sin** copiar PDF/portada/título
3. Desde EN: acción **Crear versión en español** (simétrico)
4. Completar título/archivo de la versión hermana
5. Listado: badges ES/EN, filtro idioma, indicador `ES | EN disponible/pendiente`, portada, acciones
6. Toggle recurso: archivo XOR URL; quitar archivo sin perder al PATCH de metadatos
7. Público `?lang=es` solo ES; `?lang=en` solo EN (sin fallback)
8. Documentos legacy migrados → `language=es` (`cms.0008`)

### QA mañana (S2-T6)

- CMS create ES → sibling EN → publish ambos
- Portadas distintas por idioma
- `/es/recursos` vs `/en/recursos` muestran versiones correctas
- Descarga `file_url` absoluta funciona en preview Vercel

## 6. Banner

1. Create + publish banner with valid date window (`site_top` / footer — no hero estructural)
2. Public banners endpoint returns it when active

## 7. Success Story

1. Crear borrador incompleto (EN vacío OK) → guardar sin despublicar luego
2. MediaPicker independiente: Logo ≠ Featured ≠ Person photo
3. Campos `person_name` / `person_role` + sector
4. Publicar → `status=published` + `published_at`
5. Guardar contenido publicado **no** vuelve a draft
6. Listado CMS: miniatura, empresa, acciones publicar/archivar/despublicar
7. Home: cover=`featured_image`, avatar=`person_photo`, logo separado (sin redesign)
8. Detalle `/portafolio/casos/[slug]`: hero estático; featured en cuerpo; testimonio con foto
9. `?lang=es|en` resuelve campos traducibles del mismo registro

### QA mañana (S2-T7)
- CMS create → 3 medias → publish → home featured → detalle ES/EN
- Verificar que logo nunca aparece como cover ni person_photo como logo

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
