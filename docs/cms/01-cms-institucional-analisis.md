# Informe de análisis: CMS institucional — CNI Honduras Platform

> Análisis del repositorio **sin modificaciones de código**.  
> Objetivo: definir la implementación de un CMS institucional en el backend Django existente para administrar notas de prensa, casos de éxito, recursos/documentos, sectores priorizados, enlaces institucionales y banners temporales.  
> Fecha: 2026-07-31

---

## 1. Estado actual

### 1.1 Arquitectura general

```
Frontend Next.js 16 (es/en)  ──HTTP──▶  Backend Django 5 + DRF  ──▶  PostGIS 15
     :3000                                    :8000                      :5432
```

- **Frontend:** rutas bajo `[locale]`, i18n propio (`es` / `en`), capa de servicios en `frontend/src/services/`.
- **Backend:** 7 apps de dominio bajo `backend/apps/`, API versionada en `/api/v1/`.
- **Admin:** Django Admin estándar en `/admin/` (sesión, staff/superuser).
- **Almacenamiento:** filesystem local (`MEDIA_ROOT = backend/media/`), sin S3 ni `django-storages`.

### 1.2 Backend — apps y responsabilidades

| App | Estado | Rol CMS |
|-----|--------|---------|
| `cms` | Parcial | Páginas, noticias, documentos |
| `investment` | Completo | Sectores, casos de éxito, oportunidades/proyectos |
| `media_library` | Solo admin | Assets compartidos (imágenes) |
| `users` | Stub | Sin modelos ni auth API |
| `core` | Stub | Sin modelos |
| `forms` | Parcial | Leads de descarga (no el recurso en sí) |
| `geo` | Completo | Geografía (no CMS editorial) |

### 1.3 Modelos existentes relevantes

#### `apps.cms` — bases editoriales reutilizables

`TimeStampedModel` → `EditorialModel` con:

- `status` (draft / published / archived)
- `published_at`, `created_by`, `updated_by`
- Métodos `publish()` / `unpublish()`

| Modelo | Campos clave | Workflow editorial |
|--------|--------------|-------------------|
| **Page** | title, slug, content, excerpt, featured_image→MediaAsset, SEO | Sí (`EditorialModel`) |
| **News** | title, slug, summary, content, category, is_featured, featured_image→MediaAsset, SEO | Sí |
| **Document** | title, slug, file, description, category (texto libre), is_public | No (solo timestamps) |

`News.category` incluye `press_release` ("Comunicado"), que cubre **notas de prensa** sin modelo dedicado.

#### `apps.investment`

| Modelo | Campos clave | Workflow editorial |
|--------|--------------|-------------------|
| **Sector** | name, slug, description, short_description, icon, image, color_hex, is_featured, order | No |
| **SuccessStory** | title, slug, company_name, sector FK, summary, content, image, métricas, is_public, is_featured | No |

#### `apps.media_library`

- **MediaAsset:** title, file, alt_text, caption, media_type, uploaded_by. Usado por `Page` y `News`; no expuesto en API pública.

#### Ausentes

- **Enlaces institucionales:** sin modelo.
- **Banners temporales:** sin modelo.

### 1.4 API REST implementada

**CMS** (`/api/v1/cms/`):

| Endpoint | ViewSet | Filtros | Frontend conectado |
|----------|---------|---------|-------------------|
| `GET /pages/` | ReadOnly | publicados | No |
| `GET /news/` | ReadOnly | category, featured | **Sí** (home, prensa) |
| `GET /documents/` | ReadOnly | is_public | **No** |

**Investment** (`/api/v1/investment/`):

| Endpoint | Frontend conectado |
|----------|-------------------|
| `GET /sectors/` | Híbrido (merge con estáticos) |
| `GET /success-stories/` | Solo en detalle de sector |
| `GET /success-stories/{slug}/` | No en `/portafolio/casos` |

**Permisos:** `AllowAny` global en DRF. Solo formularios aceptan POST. Integraciones expuestas sin auth (riesgo).

### 1.5 Django Admin

