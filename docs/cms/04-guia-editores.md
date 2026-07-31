# Guía de editores — CMS institucional CNI

## Acceso

1. Ingrese a `/admin/` con su usuario staff.
2. Use el grupo **Editor** para crear y modificar contenido.
3. Use el grupo **Publicador** para cambiar el estado a *Publicado*.

## Idiomas

Los modelos editoriales tienen pestañas **Español** y **English** en Django Admin (django-modeltranslation).

- Si falta traducción EN, el sitio muestra automáticamente el texto en ES (fallback).
- El **slug** es único y compartido entre idiomas (`/es/prensa/foo` ↔ `/en/prensa/foo`).

## Flujo editorial

| Estado | Visible en el sitio |
|--------|---------------------|
| Borrador | No |
| Publicado | Sí (si `published_at` ≤ ahora) |
| Archivado | No |

Acciones masivas *Publicar*, *Marcar como borrador* y *Archivar* están disponibles solo para usuarios con permiso `cms.can_publish`.

## Tipos de contenido

### Notas de prensa (`News`)

- Categoría: use `press_release` para comunicados oficiales.
- Marque *Destacado* para la sala de prensa y el home.

### Documentos (`Document`)

- Categorías: `institucional`, `tecnicos`, `biblioteca`, `estudios`.
- Extensiones permitidas: pdf, docx, xlsx, pptx, zip (máx. 25 MB).
- Suba el archivo real; el sitio enlaza directamente a `/media/...`.

### Casos de éxito (`SuccessStory`)

- Asocie un sector cuando aplique.
- Campos de testimonial opcionales para el home.

### Enlaces institucionales (`InstitutionalLink`)

- Secciones: home, footer, trámites, barra superior.
- Use *Orden* para reordenar; solo enlaces activos aparecen en la API.

### Banners temporales (`SiteBanner`)

- Visible ⇔ **Publicado** + ventana `starts_at` / `ends_at` activa (null = sin límite).
- El estado no cambia automáticamente; la ventana temporal controla la visibilidad.

## Comandos útiles (desarrollo)

```bash
python manage.py seed_cms
python manage.py update_translation_fields
```

## Soporte

Para contenido EN prioritario, complete las pestañas English antes de publicar.
