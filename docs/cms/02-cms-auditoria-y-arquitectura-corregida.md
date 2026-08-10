# Auditoría técnica: propuesta de CMS institucional

> Revisión de [`01-cms-institucional-analisis.md`](01-cms-institucional-analisis.md) como arquitecto senior / auditor técnico.
> Veredicto general: **el diagnóstico del estado actual es correcto y bien fundamentado, pero la arquitectura propuesta no cabe en 15 días y sobre-modela la internacionalización.** Con dos correcciones estructurales (i18n por columnas y recorte de alcance en sectores) el plan sí es ejecutable en 15 días.
> Fecha: 2026-07-31

## Regla arquitectónica (S2-T4)

**Page heroes are static frontend assets and are outside CMS scope.**

Los heroes de páginas públicas (home, prensa, recursos, casos, oportunidades, sectores, institucionales) no se administran vía CMS. El CMS solo edita contenido dinámico debajo del hero.

---

## 1. Veredicto por criterio

| # | Criterio | Evaluación | Nota |
|---|----------|-----------|------|
| 1 | Separación de responsabilidades | ✅ Correcta con una objeción | Extender `cms`/`investment` es lo adecuado; el contenido enriquecido de sectores en JSON rompe la frontera contenido/presentación |
| 2 | Normalización de modelos | ⚠️ Sobre-normalizada | 7 tablas de traducción para 2 idiomas fijos es el patrón equivocado |
| 3 | Soporte bilingüe | ⚠️ Diseño incompleto | Falta política de fallback por campo, cache por idioma y decisión de slug |
| 4 | Publicación por estados | ✅ Con defectos menores | `publish()` no persiste; falta manager centralizado; doble mecanismo en banners |
| 5 | SEO | ❌ Ausente en la propuesta | Sin sitemap, hreflang, canonical ni og:image |
| 6 | Archivos e imágenes | ⚠️ Parcial | Sin validación de tipo/tamaño; `is_public` no protege el archivo físico |
| 7 | Seguridad | ⚠️ Detectada pero pospuesta | `AllowAny` global, sin throttling ni paginación — no puede esperar a "Fase 7" |
| 8 | Permisos editoriales | ❌ Pospuestos indefinidamente | Dos grupos Django resuelven el 90% con ~medio día de trabajo |
| 9 | Rendimiento | ⚠️ Riesgos no tratados | Sin paginación DRF (verificado), N+1 por tablas de traducción, sin estrategia de caché/ISR |
| 10 | Escalabilidad sin sobrearquitectura | ❌ Incumple la restricción | El propio plan suma 9–12 semanas contra el mandato de 15 días |

---

## 2. Problemas concretos

### P1 — El plan propuesto dura 9–12 semanas, no 15 días

Sumando las fases del documento: Fase 0 (1–2 sem) + F1 (1) + F2 (1–2) + F3 (1–2) + F4 (2) + F5 (1) + F6 (1) + F7 (1–2) = **9 a 12 semanas**. Es un buen roadmap de trimestre, pero incumple la restricción explícita. La causa raíz son los dos problemas siguientes.

### P2 — Tablas de traducción: sobrearquitectura para 2 idiomas fijos

La propuesta crea **7 modelos nuevos de traducción** (`NewsTranslation`, `DocumentTranslation`, `SuccessStoryTranslation`, `SectorTranslation`, `InstitutionalLinkTranslation`, `SiteBannerTranslation`, más `PageTranslation` implícito), cada uno con:

- migración propia + migración de datos desde los campos monolingües existentes,
- inline de admin,
- serializer con resolución de traducción y fallback manual,
- `prefetch_related("translations")` obligatorio en cada queryset (riesgo N+1 si se olvida),
- lógica de "qué pasa si falta la traducción EN" repetida en cada serializer.

El patrón de tabla de traducción se justifica cuando los idiomas son **dinámicos o numerosos**. Aquí son exactamente dos y no van a cambiar (sitio institucional es/en). **`django-modeltranslation`** (columnas `title_es`/`title_en` generadas por registro) da:

- una sola migración por app (columnas añadidas),
- los datos existentes en español quedan automáticamente como `_es` (sin migración de datos),
- fallback EN→ES nativo (`MODELTRANSLATION_FALLBACK_LANGUAGES`),
- admin con pestañas por idioma sin escribir inlines,
- cero N+1: todo vive en la misma fila.

El documento descarta esta opción por "flexibilidad de slugs por idioma", lo cual lleva a P3.

### P3 — Slug por idioma: costo alto, beneficio nulo aquí

El frontend enruta por `[locale]/seccion/[slug]`. Con slug por idioma:

- el `unique_together ("locale", "slug")` obliga a resolver el detalle por par (slug, lang);
- hreflang y el language switcher necesitan un endpoint que devuelva **ambos** slugs de cada entidad;
- cambiar de idioma en una página de detalle requiere lookup adicional.

Para un sitio institucional, un **slug único compartido** (derivado del título en español) es práctica estándar (`/es/prensa/foo` ↔ `/en/prensa/foo`), hace el hreflang trivial y elimina el único argumento contra modeltranslation. El riesgo 11 del documento ("conflictos al traducir slugs") desaparece por diseño.

### P4 — `SectorTranslation` con JSON de presentación viola la separación contenido/plantilla

`hero_title_parts`, `stats`, `advantages` con flag `wide`, `analysis_eyebrow`… son **estructura de la plantilla actual** de `SectorDetailView`, no contenido editorial. Meterlos en JSONField por idioma:

- duplica en ES y EN datos no traducibles (valores numéricos de stats, flags de layout),
- convierte el admin en un editor de JSON crudo sin validación (el propio plan lo admite: "editor de bloques JSON o fieldsets por sección"),
- acopla el esquema de BD al diseño visual vigente: un rediseño del frontend obliga a migrar datos.

Es la fase más cara del plan (2 semanas) y la de menor valor editorial (los sectores priorizados cambian poco). **Recortar**: traducir solo los campos base de `Sector` (name, description, short_description) y dejar el contenido enriquecido en los estáticos TS actuales, documentado como fase futura.

### P5 — Seguridad básica pospuesta a la última fase

Verificado en `config/settings/base.py:144`: `DEFAULT_PERMISSION_CLASSES = AllowAny`, **sin** `DEFAULT_THROTTLE_CLASSES` ni `DEFAULT_PAGINATION_CLASS`. Consecuencias hoy:

- `GET /api/v1/cms/news/` devuelve la tabla completa sin límite — un solo cliente puede pedir miles de filas y crecerá sin tope;
- los POST de formularios (leads) no tienen throttling: spam trivial;
- los endpoints de `integrations` exponen logs/webhooks sin auth (el documento lo detecta pero lo difiere a Fase 7).

Esto es configuración, no desarrollo: paginación + throttle + `IsAdminUser` en integrations son ~2 horas y van el **día 1**, no la semana 10.

### P6 — `is_public` en `Document` no protege nada

El archivo vive en `MEDIA_ROOT` y se sirve directamente por URL. `is_public=False` oculta el documento del listado API, pero quien conozca `/media/documents/2026/07/x.pdf` lo descarga igual. Hay que decidir explícitamente: **(a)** todos los documentos del CMS son públicos por definición (recomendado para este alcance — eliminar la ambigüedad renombrando a visibilidad de listado), o **(b)** documentos privados reales, que exigen servirlos vía vista Django con `X-Accel-Redirect` o URLs firmadas — fuera del alcance de 15 días. La propuesta no toma la decisión.

### P7 — Sin validación de archivos subidos

Ningún `FileField` propuesto valida extensión, MIME ni tamaño. Un editor puede subir un `.exe` de 2 GB como "documento". Mínimo: `FileExtensionValidator` (pdf, docx, xlsx, pptx, zip), límite de tamaño en `clean()` (p. ej. 25 MB documentos / 5 MB imágenes), y autollenar `file_size_bytes`/`file_type` en `save()` en lugar de pedirlos al editor.

### P8 — SEO sin plan

Para un portal de inversión el SEO es objetivo de negocio y la propuesta solo hereda `seo_title/seo_description`. Faltan:

- **sitemap.xml** dinámico (news, documentos, casos, sectores) — con slug compartido se genera desde Next con un fetch a la API;
- **hreflang** es/en + `x-default` en las páginas de detalle (trivial con slug compartido, ver P3);
- **canonical** y **og:image** (derivable de `featured_image`) en `generateMetadata` de Next;
- los detalles de News/SuccessStory servidos por API deben renderizarse con SSR/ISR, no client-side, para ser indexables (hoy prensa ya lo hace bien; replicar el patrón).

### P9 — Workflow editorial: defectos menores pero reales

- `EditorialModel.publish()`/`unpublish()` mutan la instancia **sin `save()`** — verificado en `apps/cms/models.py:48-55`. Si alguien lo llama fuera del admin action, el cambio se pierde silenciosamente.
- No existe un manager `objects.published()`; cada viewset repite el filtro `status=published`. Un olvido en un viewset nuevo publica borradores. Centralizar en un `PublishedManager`.
- `SiteBanner` con `EditorialModel` **y** ventana `starts_at/ends_at` crea dos mecanismos de visibilidad superpuestos sin precedencia definida. Definir: `published` = aprobado por el editor; la ventana temporal decide visibilidad efectiva. Un banner `published` fuera de ventana no se muestra pero no cambia de estado (evita cron jobs).