- **cms:** `EditorialAdminMixin` con acciones publicar/borrador/archivar; fieldsets en español.
- **investment:** CRUD completo para Sector, SuccessStory, etc.
- **media_library:** MediaAsset con alt/caption.
- **forms:** revisión de submissions; `ResourceDownloadLead` captura nombre de recurso como string libre (sin FK a `Document`).

### 1.6 Almacenamiento de archivos

| Patrón upload | Modelo |
|---------------|--------|
| `documents/%Y/%m/` | cms.Document |
| `media_assets/%Y/%m/` | MediaAsset |
| `sectors/%Y/%m/` | Sector |
| `success_stories/%Y/%m/` | SuccessStory |

En DEBUG, `/media/` se sirve desde Django. Producción no define CDN/proxy para media. Docker no monta volumen persistente para `media/` (riesgo en despliegues).

### 1.7 Internacionalización

| Capa | Estado |
|------|--------|
| **Frontend** | Bilingüe completo (`es`/`en`) vía copy estático en `i18n/copy/` y `data/` |
| **Backend** | `LANGUAGE_CODE = es-hn`, `USE_I18N = True`, pero **sin** `LANGUAGES`, `LocaleMiddleware`, archivos `.po`, ni campos traducibles |
| **API** | Campos monolingües; sin header `Accept-Language` |

**Deuda técnica:** `frontend/src/lib/actions/cmsActions.ts` referencia un esquema Drizzle (`@/src/db/schema`) con tablas de traducción (`newsTranslations`, `storyTranslations`, etc.) que **no existe en el repo**. Es código huérfano de un enfoque CMS alternativo abandonado.

### 1.8 Frontend — fuentes de datos por tipo de contenido

| Tipo | Fuente actual | API Django |
|------|---------------|------------|
| **Notas de prensa** | API `/cms/news/` | Conectado |
| **Casos de éxito** | Copy inline en `portafolio/casos/page.tsx` (~280 líneas) | Parcial (solo sector detail) |
| **Recursos/documentos** | `data/resourceCategories.ts` (18 docs, sin URLs reales) | No conectado |
| **Sectores priorizados** | `data/investmentSectors.ts` + `i18n/copy/sectorDetailPage.ts` | Híbrido |
| **Enlaces institucionales** | Hardcoded en `InterestLinksSection.tsx`, `Footer.tsx`, `tramitesCopy` | No |
| **Banners temporales** | No implementado (solo promo estática en footer) | No |

**Datos estáticos huérfanos:** `prensaCopy`, `homeCopy.prensa.items`, `recursosPageCopy` — nunca importados.

### 1.9 Migraciones actuales

| App | Migraciones |
|-----|-------------|
| cms | `0001_initial` (Page, News, Document) |
| investment | `0001_initial`, `0002_alter_investmentproject_project_stage` |
| media_library | `0001_initial` |
| forms | `0001_initial`, `0002_projectapplication_consent_and_more` |
| geo | 3 migraciones |
| integrations | `0001_initial` |

No hay comando `seed_cms`; solo `seed_investment` para datos de inversión.

### 1.10 Autenticación y permisos

- Usuario: `django.contrib.auth.models.User` (default).
- Sin JWT, tokens DRF, ni roles personalizados.
- Admin: sesión Django.
- API pública: lectura sin restricción; escritura solo vía formularios POST.
- Roadmap documentado (`docs/api/01-api-roadmap.md` Fase C): auth DRF + permisos por rol pendiente.

---

## 2. Componentes reutilizables

### Backend

| Componente | Ubicación | Reutilización |
|------------|-----------|---------------|
| `TimeStampedModel` | cms, investment | Base para cualquier modelo nuevo |
| `EditorialModel` + `PublishStatus` | cms | Workflow draft/published/archived para contenido editorial |
| `EditorialAdminMixin` | cms/admin.py | Acciones de publicación en admin |
| `MediaAsset` + `MediaAssetLiteSerializer` | media_library, cms | Imágenes centralizadas con alt/caption |
| DRF `ReadOnlyModelViewSet` | cms, investment | Patrón de API pública de solo lectura |
| `DefaultRouter` + `api_v1.py` | config | Agregación versionada de endpoints |
| Filtros por query params | cms/news, investment | Extensible a nuevos recursos |

### Frontend

