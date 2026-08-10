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

## 3. Home hero

1. Open `/es` or `/en` — hero carousel shows banner images (not empty gradient only)
2. DevTools Network: `GET /api/v1/cms/banners/?placement=home_hero` returns banners with `image.file_url` absolute (https://api-test.cni.hn/…)
3. Images load without 404 on `test.cni.hn`

## 4. News (draft → publish → public)

1. `/cms/noticias/nueva` — create draft with ES title + content (slug auto-generated)
2. Save draft — toast success, URL becomes `/cms/noticias/{id}`
3. Publish — status changes to published; errors show field name if validation fails
4. `GET https://api-test.cni.hn/api/v1/cms/news/?lang=es` — item visible by slug
5. Edit EN tab only — ES title unchanged after save

## 5. Document (ES/EN resources)

1. `/cms/documentos/nuevo` — tab Español: título, PDF ES o URL ES, portada ES
2. Tab English: title, file EN or external URL EN, cover EN (optional until EN content exists)
3. Publish requires recurso ES; EN resource required only if title/description EN filled
4. `GET …/documents/{slug}/?lang=es` — returns ES `external_url` / `file_url`
5. `GET …/documents/{slug}/?lang=en` — returns EN resource when configured; **no** ES PDF fallback

## 6. Banner

1. Create + publish banner with valid date window
2. Public banners endpoint returns it when active

## 7. Success Story

1. Create + publish case
2. Public investment API lists published story

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
