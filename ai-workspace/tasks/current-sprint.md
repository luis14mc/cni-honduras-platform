# Current Sprint

> **Sprint:** Mapa + documentación (cierre 2026-06-19)  
> **Siguiente sprint sugerido:** Formularios E2E + n8n workflow

## Meta del sprint (completada)
Conectar mapa interactivo al backend real y actualizar documentación de avances del proyecto.

## Entregado ✅

### Mapa Backend 02
- [x] Filtros municipalities, projects, opportunities.
- [x] `GET /api/v1/investment/map-summary/`.
- [x] GeoJSON en serializers (fix WKT → Leaflet).

### Mapa Frontend 01
- [x] `HondurasMap` con `apiGet` (`/geo/departments/`, `/investment/map-summary/`).
- [x] Sidebar con métricas; filtro sector client-side.
- [x] Colores CNI `#334E88` / `#32B372`.

### Documentación
- [x] `docs/00-project-status-and-achievements.md`.
- [x] Actualización `ai-workspace/` y `docs/`.

## Siguiente sprint (candidatos)

### Meta propuesta: Integración formularios → n8n → CRM
- [ ] Workflow n8n commiteado y probado con postulación real.
- [ ] Formularios contacto + asesoría wired al backend.
- [ ] ADR-0002 borrador.
- [ ] Casos de éxito desde API en frontend.

## Notas
- Respetar `09-token-rules.md`.
- No mezclar stacks: compose raíz ≠ SuiteCRM ≠ n8n.
- Actualizar este archivo al abrir el próximo sprint.