| Componente | Reutilización |
|------------|---------------|
| `services/cms.ts` + `types/cms.ts` | Patrón para nuevos servicios (`documents.ts`, `banners.ts`) |
| `lib/api.ts` | Cliente HTTP centralizado |
| `NewsArticle`, `SuccessStory`, `Sector` types | Interfaces parcialmente alineadas con serializers Django |
| Páginas prensa (`prensa/page.tsx`, `[slug]/page.tsx`) | Plantilla para listado + detalle CMS-driven |
| `SectorDetailView`, `SectoresPageView` | Layout listo; falta alimentación completa desde API |
| `ResourcesCategoryView` | Estructura de categorías; falta conectar archivos reales |
| i18n `[locale]` routing | Infraestructura bilingüe del sitio (copy UI separado del contenido CMS) |

---

## 3. Componentes faltantes

### Backend — modelos

| Necesidad | Gap |
|-----------|-----|
| Traducciones es/en por recurso | Sin campos ni tablas de traducción |
| Categorías tipadas de documentos | `Document.category` es texto libre |
| FK Document ↔ ResourceDownloadLead | Lead usa string, no relación |
| Enlaces institucionales | Modelo + agrupación (home, footer, trámites) |
| Banners temporales | Modelo con fechas, placement, prioridad |
| Contenido enriquecido de sectores | stats, advantages, analysis blocks (hoy en TS estático) |
| Editorial workflow en SuccessStory/Document | Solo `is_public` booleano |
| API pública de MediaAsset | Solo admin hoy |
| Seed/management commands CMS | No existe |

### Backend — API

| Endpoint faltante | Propósito |
|-------------------|-----------|
| `GET /cms/documents/?category=` | Filtrar recursos por categoría |
| `GET /cms/institutional-links/` | Enlaces por sección |
| `GET /cms/banners/?placement=` | Banners activos por ubicación |
| `?lang=es\|en` o `Accept-Language` | Contenido traducido |
| `GET /media/` | Assets públicos (roadmap Fase B) |
| Write endpoints protegidos | Solo si se necesita headless CMS fuera del admin |

### Frontend — integración

| Página/componente | Gap |
|-------------------|-----|
| `/portafolio/casos` | Migrar de copy estático a API |
| `/portafolio/casos/[slug]` | Detalle dinámico por slug |
| `/recursos/*` | Conectar a `Document` API |
| `InterestLinksSection`, `Footer` | Consumir API de enlaces |
| Banner global | Componente + fetch de banners activos |
| `services/cms.ts` | Sin funciones para documents, links, banners |
| Eliminar/refactorizar `cmsActions.ts` | Código huérfano con imports rotos |
| Pasar `locale` a API | Hoy no se envía idioma al backend |

---

## 4. Riesgos

| # | Riesgo | Impacto | Mitigación propuesta |
|---|--------|---------|---------------------|
| 1 | **Doble arquitectura CMS** (Django vs Drizzle huérfano) | Confusión, código muerto | Eliminar o archivar `cmsActions.ts`; Django como única fuente de verdad |
| 2 | **Contenido bilingüe sin diseño backend** | API monolingüe vs sitio es/en | Definir estrategia i18n antes de migrar frontend |
| 3 | **Duplicidad Sector** (API + `investmentSectors.ts`) | Inconsistencias de slugs, textos, imágenes | API como fuente canónica; estáticos como fallback temporal |
| 4 | **SuccessStory sin workflow editorial** | Contenido publicado accidentalmente | Extender `EditorialModel` o al menos validar en admin |
| 5 | **Document.category libre** | Categorías inconsistentes en admin | Enum/choices alineado con frontend (`institucional`, `tecnicos`, `biblioteca`) |
| 6 | **Media sin volumen Docker persistente** | Pérdida de uploads en redeploy | Volumen nombrado para `media/` en compose/prod |
| 7 | **Sin CDN/S3 en producción** | Performance y backup de archivos | Plan de almacenamiento object storage |
| 8 | **API integrations sin auth** | Exposición de logs/webhooks | Restringir a staff o eliminar de API pública |
| 9 | **Migración de contenido estático** | ~10+ casos de éxito, 18 docs, 6 sectores con copy extenso | Comando de importación + fase de convivencia |
| 10 | **ResourceDownloadLead desconectado** | Leads sin trazabilidad al documento | FK opcional a Document |
| 11 | **Slugs únicos monolingües** | Conflictos al traducir slugs por idioma | Slugs por locale en tabla de traducción |

