# Deuda técnica — almacenamiento MEDIA (CMS)

## Estado (QA-MEDIA-001)

El backend soporta **FileSystemStorage** (local) y **S3-compatible** vía
`django-storages` (`USE_S3_STORAGE`). Ver
[`docs/deployment/media-storage.md`](../deployment/media-storage.md).

## Contexto histórico

Los archivos de `cms.Document`, imágenes de `News`/`SuccessStory` y assets de
`MediaAsset` se servían desde el filesystem local de Django
(`MEDIA_ROOT` / `MEDIA_URL`).

En PaaS con disco efímero (p. ej. Render Free) los uploads se pierden en
redeploy/restart **si** `USE_S3_STORAGE` permanece en `false`.

## Deuda restante

- Migrar archivos subidos **antes** de activar object storage (re-subir o sync).
- Configurar `AWS_S3_CUSTOM_DOMAIN` / CORS en el proveedor de staging/prod.
- Static files (`/static/`) siguen en filesystem (fuera de alcance media).

## Acción operativa

1. Definir bucket + credenciales por ambiente.
2. `USE_S3_STORAGE=true` + variables `AWS_*` (django-storages) en staging/prod.
3. Verificar `file_url` absoluto en CMS Multimedia tras upload + redeploy.
