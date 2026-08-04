# Deuda técnica — almacenamiento MEDIA (CMS)

## Contexto

Los archivos de `cms.Document`, imágenes de `News`/`SuccessStory` y assets de
`MediaAsset` se sirven hoy desde el filesystem local de Django
(`MEDIA_ROOT` / `MEDIA_URL`).

En staging (Render) el disco del contenedor es **efímero**: los uploads
sobreviven al proceso en curso, pero se pierden en redeploy/restart si no hay
disco persistente u object storage.

## Impacto

- La integración CMS (admin → API → frontend) **funciona** con URLs de archivo.
- No es bloqueante para S1-T1…T4 (conexión editorial).
- Sí es bloqueante para contenido permanente en staging/producción sin
  volumen persistente o S3/compatible.

## Fuera de alcance actual

- `django-storages` / S3 (o R2, GCS)
- Comando `import_documents`
- POST de `ResourceDownloadLead` desde el frontend

## Acción recomendada (siguiente bloque)

1. Definir bucket + credenciales por ambiente.
2. Configurar storage backend en settings de staging/prod.
3. Migrar MEDIA existente y actualizar URLs públicas.
