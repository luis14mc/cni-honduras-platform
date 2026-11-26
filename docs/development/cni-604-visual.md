# CNI-604 · Comparación visual

Playwright tomó las capturas sobre builds locales de producción con el mismo seed de 25 proyectos y 17 Opportunity Cards. Las dos columnas de cada archivo contienen la versión de referencia y la corregida. Los registros conservan el texto que trae el seed. Las etiquetas de la interfaz corresponden al idioma indicado.

| Ancho | Proyectos ES | Opportunity Cards ES | Projects EN | Opportunity Cards EN |
| --- | --- | --- | --- | --- |
| 1440 px | [Antes/después](../assets/cni-604/1440-es-proyectos.webp) | [Antes/después](../assets/cni-604/1440-es-oportunidades.webp) | [Before/after](../assets/cni-604/1440-en-proyectos.webp) | [Before/after](../assets/cni-604/1440-en-oportunidades.webp) |
| 1024 px | [Antes/después](../assets/cni-604/1024-es-proyectos.webp) | [Antes/después](../assets/cni-604/1024-es-oportunidades.webp) | [Before/after](../assets/cni-604/1024-en-proyectos.webp) | [Before/after](../assets/cni-604/1024-en-oportunidades.webp) |
| 768 px | [Antes/después](../assets/cni-604/768-es-proyectos.webp) | [Antes/después](../assets/cni-604/768-es-oportunidades.webp) | [Before/after](../assets/cni-604/768-en-proyectos.webp) | [Before/after](../assets/cni-604/768-en-oportunidades.webp) |
| 390 px | [Antes/después](../assets/cni-604/390-es-proyectos.webp) | [Antes/después](../assets/cni-604/390-es-oportunidades.webp) | [Before/after](../assets/cni-604/390-en-proyectos.webp) | [Before/after](../assets/cni-604/390-en-oportunidades.webp) |

## Comprobaciones

A 390 px el hero mide 330 px. La tarjeta de mayor altura en cada pestaña midió 466 px en Proyectos y 472 px en Opportunity Cards. En la primera fila de 1440 px los montos y enlaces quedaron alineados en las tres tarjetas, en ambos idiomas. Tab y Enter llevaron a la ficha de oportunidad en ES y EN.

Lighthouse móvil 12.8.2 en `/portafolio`, sobre el build local con el seed, registró Accesibilidad **100/100** y **CLS 0.000**. Pasaron las 353 pruebas unitarias, incluidas las pruebas existentes de filtros y las nuevas de formato monetario.


En la revisión del PR, Playwright verificó que el panel fijo queda 8 px por debajo del encabezado a 1440 y 1024 px. Ambas pestañas reciben clics en ES y EN al desplazar la página. El hero muestra el total como `USD 5.7 mil MM` en español y `USD 5.7 B` en inglés, con 55 px o más entre el menú y su etiqueta en las resoluciones de la tabla. [Panel fijo a 1440 px](../assets/cni-604/1440-es-panel-fijo.webp)
