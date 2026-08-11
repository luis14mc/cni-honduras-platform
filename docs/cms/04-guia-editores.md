# Guía de editores — CMS institucional CNI

## Acceso

1. Ingrese a `/cms` (Next CMS) o `/admin/` (Django Admin) con usuario staff.
2. Use el grupo **Editor** para crear y modificar contenido.
3. Use el grupo **Publicador** / permiso `can_publish` para publicar.

## Idiomas

### Noticias, páginas, banners, casos

Siguen usando campos traducibles (ES/EN) en el mismo registro cuando aplica.

### Documentos / Recursos (modelo por idioma)

Cada versión lingüística es un **registro independiente**:

| Campo | Rol |
|-------|-----|
| `language` | `es` o `en` |
| `resource_key` | Clave compartida del grupo (p. ej. `estudio-turismo-2026`) |
| `file` / `external_url` | Recurso de **esa** versión (XOR) |
| `cover_image` | Portada de **esa** versión |

No use `file_es` / `file_en` en la misma fila.

Flujo recomendado en `/cms/documentos`:

1. Crear versión ES (o EN) con su PDF o URL.
2. Usar **Crear versión en inglés/español** para el sibling (copia `resource_key`, categoría y orden; **no** copia archivo ni portada ni título).
3. Completar título/slug/archivo de la versión nueva.
4. Publicar cada idioma por separado.

La API pública filtra por `?lang=es|en` **sin** fallback cruzado.

## Flujo editorial

| Estado | Visible en el sitio |
|--------|---------------------|
| Borrador | No |
| Publicado | Sí (si `published_at` ≤ ahora) |
| Archivado | No |

Documentos en borrador pueden guardarse **sin** archivo/URL. Publicar exige archivo **o** URL externa.

## Tipos de contenido

### Notas de prensa (`News`)

- Categoría: use `press_release` para comunicados oficiales.
- Marque *Destacado* para la sala de prensa y el home.
- Contenido por bloques ES/EN independientes.

### Documentos (`Document`)

- Categorías: `institucional`, `tecnicos`, `biblioteca`, `estudios`.
- Extensiones: pdf, docx, xlsx, pptx, zip (máx. 25 MB).
- Unique: (`resource_key`, `language`).

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

Para Documentos, complete el sibling EN/ES con su propio archivo antes de publicar cada idioma.