### P10 — Permisos editoriales resueltos con lo que Django ya trae

No hacen falta roles personalizados ni JWT para el alcance real (la API pública es read-only; la escritura es solo vía admin). Dos **Groups** creados por data migration:

- **Editor**: `add/change/view` sobre modelos CMS, sin la acción de publicar;
- **Publicador**: lo anterior + permiso custom `can_publish` (declarado en `Meta.permissions` de `EditorialModel`), verificado en el `EditorialAdminMixin` (ocultar acciones de publicación y el campo `status` a quien no lo tenga).

Costo: ~medio día. Posponerlo significa que todo editor institucional entra como superuser, que es el riesgo real.

### P11 — Rendimiento: tres ausencias puntuales

1. **Paginación DRF** inexistente (P5) — `PAGE_SIZE = 20` con `PageNumberPagination`.
2. **N+1**: `featured_image` requiere `select_related` en todos los querysets de listado (con modeltranslation no hay prefetch de traducciones que olvidar — ventaja adicional de P2).
3. **Caché del lado Next**: los fetch de contenido institucional deben usar `next: { revalidate: 300 }` (ISR). Los banners y enlaces cambian poco; revalidación de 5 min elimina prácticamente toda la carga sobre Django sin introducir Redis ni CDN (correcto no añadirlos ahora).

Con eso, Django + Postgres aguantan este sitio holgadamente; añadir caché de servidor sería sobrearquitectura hoy. La ruta de escala futura (Redis para banners/links, S3 + CDN para media) queda documentada, no implementada.

### P12 — Aciertos que se conservan

Para balance del dictamen, la propuesta acierta en: extender apps existentes en vez de crear una nueva; Django como única fuente de verdad y eliminación de `cmsActions.ts`; `Document` y `SuccessStory` a `EditorialModel`; FK `ResourceDownloadLead → Document`; modelos de `InstitutionalLink` y `SiteBanner` (bien dimensionados); volumen Docker para `media/`; comandos de importación desde los estáticos TS; y no proponer page builder.

---

## 3. Arquitectura corregida

### 3.1 Decisiones estructurales

| Decisión | Corregido | Sustituye a |
|----------|-----------|-------------|
| i18n | **django-modeltranslation**, columnas `_es`/`_en`, fallback EN→ES nativo | 7 tablas de traducción |
| Slug | **Único y compartido** entre idiomas | Slug por locale |
| Idioma en API | `?lang=es\|en` (default `es`) → `translation.override(lang)` en el serializer/vista | Igual, pero sin lógica de fallback manual |
| Sectores | Solo campos base traducidos; contenido enriquecido sigue estático | `SectorTranslation` + JSON de presentación |
| Documentos | Todos públicos; `is_public` → solo visibilidad de listado, documentado | Ambigüedad actual |
| Permisos | Groups Editor/Publicador + permiso `can_publish` | "Fase 7 / roadmap Fase C" |
| Seguridad base | Paginación + throttling + `IsAdminUser` en integrations el día 1 | Fase 7 |

### 3.2 Modelos (delta contra lo existente)

```python
# apps/cms — registrar en translation.py (modeltranslation):
#   Page:  title, content, excerpt, seo_title, seo_description
#   News:  title, summary, content, seo_title, seo_description
#   Document: title, description

class Document(EditorialModel):            # antes TimeStampedModel
    category = CharField(choices=DocumentCategory.choices, db_index=True)
    #   institucional | tecnicos | biblioteca | estudios
    file = FileField(validators=[FileExtensionValidator([...])])
    file_type, file_size_bytes             # autollenados en save()
    is_featured, order
    cover_image = FK(MediaAsset, null=True)

class InstitutionalLink(TimeStampedModel): # nuevo, en cms
    section = CharField(choices=LinkSection.choices)   # home_interest | footer_external | tramites | top_bar
    title, description                     # traducibles (modeltranslation)
    url, is_external, icon, accent_color, is_active, order

class SiteBanner(EditorialModel):          # nuevo, en cms
    placement = CharField(choices=BannerPlacement.choices)
    title, body, cta_label                 # traducibles
    starts_at, ends_at, priority, link_url, dismissible, image FK(MediaAsset)
    # visible ⇔ status=published AND ventana temporal activa

# apps/investment
class SuccessStory(EditorialModel):        # antes TimeStampedModel
    # + logo FK(MediaAsset), testimonial_quote/author, order
    # traducibles: title, summary, content, métricas de texto

# Sector: sin modelos nuevos; traducibles: name, description, short_description

# apps/forms
ResourceDownloadLead.document = FK(Document, null=True)  # resource_name se mantiene como fallback

# apps/cms — infraestructura
class PublishedManager(Manager):
    def published(self): return self.filter(status=PublishStatus.PUBLISHED)
EditorialModel.publish()/unpublish()  # ahora con save(update_fields=[...])
EditorialModel.Meta.permissions = [("can_publish", "Puede publicar contenido")]
```

