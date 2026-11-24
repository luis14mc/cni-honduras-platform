# Analítica del portal con Umami y Search Console

## Instalar Umami en Railway

1. Desplegar la [plantilla oficial de Umami para Railway](https://docs.umami.is/docs/guides/running-on-railway). Usar Umami 3.2 o posterior, que permite desactivar las vistas automáticas y registrar solo las rutas públicas. Configurar PostgreSQL en el mismo proyecto y enlazar `DATABASE_URL` al servicio de Umami. Usar la red privada de Railway y guardar `APP_SECRET` como variable privada del servicio.
2. Generar el dominio HTTPS del servicio web. Entrar al panel, cambiar la contraseña inicial y crear un sitio para el dominio público del CNI. Copiar el identificador de sitio y la URL de `script.js` de la sección Tracking Code.
3. En las variables del entorno **Production** del frontend, configurar `NEXT_PUBLIC_UMAMI_WEBSITE_ID` y `NEXT_PUBLIC_UMAMI_SCRIPT_URL`. Volver a compilar el frontend. Para comprobar un entorno de pruebas, usar un despliegue de producción del proyecto de pruebas y un ID de sitio separado. Vercel Preview y el servidor de desarrollo se excluyen.
4. Abrir el sitio público y comprobar que se solicita el script. Descargar un recurso, aplicar un filtro, abrir un marcador y enviar un formulario de prueba. Confirmar esos eventos en el sitio correcto del panel. Revisar que el script no se solicite al abrir directamente CMS, administración o una vista editorial de preview.

Para una instalación manual en Railway, crear el servicio web con la [imagen Docker oficial](https://docs.umami.is/docs/install) `docker.umami.is/umami-software/umami:latest`, publicar el puerto `3000` y enlazar las mismas variables al PostgreSQL del proyecto.

El contador registra rutas sin consultas ni fragmentos. Los eventos de formulario contienen solo el tipo de formulario y el idioma. La descarga desde un contacto recordado registra la descarga y no crea otro evento de formulario.

## Leer el panel

- Seleccionar el sitio y el periodo. **Overview** muestra visitas y páginas vistas. **Events** muestra la frecuencia de cada acción y **Properties** permite filtrar por sus propiedades.
- `file_download` muestra las descargas iniciadas por recurso y modalidad. `map_filter` y `map_project_open` muestran filtros usados y fichas abiertas.
- `form_submit` muestra envíos aceptados por Django y `lead_submit` esos mismos envíos como conversiones. No sumar ambos para contar contactos.
- `locale_switch` muestra cambios de idioma y `outbound_click` agrupa enlaces por dominio de destino.

## Verificar Google Search Console

1. Para una propiedad de dominio, verificar con el registro TXT proporcionado por Google. Para una propiedad de prefijo de URL, se puede usar la etiqueta HTML y configurar el contenido del atributo `content` en la variable de servidor `GOOGLE_SITE_VERIFICATION` del frontend. Volver a desplegar antes de solicitar la verificación.
2. En **Sitemaps**, enviar `/sitemap.xml` de la propiedad verificada y comprobar que Google indique que pudo leerlo.