---

## 5. Propuesta de modelos

Recomendación: **extender apps existentes** (`cms`, `investment`) en lugar de crear una app nueva, para aprovechar admin, migraciones y patrones ya establecidos. Añadir un módulo `translations.py` compartido o mixin en `apps.core`.

### 5.1 Estrategia i18n recomendada

**Tablas de traducción** (patrón similar al Drizzle planeado, pero en Django):

```python
# apps/core/models.py (nuevo)
class Locale(models.TextChoices):
    ES = "es", "Español"
    EN = "en", "English"

# Ejemplo: NewsTranslation
class NewsTranslation(models.Model):
    news = models.ForeignKey(News, related_name="translations")
    locale = models.CharField(max_length=5, choices=Locale.choices)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)  # unique per (news, locale)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        unique_together = [("news", "locale"), ("locale", "slug")]
```

Alternativa más simple (menor esfuerzo admin): **django-modeltranslation** con campos `_es`/`_en`. Recomendación: tablas de traducción por flexibilidad de slugs y alineación con el frontend.

### 5.2 Notas de prensa — extender `News` (existente)

Sin modelo nuevo. Cambios:

- Añadir `NewsTranslation` (title, slug, summary, content, seo_*).
- Deprecar campos monolingües en `News` tras migración (o mantener `es` como fallback).
- Filtrar en API: `?category=press_release&lang=es`.
- Admin: inline de traducciones en `NewsAdmin`.

### 5.3 Casos de éxito — extender `SuccessStory`

```python
class SuccessStory(EditorialModel):  # migrar de TimeStampedModel
    # campos existentes +
    image → ForeignKey(MediaAsset)  # reemplazar FileField directo
    logo = ForeignKey(MediaAsset, null=True)  # para cards home
    testimonial_quote = models.TextField(blank=True)
    testimonial_author = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

class SuccessStoryTranslation(models.Model):
    story = FK(SuccessStory)
    locale = CharField
    title, slug, summary, content  # unique slug per locale
```

### 5.4 Recursos y documentos — extender `Document`

```python
class DocumentCategory(models.TextChoices):
    INSTITUCIONAL = "institucional"
    TECNICOS = "tecnicos"
    BIBLIOTECA = "biblioteca"
    ESTUDIOS = "estudios"  # alinear con /recursos/estudios

class Document(EditorialModel):  # añadir workflow
    file = FileField
    file_type = CharField  # pdf, xlsx, etc. (auto-detect)
    file_size_bytes = PositiveIntegerField(null=True)
    icon = CharField  # material icon name
    is_featured = BooleanField(default=False)
    order = PositiveIntegerField(default=0)
    category = CharField(choices=DocumentCategory.choices)
    cover_image = FK(MediaAsset, null=True)

class DocumentTranslation(models.Model):
    document = FK(Document)
    locale, title, slug, description
```

Vincular `ResourceDownloadLead.document = FK(Document, null=True)`.

### 5.5 Sectores priorizados — extender `Sector`

```python
class SectorTranslation(models.Model):
    sector = FK(Sector)
    locale
    name, slug, description, short_description
    # Contenido enriquecido (hoy en sectorDetailPage.ts):
    hero_badge, hero_title_parts (JSON o campos)
    stats = JSONField  # [{value, label}]
    advantages = JSONField  # [{title, text, wide}]
    analysis_eyebrow, analysis_title, analysis_intro
```

Mantener `icon`, `color_hex`, `image`, `order`, `is_featured`, `is_active` en el modelo base (no traducibles).

### 5.6 Enlaces institucionales — nuevo en `cms`

```python
class LinkSection(models.TextChoices):
    HOME_INTEREST = "home_interest"
    FOOTER_EXTERNAL = "footer_external"
    TRAMITES = "tramites"
    TOP_BAR = "top_bar"

class InstitutionalLink(TimeStampedModel):
    section = CharField(choices=LinkSection)
    icon = CharField  # InterestLinkIconId o URL
    accent_color = CharField(max_length=7, blank=True)
    url = URLField
    is_external = BooleanField(default=True)
    is_active = BooleanField(default=True)
    order = PositiveIntegerField(default=0)

class InstitutionalLinkTranslation(models.Model):
    link = FK(InstitutionalLink)
    locale, title, description (optional)
```

