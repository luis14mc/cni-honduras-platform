# Almacenamiento portable de media (S3-compatible)

Arquitectura de media **independiente del proveedor**: local, staging, Render,
Vercel+backend remoto, AWS, Cloudflare R2, MinIO, DigitalOcean Spaces u otros
S3-compatible. La infraestructura se decide **solo por variables de entorno**.

## Principio

```text
Frontend  ──consume──►  file_url (URL usable en el navegador)
                              ▲
                              │
Backend storage (.url) ───────┘
  ├── FileSystemStorage (local)
  └── S3Storage / django-storages (remoto persistente)
```

- El frontend **no** debe saber dónde vive el archivo (hostname, `/media/`, Render, R2…).
- El backend entrega `file_url` absoluto cuando es posible (CDN, bucket público, URL firmada o `http://localhost:8000/media/...`).
- Helper frontend único: `resolveMediaFileUrl` (`file_url || file`).

## Modos

| `USE_S3_STORAGE` | Backend | Uso |
|------------------|---------|-----|
| `false` (default) | `FileSystemStorage` | Desarrollo local |
| `true` | `storages.backends.s3.S3Storage` | Staging / producción / cualquier PaaS con disco efímero |

**No** hay detección por hostname (`render.com`, `vercel.app`, etc.).

Si `DEBUG=false` y el storage activo sigue siendo FileSystemStorage, el backend emite un **warning** (sin secretos) recomendando `USE_S3_STORAGE=true`.

## Variables de entorno

Los nombres `AWS_*` son la convención de **django-storages**; el proveedor **no** tiene que ser AWS.

### Activación

| Variable | Default | Descripción |
|----------|---------|-------------|
| `USE_S3_STORAGE` | `false` | `true` → object storage S3-compatible |

### Requeridas si `USE_S3_STORAGE=true`

| Variable | Descripción |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Access key |
| `AWS_SECRET_ACCESS_KEY` | Secret key |
| `AWS_STORAGE_BUCKET_NAME` | Bucket |
| `AWS_S3_ENDPOINT_URL` | Endpoint **API** S3 (escrituras boto3) |
| `AWS_S3_REGION_NAME` | Región (`auto` en varios proveedores) |

### Lectura pública / URLs

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AWS_S3_CUSTOM_DOMAIN` | (vacío) | Dominio público CDN/bucket → `https://{domain}/` (recomendado) |
| `AWS_QUERYSTRING_AUTH` | `false` | `true` → URLs firmadas por objeto; `MEDIA_URL` relativa |
| `AWS_S3_FILE_OVERWRITE` | `false` | No sobrescribir nombres |
| `AWS_S3_ADDRESSING_STYLE` | (vacío) | `path` habitual en MinIO / algunos R2 |
| `AWS_DEFAULT_ACL` | (vacío) | Dejar vacío si el proveedor no usa ACLs |

### Local

```env
USE_S3_STORAGE=false
DJANGO_MEDIA_URL=/media/
DJANGO_MEDIA_ROOT_REL=media
DJANGO_DEBUG=True
```

Django sirve `/media/` solo con `DEBUG=True` (`config.urls`).

### Remoto (ejemplo genérico)

```env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
AWS_S3_ENDPOINT_URL=https://s3.example.com
AWS_S3_REGION_NAME=auto
AWS_S3_CUSTOM_DOMAIN=cdn.example.com
AWS_QUERYSTRING_AUTH=false
AWS_S3_FILE_OVERWRITE=false
```

`file_url` en API será del estilo `https://cdn.example.com/media/...`.

## Resolución de `MEDIA_URL` (backend)

1. Sin S3 → `DJANGO_MEDIA_URL` (`/media/`).
2. Con S3 + `AWS_S3_CUSTOM_DOMAIN` → `https://{domain}/`.
3. Con S3 + `AWS_QUERYSTRING_AUTH=true` → base relativa; cada `.url` es absoluta firmada.
4. Con S3 sin dominio custom y sin firma → `{endpoint}/{bucket}/media/` (solo si el endpoint sirve lecturas públicas).

## Frontend

- `frontend/src/lib/mediaUrl.ts` → `resolveMediaFileUrl`
- Prefiere `file_url`; resuelve `file` relativo solo como legado (prefijo origen API).
- Previews CMS (`CmsMediaImage`, Multimedia, MediaPicker): si la URL falla → placeholder **Archivo no disponible** (sin ícono roto del navegador).

## Formatos de imagen

JPG, JPEG, PNG, WEBP, GIF, SVG (WebP recomendado, no obligatorio). Sin conversión automática en este cambio.

## Pruebas

- Backend: filesystem local, URL S3 mockeada, formatos de imagen, `file_url` absoluto, media huérfana tolerada.
- Frontend: `file_url` absoluto, `file` relativo, placeholder, extensiones soportadas.
- CI: sin requests reales a proveedores externos.

## Referencias

- `backend/config/settings/storage.py`
- `backend/apps/media_library/serializers.py` → `absolute_file_url`
- `frontend/src/lib/mediaUrl.ts`
- `docs/cms/05-deuda-tecnica-media.md` (histórico actualizado)
