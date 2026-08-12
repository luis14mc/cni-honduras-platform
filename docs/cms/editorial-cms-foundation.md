# CMS Editorial — Foundation (S2-T1)

Interfaz CMS moderna (estilo WordPress) para el CNI. Django sigue siendo el
backend, fuente de verdad, autenticación, permisos y validaciones. El Django
Admin **no se elimina**: permanece como herramienta técnica de respaldo.

Esta entrega es **foundation**: login, layout, dashboard funcional, permisos y
shells de módulos. No incluye CRUD, editor TipTap ni page builder.

## Alcance del CMS vs heroes de página

**Page heroes are static frontend assets and are outside CMS scope.**

Los heroes estructurales (Home, Prensa, Recursos, Casos, Oportunidades, Sectores,
páginas institucionales) se definen en el frontend (`components`, `designAssets`,
`/public/images/…`). El CMS **no** administra fondos ni composición de heroes.

Sí administra contenido dinámico **debajo** del hero: noticias, documentos,
casos de éxito, oportunidades (fichas bilingües con métricas dinámicas y CAPEX),
multimedia, usuarios/roles.

### Oportunidades de inversión (S2-T8)

- Un registro bilingüe (`modeltranslation`); no filas ES/EN separadas.
- CMS/Admin API: ficha completa (descripción, cliente, mercado, propuesta, métricas, CAPEX).
- `OpportunityMetric.is_public` selecciona hasta 4 métricas para el teaser público.
- API pública: solo teaser — **sin** CAPEX ni narrativa interna.
- Frontend público: teaser + CTA a contacto; hero de página estático.

`SiteBanner` queda limitado a barras no estructurales (`site_top`, `footer`).
El placement `home_hero` es legacy y no alimenta el sitio público.

## Arquitectura

- **Frontend**: Next.js (App Router) bajo la ruta top-level `/cms` (fuera de
  `[locale]`, sin el chrome público Navbar/Footer).
  - `/cms/login` — público.
  - `/cms` — dashboard (protegido).
  - `/cms/{noticias,documentos,banners,casos-exito,sectores,oportunidades,multimedia,paginas,usuarios,configuracion}`
    — shells profesionales "módulo en preparación" (nunca 404).
- **Backend**: API autenticada bajo `/api/v1/cms-admin/` — separada de la API
  pública `/api/v1/…`. No se crearon modelos nuevos ni migraciones.

### Endpoints CMS

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/v1/cms-admin/csrf/` | AllowAny | Fija la cookie CSRF antes del login |
| POST | `/api/v1/cms-admin/login/` | AllowAny (staff-only) | Abre sesión; rechaza no-staff con 403 |
| POST | `/api/v1/cms-admin/logout/` | IsCMSStaff | Cierra la sesión |
| GET | `/api/v1/cms-admin/me/` | IsCMSStaff | Identidad + grupos + permisos |
| GET | `/api/v1/cms-admin/dashboard/` | IsCMSStaff | Conteos reales + actividad reciente |

`IsCMSStaff` exige `is_authenticated`, `is_active` e `is_staff`. Como el proyecto
usa `DEFAULT_PERMISSION_CLASSES = [AllowAny]`, cada vista CMS fija el permiso
explícitamente.

## Autenticación

Sesión Django + cookie HttpOnly + CSRF. No se emiten tokens ni se guardan
contraseñas/tokens en `localStorage`. El frontend envía `credentials: "include"`
y el header `X-CSRFToken` (leído de la cookie `csrftoken`) en solicitudes de
escritura.

## Roles

Grupos de Django (autoridad en el backend). El comando **idempotente** los crea y
asigna permisos por modelo:

```bash
cd backend
python manage.py seed_cms_roles
```

Roles: `Superadmin`, `Administrador CMS`, `Editor`, `Autor`, `Comunicaciones`,
`Inversiones`. El frontend oculta opciones según permisos, pero el backend
siempre revalida.

## Variables de entorno

Backend (producción, frontend y API en dominios distintos → cookies cross-site):

```
DJANGO_SESSION_COOKIE_SECURE=true
DJANGO_CSRF_COOKIE_SECURE=true
DJANGO_SESSION_COOKIE_SAMESITE=None
DJANGO_CSRF_COOKIE_SAMESITE=None
DJANGO_CSRF_TRUSTED_ORIGINS=https://<frontend-domain>
CORS_ALLOWED_ORIGINS=https://<frontend-domain>
CORS_ALLOW_CREDENTIALS=true
DJANGO_CMS_LOGIN_THROTTLE=10/min   # opcional, rate limit del login
```

Frontend:

```
NEXT_PUBLIC_API_URL=https://<api-domain>/api/v1
```

> **Nota de despliegue (deuda documentada):** con `SameSite=None` el navegador
> solo envía la cookie de sesión sobre HTTPS (`Secure=True`). En desarrollo
> local (`localhost:3000` ↔ `localhost:8000`) funciona con `SameSite=Lax`.

## Validaciones ejecutadas

- Backend: `manage.py check`, `makemigrations --check` (sin migraciones nuevas),
  `manage.py test` (111 tests OK, incluye `apps.cms.tests.test_cms_admin`).
- Frontend: `pnpm test` (75 OK), `pnpm lint`, `pnpm run build`.