### 5.7 Banners temporales — nuevo en `cms`

```python
class BannerPlacement(models.TextChoices):
    SITE_TOP = "site_top"       # barra superior global
    HOME_HERO = "home_hero"     # overlay en hero
    FOOTER = "footer"

class SiteBanner(EditorialModel):
    placement = CharField(choices=BannerPlacement)
    priority = PositiveIntegerField(default=0)
    starts_at = DateTimeField(null=True)
    ends_at = DateTimeField(null=True)
    background_color = CharField(max_length=7, blank=True)
    text_color = CharField(max_length=7, blank=True)
    link_url = URLField(blank=True)
    link_external = BooleanField(default=False)
    dismissible = BooleanField(default=True)
    image = FK(MediaAsset, null=True)

class SiteBannerTranslation(models.Model):
    banner = FK(SiteBanner)
    locale, title, body, cta_label
```

Queryset API: activos donde `status=published`, `starts_at <= now <= ends_at` (o null = sin límite).

---

## 6. Propuesta de endpoints

Base: `/api/v1/`. Todos read-only públicos; filtro de idioma obligatorio vía `?lang=es|en` (default `es`).

### CMS ampliado (`/api/v1/cms/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/news/` | Lista; `?category=press_release`, `?featured=true`, `?lang=` |
| GET | `/news/{slug}/` | Detalle (slug por locale) |
| GET | `/documents/` | `?category=institucional\|tecnicos\|biblioteca\|estudios`, `?featured=true`, `?lang=` |
| GET | `/documents/{slug}/` | Detalle + URL de archivo |
| GET | `/institutional-links/` | `?section=home_interest\|footer_external\|tramites`, `?lang=` |
| GET | `/banners/` | `?placement=site_top\|home_hero\|footer`, `?lang=` — solo activos en ventana temporal |
| GET | `/pages/` | Existente + `?lang=` |

### Investment ampliado (`/api/v1/investment/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sectors/` | Con traducciones + contenido enriquecido, `?lang=` |
| GET | `/sectors/{slug}/` | Detalle completo traducido |
| GET | `/success-stories/` | `?sector=`, `?featured=true`, `?lang=` |
| GET | `/success-stories/{slug}/` | Detalle traducido |

### Media (`/api/v1/media/`) — nueva app o extensión de media_library

| GET | `/assets/{id}/` | Metadatos + URL pública |

### Forms (ajuste)

| POST | `/resource-download/` | Aceptar `document_id` además de `resource_name` |

### Convención de respuesta traducida

```json
{
  "id": 1,
  "slug": "sinclair-agroindustria",
  "title": "Sinclair",
  "summary": "...",
  "locale": "es",
  "featured_image": { "file": "/media/...", "alt_text": "..." }
}
```

El serializer resuelve traducción según `lang`; fallback a `es` si falta traducción.

---

## 7. Archivos que deberán modificarse

### Backend — nuevos

| Archivo | Propósito |
|---------|-----------|
| `apps/core/models.py` | Mixins compartidos (Locale, TranslatableMixin) |
| `apps/cms/models/translations.py` | NewsTranslation, DocumentTranslation, etc. |
| `apps/cms/models/banners.py` | SiteBanner, SiteBannerTranslation |
| `apps/cms/models/links.py` | InstitutionalLink, InstitutionalLinkTranslation |
| `apps/cms/serializers/` | Serializers con soporte i18n |
| `apps/cms/filters.py` | Filtros lang, category, placement |
| `apps/cms/migrations/0002_*.py` | Nuevos modelos y campos |
| `apps/investment/migrations/0003_*.py` | SectorTranslation, SuccessStoryTranslation |
| `apps/media_library/api_urls.py` | Endpoint público de assets |
| `apps/cms/management/commands/seed_cms.py` | Importar contenido estático inicial |
| `apps/cms/management/commands/import_static_content.py` | Migración one-shot desde TS |

