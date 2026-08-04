# Almacenamiento persistente de media (S3-compatible)

Este documento describe cómo configurar almacenamiento externo para archivos
**media** de Django (imágenes, PDFs, documentos) en Render y otros entornos
donde el disco del contenedor es efímero.

## Arquitectura

```text
Django Admin / API upload
        │
        ▼
  default storage (STORAGES["default"])
        │
        ├── Desarrollo local (USE_S3_STORAGE=false)
        │     └── FileSystemStorage → backend/media/
        │
        └── Render / staging / prod (USE_S3_STORAGE=true)
              └── S3Storage → bucket/prefix media/
                    └── URL pública HTTPS (bucket o custom domain)

Static files (collectstatic) → STORAGES["staticfiles"] → filesystem (sin cambios en S1-T6)
```

**Alcance S1-T6:** solo **media**. Los archivos estáticos (`/static/`) no se mueven a S3.

## Variables de entorno

### Activación

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `USE_S3_STORAGE` | Sí (prod) | `true` habilita S3; omitida o `false` usa disco local |

### Credenciales y bucket (requeridas si `USE_S3_STORAGE=true`)

| Variable | Descripción |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Access key del proveedor |
| `AWS_SECRET_ACCESS_KEY` | Secret key |
| `AWS_STORAGE_BUCKET_NAME` | Nombre del bucket |
| `AWS_S3_ENDPOINT_URL` | Endpoint S3-compatible (HTTPS) |
| `AWS_S3_REGION_NAME` | Región (`auto` suele funcionar en R2) |

### Comportamiento recomendado

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AWS_QUERYSTRING_AUTH` | `false` | URLs públicas sin firma temporal |
| `AWS_S3_FILE_OVERWRITE` | `false` | Evita sobrescribir archivos con el mismo nombre |
| `AWS_S3_CUSTOM_DOMAIN` | (vacío) | Dominio público opcional (CDN/custom domain) |
| `AWS_S3_ADDRESSING_STYLE` | (vacío) | `path` recomendado para R2/minio |
| `AWS_DEFAULT_ACL` | (vacío) | Dejar vacío en R2; no usar ACLs incompatibles |

### Desarrollo local (sin S3)

```env
USE_S3_STORAGE=false
DJANGO_MEDIA_URL=/media/
DJANGO_MEDIA_ROOT_REL=media
```

Django sirve `/media/` en `DEBUG=True` vía `config.urls`.

## Configuración genérica S3-compatible

1. Crear bucket dedicado para media institucional pública.
2. Habilitar acceso público de lectura **solo** para el prefijo `media/` (o todo el bucket si es exclusivo de media).
3. Configurar CORS si el frontend sube directamente (no aplica a subidas vía Django Admin).
4. En Render, definir las variables anteriores.
5. Desplegar con `USE_S3_STORAGE=true`.

Si falta alguna variable requerida, Django **falla al arrancar** con un mensaje que lista los nombres faltantes (sin exponer secretos).

## Cloudflare R2 (orientativo)

Valores de ejemplo (sustituir por los de tu cuenta):

```env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=<r2-access-key-id>
AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
AWS_STORAGE_BUCKET_NAME=<your-bucket-name>
AWS_S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
AWS_S3_REGION_NAME=auto
AWS_S3_ADDRESSING_STYLE=path
AWS_QUERYSTRING_AUTH=false
AWS_S3_FILE_OVERWRITE=false
AWS_DEFAULT_ACL=
# Opcional:
# AWS_S3_CUSTOM_DOMAIN=media.example.com
```

En R2:

1. Crear bucket.
2. Crear API token con permiso de lectura/escritura sobre ese bucket.
3. Configurar **Public access** o custom domain según política de seguridad.
4. Si usas custom domain, apuntar DNS y definir `AWS_S3_CUSTOM_DOMAIN`.

## Render

1. Servicio Web (backend) → **Environment**.
2. Añadir variables de la sección anterior.
3. **Start Command:** dejar vacío para usar `backend/scripts/start.sh` del Dockerfile, o `./scripts/start.sh`.
4. Redeploy.

El script de arranque ejecuta:

- `migrate --noinput`
- `import_institutional_links` (idempotente; no afecta media)
- Gunicorn

No ejecuta `makemigrations` ni `collectstatic` de media.

## Pruebas

### Subida desde Django Admin

1. `/admin/` → Document / Media asset / News image.
2. Subir archivo.
3. Verificar URL pública HTTPS en detalle del objeto.

### Después de redeploy

1. Redeploy en Render (o reinicio del contenedor).
2. Abrir la misma URL del archivo.
3. Debe seguir accesible (persistencia en bucket).

### API

Endpoints que exponen archivos:

- `GET /api/v1/cms/documents/` → campo `file`
- `GET /api/v1/cms/news/` → `featured_image.file`
- `GET /api/v1/investment/success-stories/` → `image`, `logo.file`

Las URLs deben ser absolutas (`https://...`) o rutas `/media/` en local, **sin** dominios hardcodeados del API.

## CORS

Si el frontend carga imágenes/PDFs directamente desde el dominio del bucket o CDN, configurar CORS en el proveedor:

- Orígenes: dominios del frontend (`https://test.cni.hn`, `https://cni.hn`, etc.)
- Métodos: `GET`, `HEAD`
- Headers: según necesidad del CDN

Las subidas vía Django Admin no requieren CORS en el bucket (el backend escribe con boto3).

## Rollback

1. En Render, establecer `USE_S3_STORAGE=false` (o eliminar la variable).
2. Redeploy → vuelve a FileSystemStorage local (efímero en Free tier).
3. Los archivos ya subidos al bucket **permanecen** en el proveedor; las filas DB pueden apuntar a URLs S3 antiguas hasta re-subir o migrar.
4. Para rollback completo: restaurar backup de DB + copiar media local si existía.

## Seguridad

- No commitear access keys ni `.env`.
- Bucket dedicado solo a media pública institucional publicada.
- `AWS_QUERYSTRING_AUTH=false` para contenido público (no usar URLs firmadas por defecto).
- No subir documentos privados a buckets públicos sin revisión de permisos.
- Rotar credenciales si se filtran.

## Límites conocidos

- Archivos subidos **antes** de activar S3 siguen en rutas locales hasta re-subirlos o migrarlos manualmente.
- Render Free: disco local sigue siendo efímero si S3 no está habilitado.
- Static files no están en S3 (S1-T6); `collectstatic` sigue en imagen/volumen del contenedor.
- Tamaño máximo de upload depende de Gunicorn/Render (ajustar en bloque futuro si hace falta).

## Referencias en código

- `backend/config/settings/storage.py` — lógica STORAGES
- `backend/config/settings/base.py` — integración
- `backend/scripts/start.sh` — arranque Render
- `docs/cms/05-deuda-tecnica-media.md` — contexto histórico
