# Plan de implementación: CMS institucional (15 días)

> Ejecuta la arquitectura corregida de [`02-cms-auditoria-y-arquitectura-corregida.md`](02-cms-auditoria-y-arquitectura-corregida.md).
> Decisiones ya tomadas (no rediscutir durante la ejecución): **django-modeltranslation** con columnas `_es`/`_en`, **slug único compartido**, sectores solo con campos base traducidos, edición exclusivamente vía Django Admin (sin write API), documentos públicos por definición.
> Fecha: 2026-07-31

---

## Estructura del plan

8 bloques secuenciales. Cada bloque termina con el sitio funcionando (sin estados intermedios rotos) y tiene criterios de aceptación verificables. Backend y frontend del mismo tipo de contenido se entregan juntos: nada de "API lista pero sin consumir".

| Bloque | Días | Entrega |
|--------|------|---------|
| 0 | 1–2 | Fundamentos: i18n, seguridad base, workflow, limpieza |
| 1 | 3–4 | Notas de prensa bilingües end-to-end |
| 2 | 5–7 | Recursos y documentos descargables |
| 3 | 8–10 | Casos de éxito dinámicos |
| 4 | 11 | Enlaces institucionales |
| 5 | 12 | Banners temporales |
| 6 | 13 | Sectores: campos base bilingües |
| 7 | 14–15 | SEO, seeds consolidados, tests, cierre |

---

## Bloque 0 — Fundamentos (días 1–2)

### 0.1 Dependencia e i18n backend

- `backend/requirements.txt`: añadir `django-modeltranslation`.
- `config/settings/base.py`:
  - `"modeltranslation"` en `INSTALLED_APPS` **antes** de `django.contrib.admin` (requisito de la librería; hoy admin está primero en la línea 35).
  - ```python
    LANGUAGES = [("es", "Español"), ("en", "English")]
    MODELTRANSLATION_DEFAULT_LANGUAGE = "es"
    MODELTRANSLATION_FALLBACK_LANGUAGES = ("es",)
    ```
  - `LANGUAGE_CODE` pasa de `es-hn` a `es` (modeltranslation exige que el default esté en `LANGUAGES`).

### 0.2 Seguridad y paginación (config, ~2 h)

En `REST_FRAMEWORK` (`base.py:144`):

```python
"DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
"PAGE_SIZE": 20,
"DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
"DEFAULT_THROTTLE_RATES": {"anon": "120/min", "forms": "10/min"},
```

- Throttle scope `forms` aplicado a los viewsets de POST en `apps/forms`.
- Viewsets de `apps/integrations`: `permission_classes = [IsAdminUser]`.
- **Impacto frontend**: las respuestas de lista pasan a formato paginado `{count, next, previous, results}`. Ajustar `frontend/src/lib/api.ts` y `services/cms.ts` / `services/investment.ts` el mismo día para leer `results` (helper único `unwrapPage<T>()`).

### 0.3 Workflow editorial

En `apps/cms/models.py`:

- `publish()` / `unpublish()` terminan en `self.save(update_fields=["status", "published_at", "updated_at"])`.
- `PublishedManager` con método `published()` (filtro `status=published, published_at__lte=now`); adoptarlo en los tres viewsets de `apps/cms/viewsets.py` (hoy repiten el filtro a mano) y en los de investment cuando corresponda.
- `EditorialModel.Meta.permissions = [("can_publish", "Puede publicar contenido")]`.
- `EditorialAdminMixin` (`apps/cms/admin.py`): ocultar acciones publicar/archivar y dejar `status` readonly si `not request.user.has_perm("cms.can_publish")`.
- Data migration en `apps/users` que crea los Groups **Editor** (add/change/view de modelos CMS e investment editoriales) y **Publicador** (Editor + `can_publish`).

### 0.4 Infraestructura y limpieza

- `docker-compose.yml`: volumen nombrado para `backend/media/`.
- Registrar traducciones existentes: `apps/cms/translation.py` con `News` (title, summary, content, seo_title, seo_description), `Page` (title, content, excerpt, seo_*), `Document` (title, description). Migración resultante: columnas `_es`/`_en`; correr `python manage.py update_translation_fields` para copiar los valores actuales a `_es`.
- Utilidad de idioma: `apps/core/api.py` con

  ```python
  def resolve_lang(request) -> str:
      lang = request.query_params.get("lang", "es")
      return lang if lang in {"es", "en"} else "es"
  ```

  y un mixin `LocalizedViewSetMixin` que hace `translation.activate(lang)` en `initial()` — los serializers existentes devuelven el idioma correcto sin tocarse campo por campo.