### 3.3 API (delta)

Base `/api/v1/`, read-only, paginada (20), `?lang=es|en` en todos:

| Endpoint | Cambio |
|----------|--------|
| `GET /cms/news/`, `/news/{slug}/` | + `lang` (resto ya existe) |
| `GET /cms/documents/` | + filtros `category`, `featured`; solo `published` |
| `GET /cms/institutional-links/?section=` | nuevo |
| `GET /cms/banners/?placement=` | nuevo; `published` ∧ ventana temporal, orden por `priority` |
| `GET /investment/sectors/`, `/success-stories/` | + `lang`, `featured`; stories solo `published` |
| `POST /forms/resource-download/` | acepta `document_id`; throttled |
| `/api/v1/integrations/*` | `IsAdminUser` |

Sin endpoint público de MediaAsset (los serializers ya embeben `file`/`alt_text`; un endpoint aparte es innecesario). Sin write endpoints públicos: la edición es vía Django Admin.

### 3.4 Configuración (día 1)

```python
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],  # read-only viewsets
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"anon": "120/min", "forms": "10/min"},
}
LANGUAGES = [("es", "Español"), ("en", "English")]
MODELTRANSLATION_DEFAULT_LANGUAGE = "es"
MODELTRANSLATION_FALLBACK_LANGUAGES = ("es",)
```

Más: volumen nombrado para `media/` en `docker-compose.yml`; en producción `/media/` servido por el proxy (nginx/Caddy), no por Django.

### 3.5 SEO (frontend)

- `app/sitemap.ts` en Next generado desde la API (news, documents, stories, sectores).
- `generateMetadata` en detalles: canonical, `alternates.languages` (hreflang es/en, trivial con slug compartido), og:image desde `featured_image`.
- Detalles por API siempre SSR/ISR (`revalidate: 300`), nunca client-only.

---

## 4. Plan de 15 días

| Días | Entrega | Contenido |
|------|---------|-----------|
| **1–2** | Fundamentos | modeltranslation instalado y registrado (News, Page, Document); paginación + throttling + `IsAdminUser` integrations; `PublishedManager`; fix `publish()/save()`; permiso `can_publish` + Groups Editor/Publicador; volumen media; borrar `cmsActions.ts` |
| **3–4** | Prensa bilingüe | Admin con pestañas es/en; `?lang=` en News API; frontend pasa `locale` en `getNews()`; import de artículos desde copy huérfano |
| **5–7** | Recursos | `Document` → `EditorialModel` + category choices + validación de archivos; FK en `ResourceDownloadLead`; API con filtros; conectar `/recursos/*`; carga de los 18 documentos reales |
| **8–10** | Casos de éxito | `SuccessStory` → `EditorialModel` + campos traducibles + logo; API `featured`/`sector`/`lang`; reescribir `/portafolio/casos` y `[slug]`; import de ~10 casos del copy estático |
| **11** | Enlaces institucionales | Modelo + API por sección; migrar `InterestLinksSection`, `Footer`, `/tramites`; seed desde hardcode actual |
| **12** | Banners | Modelo + API con ventana temporal; componente `SiteBannerBar` en layout; admin |
| **13** | Sectores (base) | `name/description/short_description` traducidos vía API; frontend usa API para textos base; contenido enriquecido queda estático (documentado como fase futura) |
| **14–15** | Cierre | `seed_cms` consolidado; sitemap + hreflang + metadata; ISR en fetches; tests de serializers/permisos y smoke E2E prensa/recursos/casos; guía breve para editores |

**Fuera de alcance (documentado, no implementado):** contenido enriquecido de sectores en CMS, S3/CDN, Redis, JWT/write API headless, documentos privados con URLs firmadas, drf-spectacular.

**Riesgo principal del cronograma:** la migración de contenido estático (días 5–10) depende de tener los PDFs e imágenes reales; si no están disponibles, los imports crean los registros con archivos placeholder y la carga final la hace el equipo editorial desde el admin — el código no se bloquea.
