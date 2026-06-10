# Roadmap · 4 Meses

Plan de alto nivel. Fechas relativas al inicio (Mes 1 = arranque). Ajustar según prioridades del CNI.

## Mes 1 — Fundaciones
- [x] Workspace de IA y documentación base (`ai-workspace/`, `docs/`).
- [ ] Consolidar modelos y API de `cms`.
- [ ] Geometrías `geo` listas para Leaflet (GeoJSON).
- [ ] Conectar primera página del frontend a la API real.

## Mes 2 — Inversión
- [ ] Modelos de `investment` (sectores, oportunidades).
- [ ] Endpoints `/api/investment/`.
- [ ] Páginas `invertir` / `portafolio` consumiendo datos reales.
- [ ] Contenido i18n completo (es/en) de secciones clave.

## Mes 3 — Formularios y CRM
- [ ] Formularios: contacto, postulación, asesoría (zod + DRF).
- [ ] Decisión de integración SuiteCRM (ADR-0002).
- [ ] Conector leads → CRM con idempotencia y reintentos.
- [ ] Autenticación y roles (`users`).

## Mes 4 — Calidad y producción
- [ ] `media_library` y optimización de imágenes (sharp).
- [ ] CI (lint/build frontend, checks backend).
- [ ] Configuración de producción (env seguros, `requirements/prod.txt`).
- [ ] Hardening, accesibilidad y SEO final.
- [ ] Lanzamiento / despliegue.

## Riesgos
- Alcance de CMS y contenido bilingüe puede crecer.
- Integración CRM depende de acceso a SuiteCRM.
- Datos geoespaciales requieren fuentes confiables por departamento.

## Seguimiento
- Progreso real en `ai-workspace/context/03-current-progress.md`.
- Sprints en `ai-workspace/tasks/current-sprint.md`.