### Backend — modificar

| Archivo | Cambio |
|---------|--------|
| `apps/cms/models.py` | Refactor + FK changes |
| `apps/cms/admin.py` | Inlines de traducción, nuevos admins |
| `apps/cms/viewsets.py` | Nuevos viewsets, filtro lang |
| `apps/cms/api_urls.py` | Registrar links, banners |
| `apps/cms/serializers.py` | Serializers traducidos |
| `apps/investment/models.py` | EditorialModel en SuccessStory, translations |
| `apps/investment/admin.py` | Inlines traducción |
| `apps/investment/serializers.py` | Sector/SuccessStory traducidos |
| `apps/investment/viewsets.py` | Filtro lang, featured en success stories |
| `apps/forms/models.py` | FK document en ResourceDownloadLead |
| `config/settings/base.py` | Posible middleware lang; STORAGES futuro |
| `config/api_v1.py` | Incluir media si aplica |
| `docker-compose.yml` | Volumen persistente para media |
| `docs/api/01-api-roadmap.md` | Actualizar estado |

### Frontend — modificar

| Archivo | Cambio |
|---------|--------|
| `src/services/cms.ts` | documents, links, banners + param lang |
| `src/services/investment.ts` | lang param, getSuccessStory |
| `src/types/cms.ts` | Document, InstitutionalLink, SiteBanner |
| `src/types/investment.ts` | Sector enriquecido traducido |
| `src/lib/api.ts` | Helper `apiGetLocalized()` |
| `src/app/[locale]/prensa/**` | Pasar locale a API |
| `src/app/[locale]/portafolio/casos/**` | Reemplazar copy estático por API |
| `src/app/[locale]/recursos/**` | Conectar documents API |
| `src/app/[locale]/invertir/sectores/**` | Reducir dependencia de estáticos |
| `src/components/cni/InterestLinksSection.tsx` | Props desde API o server fetch |
| `src/components/layout/Footer.tsx` | Enlaces footer desde API |
| `src/components/cni/HomePageView.tsx` | Sectores, casos, banners desde API |
| `src/components/cni/SectoresPageView.tsx` | Stats/contenido desde API |
| `src/components/cni/SectorDetailView.tsx` | Contenido enriquecido API |
| `src/components/cni/ResourcesCategoryView.tsx` | Docs con URLs reales |

### Frontend — eliminar o deprecar (post-migración)

| Archivo | Razón |
|---------|-------|
| `src/lib/actions/cmsActions.ts` | Imports rotos, enfoque abandonado |
| `src/data/resourceCategories.ts` | Reemplazado por API |
| `src/data/investmentSectors.ts` | Fallback temporal, luego eliminar |
| `src/i18n/copy/sectorDetailPage.ts` | Migrar a CMS |
| Copy huérfano en `secondaryPages.ts`, `recursosPage.ts` | Limpieza |

---

## 8. Plan de implementación por fases

### Fase 0 — Fundamentos (1–2 semanas)

**Objetivo:** infraestructura i18n y almacenamiento sin romper lo existente.

- Definir ADR para estrategia de traducciones (tablas vs modeltranslation).
- Crear mixins en `apps/core` (`Locale`, base de traducción).
- Volumen Docker para `media/`; documentar estrategia prod (S3/local).
- Middleware o utilidad DRF para resolver `?lang=`.
- Comando `seed_cms` vacío + tests de serializers.
- Eliminar o aislar `cmsActions.ts` huérfano.

**Entregable:** API existente sigue funcionando; infraestructura i18n lista.

---

### Fase 1 — Notas de prensa completas (1 semana)

**Objetivo:** prensa bilingüe end-to-end (ya parcialmente conectada).

- `NewsTranslation` + migración de datos existentes a `es`.
- Serializer/API con `?lang=`.
- Admin con inline de traducciones EN.
- Frontend: pasar `locale` en `getNews()` / `getNewsArticle()`.
- Seed/import de artículos de ejemplo desde copy estático huérfano.

**Entregable:** Sala de prensa 100% CMS, es/en.

---

### Fase 2 — Recursos y documentos (1–2 semanas)

**Objetivo:** `/recursos/*` con archivos reales descargables.

