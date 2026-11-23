# Datos del mapa de inversión

El mapa lee los proyectos públicos, las oportunidades publicadas y los casos de éxito publicados de `GET /api/v1/investment/map-items/?lang=es`. La vista en inglés usa `lang=en`. Los registros sin coordenadas se muestran en la lista y se excluyen de los marcadores y de los filtros por región geográfica.

## Preparar el entorno antes de desplegar el mapa

Con los departamentos, municipios y regiones cargados en la base de datos de destino, ejecutar desde `backend/`. Para preparar una base de datos vacía, cargar primero la geografía con `python manage.py import_honduras_geo` y `python manage.py import_territorial_regions`.

```sh
python manage.py import_portafolio_cni --dry-run
python manage.py import_portafolio_cni
```

El comando existente usa el JSON versionado en `apps/investment/data/portafolio_cni_2026/`, idéntico al que usaba el mapa, junto a las imágenes de ese directorio. Reutiliza proyectos y oportunidades por slug y actualiza sus datos del catálogo. Revisar primero el resultado de la ejecución de prueba y las advertencias sobre códigos, imágenes o referencias geográficas. Los casos de éxito se publican mediante el flujo editorial de Django.

Antes de actualizar el frontend, comprobar que el endpoint devuelve los registros esperados y que sus títulos y sectores se leen en ambos idiomas. En el mapa, seleccionar un sector y un departamento, abrir uno de los resultados y recargar la URL para comprobar que conserva los filtros y el resultado seleccionado.