- Frontend: eliminar `src/lib/actions/cmsActions.ts` (imports rotos a `@/src/db/schema`); barrer referencias.

**Aceptación bloque 0**

- [ ] `GET /api/v1/cms/news/` pagina (20) y respeta `?lang=en` con fallback a español.
- [ ] `GET /api/v1/integrations/...` devuelve 403 anónimo.
- [ ] Usuario del grupo Editor no ve la acción "Publicar" en admin; Publicador sí.
- [ ] `docker compose down && up` no pierde archivos de `media/`.
- [ ] El sitio actual (prensa, home) sigue funcionando con las respuestas paginadas.

---

## Bloque 1 — Notas de prensa bilingües (días 3–4)

Backend (News ya quedó traducible en el bloque 0):

- `NewsViewSet`: adoptar `LocalizedViewSetMixin` + `objects.published()`. Filtros `category`/`featured` ya existen.
- Admin: modeltranslation `TranslationAdmin` sobre `NewsAdmin` → pestañas ES/EN por campo.

Frontend:

- `services/cms.ts`: `getNews()` / `getNewsArticle(slug)` aceptan `locale` y lo pasan como `?lang=`.
- `app/[locale]/prensa/page.tsx` y `[slug]/page.tsx`: pasar `params.locale`; fetch con `next: { revalidate: 300 }`.
- Import inicial: management command `import_press_content` que crea artículos desde el copy huérfano (`prensaCopy`, `homeCopy.prensa.items`) como borradores ES; EN queda para el equipo editorial.

**Aceptación**

- [ ] `/es/prensa` y `/en/prensa` muestran el mismo artículo con textos por idioma (fallback ES si falta EN).
- [ ] Editor traduce un artículo solo desde admin, sin deploy.

---

## Bloque 2 — Recursos y documentos (días 5–7)

Backend (`apps/cms`):

- `Document` migra de `TimeStampedModel` a `EditorialModel`. Migración en dos pasos: (1) añadir campos con defaults, (2) data migration `is_public=True → status=published, published_at=created_at`.
- Campos nuevos: `category` con `DocumentCategory.choices` (`institucional | tecnicos | biblioteca | estudios`), `is_featured`, `order`, `cover_image FK(MediaAsset)`, `file_type`, `file_size_bytes`.
- Validación: `FileExtensionValidator(["pdf","docx","xlsx","pptx","zip"])` + límite 25 MB en `clean()`; `file_type`/`file_size_bytes` autollenados en `save()`.
- Data migration que mapea las categorías de texto libre existentes al enum (las no mapeables → `biblioteca`, log en la migración).
- `DocumentViewSet`: `lookup_field = "slug"`, filtros `?category=`, `?featured=`, manager `published()`, mixin de idioma.
- `apps/forms`: `ResourceDownloadLead.document = FK(Document, null=True, on_delete=SET_NULL)`; el serializer del POST acepta `document_id` opcional manteniendo `resource_name`.

Frontend:

- `types/cms.ts`: interfaz `CmsDocument`.
- `services/cms.ts`: `getDocuments({category, featured, locale})`, `getDocument(slug, locale)`.
- `app/[locale]/recursos/**` y `ResourcesCategoryView`: reemplazar `data/resourceCategories.ts` por la API; el botón de descarga apunta al `file` real y dispara el POST de lead con `document_id`.
- Import: command `import_documents` desde `resourceCategories.ts` (exportado a JSON en `docs/cms/seed/`); los 18 registros entran como `draft` con archivo placeholder si el PDF real no está — la carga final es del equipo editorial.

**Aceptación**

- [ ] `/es/recursos/tecnicos` lista solo documentos `published` de esa categoría, descargables.
- [ ] Subir un `.exe` o un PDF de 30 MB falla en admin con mensaje claro.
- [ ] El lead de descarga queda vinculado por FK al documento.