- Extender `Document` (category enum, featured, order, EditorialModel).
- `DocumentTranslation` + admin.
- `GET /cms/documents/` con filtros.
- Frontend: `services/cms.ts` + migrar `recursos/page.tsx`, `[slug]/page.tsx`.
- Vincular `ResourceDownloadLead.document`.
- Import inicial desde `resourceCategories.ts` + PDFs de `estudiosPage.ts`.

**Entregable:** biblioteca de documentos administrable con descargas funcionales.

---

### Fase 3 — Casos de éxito (1–2 semanas)

**Objetivo:** portafolio dinámico.

- Migrar `SuccessStory` a `EditorialModel`.
- `SuccessStoryTranslation`; imagen vía `MediaAsset`.
- Filtros `?featured=true`, `?sector=`, `?lang=`.
- Reescribir `/portafolio/casos` y `[slug]` para consumir API.
- Import de ~10 casos desde copy estático actual.
- Conectar home testimonials a API.

**Entregable:** casos de éxito CRUD desde admin, detalle por slug.

---

### Fase 4 — Sectores priorizados (2 semanas)

**Objetivo:** sectores como fuente canónica en API.

- `SectorTranslation` con contenido enriquecido (stats, advantages JSON).
- Serializer detallado; seed desde `investmentSectors.ts` + `sectorDetailPage.ts`.
- Frontend: eliminar merge híbrido; API primero, fallback estático solo en dev.
- Admin: editor de bloques JSON o fieldsets por sección.

**Entregable:** 6 sectores editables en es/en sin tocar código frontend.

---

### Fase 5 — Enlaces institucionales (1 semana)

**Objetivo:** enlaces administrables.

- Modelos `InstitutionalLink` + traducciones.
- API por sección.
- Migrar `InterestLinksSection`, `Footer`, `/tramites`.
- Admin agrupado por sección con reorder.

**Entregable:** enlaces home, footer y trámites desde admin.

---

### Fase 6 — Banners temporales (1 semana)

**Objetivo:** avisos programables.

- Modelos `SiteBanner` + traducciones.
- API con lógica de ventana temporal y prioridad.
- Componente `SiteBannerBar` en layout global.
- Admin con preview de fechas.

**Entregable:** banners activables/desactivables con vigencia.

---

### Fase 7 — Endurecimiento y limpieza (1–2 semanas)

- Restringir endpoints de integrations.
- Auth DRF para futuros write endpoints (Fase C roadmap).
- OpenAPI schema (drf-spectacular).
- Eliminar datos estáticos deprecados.
- Tests de integración API + E2E prensa/recursos/casos.
- Documentación admin para editores institucionales.

---

## Resumen ejecutivo

| Contenido | Backend hoy | Frontend hoy | Esfuerzo principal |
|-----------|---------------|--------------|-------------------|
| Notas de prensa | Modelo + API ✅ | Conectado ✅ | i18n + traducciones |
| Casos de éxito | Modelo + API ✅ | Estático ❌ | Conectar frontend + i18n + editorial |
| Recursos/documentos | Modelo + API ✅ | Estático ❌ | Categorías tipadas + conectar frontend |
| Sectores | Modelo + API parcial | Híbrido ⚠️ | Contenido enriquecido bilingüe |
| Enlaces institucionales | No existe ❌ | Hardcoded ❌ | Modelo nuevo + migración |
| Banners temporales | No existe ❌ | No existe ❌ | Modelo nuevo + componente layout |

El backend ya tiene **~60% de la base de datos** necesaria repartida entre `cms` e `investment`. Los gaps críticos son **internacionalización**, **dos tipos de contenido nuevos** (enlaces, banners) y **conectar el frontend** a APIs que ya existen pero no se consumen. La deuda del esquema Drizzle huérfano debe resolverse adoptando Django como única fuente de verdad.

---

## Referencias

- [`docs/api/01-api-roadmap.md`](../api/01-api-roadmap.md)
- [`docs/architecture/01-solution-architecture.md`](../architecture/01-solution-architecture.md)
- [`docs/00-project-status-and-achievements.md`](../00-project-status-and-achievements.md)
- [`docs/roadmap/01-four-month-roadmap.md`](../roadmap/01-four-month-roadmap.md)
