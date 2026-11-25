# CNI-603 · Comparación visual del inicio

Playwright capturó el inicio en ES y EN sobre el build local de `919c132` y el build del PR. Cada comparativa muestra primero la versión anterior y luego la corregida. Los tres gráficos se capturaron con sus respectivos indicadores activos. Las pruebas no requieren datos editoriales ni envían formularios.

| Ancho | Dashboard ES | Dashboard EN | Inicio ES | Inicio EN |
| --- | --- | --- | --- | --- |
| 360 px | [Tres indicadores](../assets/cni-603/360-es-dashboard.webp) | [Tres indicadores](../assets/cni-603/360-en-dashboard.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/360-es-inicio.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/360-en-inicio.webp) |
| 390 px | [Tres indicadores](../assets/cni-603/390-es-dashboard.webp) | [Tres indicadores](../assets/cni-603/390-en-dashboard.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/390-es-inicio.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/390-en-inicio.webp) |
| 768 px | [Tres indicadores](../assets/cni-603/768-es-dashboard.webp) | [Tres indicadores](../assets/cni-603/768-en-dashboard.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/768-es-inicio.webp) | [Hero, tarjetas, asesoría y carrusel](../assets/cni-603/768-en-inicio.webp) |

A 1280 px, las 14 capturas comparadas conservaron sus dimensiones. Siete coincidieron píxel por píxel y la mayor diferencia de las restantes fue 0,03 %.

Las pruebas de Playwright miden el tamaño efectivo de las etiquetas SVG, verifican los límites de las marcas y comprueban los toques y el cierre de la etiqueta fuera del gráfico. También verifican el área táctil de las pestañas, la visibilidad del gráfico en 390 × 844 y la ausencia de texto de ligaduras cuando se bloquea la fuente de iconos.