---

## Bloque 3 — Casos de éxito (días 8–10)

Backend (`apps/investment`):

- `SuccessStory` migra a `EditorialModel` (data migration: `is_public=True → published`). Se añaden `logo FK(MediaAsset)`, `testimonial_quote`, `testimonial_author`, `order`. `image` se mantiene como está (cambiarla a MediaAsset no bloquea nada; se anota como mejora futura para no gastar días en re-subir imágenes).
- `apps/investment/translation.py`: `SuccessStory` (title, summary, content, textos de métricas) y registro de `Sector` (name, short_description, description) — la migración de Sector se aprovecha ya para el bloque 6.
- Viewsets: manager `published()`, mixin idioma, filtros `?sector=` (existe) y `?featured=`.

Frontend:

- `services/investment.ts`: `getSuccessStories({featured, sector, locale})`, `getSuccessStory(slug, locale)`.
- Reescribir `app/[locale]/portafolio/casos/page.tsx` (hoy ~280 líneas de copy inline) como listado desde API; crear `[slug]/page.tsx` para el detalle.
- `HomePageView` / `successStoriesHome.ts`: cards y testimonials de home desde `?featured=true` (el estático queda como fallback si la API devuelve vacío, marcado `TODO remove`).
- Import: command `import_success_stories` desde el copy actual (~10 casos, ES; EN editorial).

**Aceptación**

- [ ] `/es/portafolio/casos` y detalle por slug 100% desde API, bilingüe.
- [ ] Caso en `draft` no aparece en el sitio ni en home.
- [ ] Home muestra los destacados administrados desde admin.

---

## Bloque 4 — Enlaces institucionales (día 11)

Backend (`apps/cms/models.py` + `translation.py`):

```python
class LinkSection(TextChoices):
    HOME_INTEREST, FOOTER_EXTERNAL, TRAMITES, TOP_BAR

class InstitutionalLink(TimeStampedModel):
    section, url, is_external, icon, accent_color, is_active, order
    title, description   # traducibles
```

- ViewSet read-only `?section=`, solo `is_active=True`, orden por `order`. Registrar en `apps/cms/api_urls.py`.
- Admin con `list_editable = ("order", "is_active")` y filtro por sección.
- Data migration/seed desde los hardcodes de `InterestLinksSection.tsx`, `Footer.tsx` y `tramitesCopy`.

Frontend: `getInstitutionalLinks(section, locale)` en `services/cms.ts`; `InterestLinksSection` y `Footer` reciben los enlaces por props desde server components (`revalidate: 3600`); página `/tramites` igual.

**Aceptación**

- [ ] Cambiar URL/orden de un enlace del footer desde admin se refleja sin deploy (≤1 h por ISR).

---

## Bloque 5 — Banners temporales (día 12)

Backend (`apps/cms`):

```python
class SiteBanner(EditorialModel):
    placement   # site_top | home_hero | footer
    starts_at, ends_at, priority, link_url, link_external,
    dismissible, background_color, text_color, image FK(MediaAsset)
    title, body, cta_label   # traducibles
```

- Regla de visibilidad (documentada en el modelo): visible ⇔ `status=published` **y** ventana temporal activa (`starts_at`/`ends_at` null = sin límite). El estado no cambia solo; la ventana decide — sin cron.
- ViewSet `?placement=`, orden `-priority`; queryset con la ventana evaluada en `now()`.
- Admin: fieldset de vigencia + validación `ends_at > starts_at`.

Frontend:

- `SiteBannerBar` en el layout global de `[locale]`: fetch `placement=site_top` con `revalidate: 300`, dismiss por `sessionStorage` cuando `dismissible`.
- Tipos y servicio en `types/cms.ts` / `services/cms.ts`.

**Aceptación**

- [ ] Banner con vigencia futura no aparece; aparece al entrar en ventana y desaparece al salir, sin intervención.
- [ ] Dismiss no reaparece en la misma sesión.

---

## Bloque 6 — Sectores base bilingües (día 13)

