# Manual para editores de Strapi

Entra en `https://cms.test.cni.hn/admin` para validar cambios o en `https://cms.cni.hn/admin` para editar contenido de producción. En tu perfil puedes elegir **Español** para la interfaz. Dentro del **Gestor de contenido**, el selector de idioma corresponde a la traducción de la ficha. Selecciona **ES** o **EN** antes de editar.

Las capturas se tomaron con datos de ejemplo. Algunas capturas del panel muestran los nombres anteriores de las colecciones.

## Elegir una colección

| Colección | Cuándo usarla |
| --- | --- |
| Noticias | Publicar una noticia, un comunicado o un anuncio en Prensa. |
| Documento | Ofrecer un archivo de acceso libre o mediante formulario. |
| Categoría de recursos | Organizar documentos relacionados en la página de Recursos. |
| Aviso del sitio | Mostrar un mensaje temporal en el portal. |
| Página | Mantener contenido institucional que se consulta desde su propia dirección. |
| Caso de éxito | Presentar una historia de inversión con información de la empresa y su testimonio. |

## Crear una noticia

1. Abre **Gestor de contenido → Noticias → Crear nueva entrada**.
2. Escribe el **Título**, revisa el **Slug** y añade un **Resumen**. Conserva el slug de una noticia ya enlazada. Elige la categoría y la fecha.
3. Añade la **Imagen de portada** y registra el texto alternativo en la biblioteca multimedia. En **Contenido**, agrega **Párrafo** y usa su barra de herramientas para aplicar negrita, cursiva, enlaces y listas. Usa **Imagen** para una foto individual. También puedes añadir subtítulos y citas.
4. Guarda el borrador. Abre la vista previa cuando esté disponible, revisa portada y texto, y sigue el paso de publicación. Verifica la noticia en **Prensa**.

![Editor de una noticia en Strapi](assets/manual-editores/noticia.png)

### Añadir una galería

1. En **Contenido**, añade el bloque **Galería** en una noticia o página.
2. Agrega dos o tres fotos. En cada una, selecciona la **Imagen** y escribe el **Texto alternativo** que describa lo que se ve. Si la galería necesita contexto, escribe un **Pie de galería**.
3. Verifica que las fotos se muestran en fila en escritorio y apiladas en celular. Selecciona una foto para comprobar que se amplía.

Capturas de la misma noticia publicada en un Strapi local de prueba.

| Idioma | Escritorio (1440 px) | Celular (390 px) |
| --- | --- | --- |
| Español | [Ver captura](assets/manual-editores/noticia-cni-606-es-escritorio.webp) | [Ver captura](assets/manual-editores/noticia-cni-606-es-celular.webp) |
| Inglés | [Ver captura](assets/manual-editores/noticia-cni-606-en-escritorio.webp) | [Ver captura](assets/manual-editores/noticia-cni-606-en-celular.webp) |

## Subir un recurso libre

1. Abre **Documento → Crear nueva entrada**. Completa título, slug y descripción. Selecciona la categoría de recursos que corresponda.
2. En **Acceso**, selecciona **free (Libre)**. En **Archivo público**, elige o sube el documento a la biblioteca multimedia.
3. Guarda y publica. Abre la categoría del portal en una ventana privada y comprueba que el archivo abre sin formulario.

![Ficha de un documento con el campo Archivo para recursos libres](assets/manual-editores/recurso-libre.png)

## Subir un recurso con formulario

1. Crea o abre un **Documento**, elige la categoría y selecciona **gated (Con formulario)** en **Acceso**. Deja vacío **Archivo público** y cualquier enlace público.
2. Guarda el borrador. En la misma ficha, selecciona el archivo en **Archivo privado**. Los formatos admitidos son PDF, DOCX, XLSX, PPTX y ZIP de hasta 25 MB.
3. Espera el mensaje que confirma que el archivo quedó vinculado. Guarda otra vez y publica. Si la carga falla, revisa formato y tamaño o pide al administrador verificar el almacenamiento.
4. Abre el recurso desde una sesión privada. Comprueba que se muestra **Descargar con formulario** y prueba la descarga con datos autorizados.

![Ficha de un recurso con formulario y control de archivo privado](assets/manual-editores/recurso-formulario.png)

## Crear un aviso del sitio

1. En **Aviso del sitio → Crear nueva entrada**, completa el título y el mensaje. Selecciona **site_top** para la barra superior del portal.
2. Si incluye llamada a la acción, añade el texto del botón y la URL de destino. Revisa la fecha de inicio, la fecha de fin y la prioridad. Verifica el contraste de los colores y si el aviso se puede cerrar.
3. Guarda y publica. Comprueba el banner en una página pública, durante su ventana de vigencia y con la fuente editorial configurada en Strapi.

![Editor de un banner con ubicación y vigencia](assets/manual-editores/banner.png)

## Crear o editar una página

1. En **Página**, abre la entrada existente o crea una nueva. Completa título, slug, resumen y contenido. Coordina los cambios de slug si la página ya tiene enlaces públicos.
2. Revisa SEO y traducciones. Guarda. Usa la vista previa cuando esté disponible y verifica el contenido publicado en `/institucional/<slug>` o `/en/institutional/<slug>`.

![Editor de una página institucional con los botones Publicar y Guardar](assets/manual-editores/pagina.png)

## Publicar cambios

1. Tras guardar, revisa el idioma, los enlaces y el contenido del borrador. Si tu rol solo permite editar, pide a un publicador que revise la entrada.
2. Haz clic en **Publicar** y confirma si el panel lo solicita. El estado debe quedar en **Publicado** para ese idioma. Repite la revisión y publicación por cada traducción.
3. Abre el sitio público en una ventana privada para verificar el resultado. Si debes retirarlo, usa **Despublicar** en la variante correspondiente y verifica que se retiró del portal.
