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

## 3. News (draft → publish → public)

1. `/cms/noticias/nueva` — create draft with ES title + content
2. Save draft — toast success, URL becomes `/cms/noticias/{id}`
3. Publish — status changes to published
4. `GET https://api-test.cni.hn/api/v1/cms/news/?lang=es` — item visible by slug
5. Edit EN tab only — ES title unchanged after save

## 4. Document

1. Create draft with external URL OR upload file
2. Publish
3. Public list includes document slug

## 5. Banner

1. Create + publish banner with valid date window
2. Public banners endpoint returns it when active

## 6. Success Story

1. Create + publish case
2. Public investment API lists published story

## 7. Sector

1. Create sector, set active
2. Public `/api/v1/investment/sectors/` includes slug

## 8. Opportunity

1. Create with sector, summary, description
2. Set public — visible on public opportunities list

## 9. Page

1. Edit existing page (pages are seeded/protected)
2. Publish if allowed — verify public pages endpoint if exposed

## 10. Media

1. `/cms/multimedia` — upload image
2. MediaPicker in news editor — search, select, preview, clear, change
3. No duplicate upload on double-click

## 11. Users & Roles (superuser)

1. `/cms/usuarios` — list, create, edit
2. `/cms/usuarios/roles` — assign permissions, save without 400
3. Non-superuser cannot access users/roles/config

## 12. Configuración (superuser)

1. `/cms/configuracion` — institutional links CRUD
2. Non-superuser sees unauthorized state

## 13. Global search

1. Header search — debounced results, click navigates to editor
2. Errors show feedback (not silent empty)

## 14. UX checks

- Staging badge visible in header (not in production)
- Breadcrumbs correct on nested routes (`/cms/noticias/42`)
- Unsaved changes prompt on back navigation when form dirty
- Slug auto-generates from ES title on new sector/opportunity until manually edited
- TipTap: bold, lists, link, clear format, undo/redo
- Responsive: sidebar drawer at 390px, usable list tables

## 15. Regression

- No console errors on dashboard
- No hardcoded API URLs in network tab
- PATCH partial translations do not wipe other locale fields