- La migración de traducciones de `Sector` ya corrió en el bloque 3; hoy: `update_translation_fields`, admin `TranslationAdmin`, `?lang=` en `SectorViewSet`.
- Frontend: `SectoresPageView` y las cards de home toman `name`/`short_description`/`description` de la API según locale; el **contenido enriquecido del detalle** (stats, advantages, hero) **sigue en** `sectorDetailPage.ts` — recorte deliberado de alcance (auditoría P4), documentado como fase futura.
- Reducir el merge híbrido de `data/investmentSectors.ts` a lo que la API no cubre (assets de diseño), con comentario que delimita qué queda estático y por qué.

**Aceptación**

- [ ] Renombrar un sector en admin (ES y EN) se refleja en listados y cards sin deploy.
- [ ] El detalle del sector sigue idéntico visualmente (sin regresión).

---

## Bloque 7 — Cierre: SEO, seeds, tests (días 14–15)

### SEO (frontend)

- `app/sitemap.ts`: URLs de prensa, recursos, casos y sectores desde la API, ambos locales.
- `generateMetadata` en los cuatro detalles: canonical, `alternates.languages` (hreflang `es`/`en`/`x-default` — trivial por slug compartido), `openGraph.images` desde `featured_image`/`cover_image`. Centralizar helper en `src/lib/seo.ts` (ya existe).
- Verificar que ningún detalle CMS quede client-only.

### Seeds y datos

- Command `seed_cms` que orquesta los imports de los bloques 1–4 de forma idempotente (por slug), para ambientes nuevos.
- Sesión de carga con el equipo editorial: PDFs reales, imágenes, traducciones EN prioritarias.

### Tests (backend, pytest/Django TestCase)

- Serializers: fallback EN→ES, formato paginado.
- Permisos: Editor no puede publicar; anónimo no accede a integrations; throttle de forms responde 429.
- Banners: matriz de ventana temporal (antes/durante/después/null).
- Documents: validación de extensión y tamaño; draft no listado.
- Smoke E2E (Playwright si ya está en el repo; si no, curl script en CI): prensa lista y detalle en es/en, recursos descarga, casos detalle.

### Documentación

- Guía de editor (1 página, en `docs/cms/04-guia-editores.md`): flujo borrador→publicado, pestañas de idioma, banners con vigencia.
- Actualizar `docs/api/01-api-roadmap.md` con el estado real.
- Limpieza final: borrar `data/resourceCategories.ts`, copy huérfano (`prensaCopy`, `recursosPageCopy`) y los fallbacks marcados `TODO remove` que ya no se usen.

**Aceptación final del proyecto**

- [ ] Los 6 tipos de contenido se administran desde `/admin/` en es/en sin tocar código.
- [ ] `sitemap.xml` y hreflang válidos (probar con un crawler).
- [ ] Suite de tests verde en CI.
- [ ] Ningún import roto ni dato estático duplicado con la API.

---

## Dependencias entre bloques

```
B0 ──▶ B1 ──▶ B2 ──▶ B3 ──▶ B6
        │                └──▶ (translation de Sector se crea en B3)
        ├──▶ B4 (independiente tras B0, puede adelantarse si B2 se atasca)
        └──▶ B5 (independiente tras B0)
```

B4 y B5 son las válvulas de holgura: si los bloques 2–3 se retrasan por contenido real faltante, se intercalan sin bloquear.

## Riesgos operativos y mitigación

| Riesgo | Mitigación en el plan |
|--------|----------------------|
| PDFs/imágenes reales no disponibles a tiempo | Los imports crean registros `draft` con placeholder; la carga es editorial, no bloquea código (B2/B3) |
| Traducciones EN incompletas al día 15 | Fallback ES nativo: el sitio EN nunca rompe, solo muestra ES donde falte |
| Paginación rompe consumidores actuales | Se ajusta `lib/api.ts` el mismo día 1 dentro del bloque 0 |
| Migrar `Document`/`SuccessStory` a `EditorialModel` con datos en prod | Migraciones en dos pasos con data migration explícita `is_public → status`; probar contra dump de prod antes de desplegar |
| `modeltranslation` + admin actual | Registrar apps en el orden requerido el día 1 y validar admin completo antes de continuar |

## Fuera de alcance (explícito)

Contenido enriquecido de sectores en CMS, S3/CDN para media, Redis, JWT / write API headless, documentos privados con URL firmada, drf-spectacular, page builder. Cada uno queda anotado en el roadmap, no implementado.
