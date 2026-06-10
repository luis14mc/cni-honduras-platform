# 09 · Token Rules (para asistentes de IA)

Reglas para Cursor, Codex, Claude Code y Antigravity al trabajar en este repo. Objetivo: maximizar utilidad, minimizar tokens y evitar daño.

## Antes de actuar
1. Lee primero `ai-workspace/context/00`..`06` y este archivo.
2. No asumas: si un endpoint/modelo no existe, verifícalo (Grep/Read) antes de afirmarlo.
3. Cambios mínimos y enfocados al pedido.

## Restricciones duras (no hacer sin pedido explícito)
- No mover `frontend/` ni `backend/`.
- No modificar `docker-compose.yml`.
- No instalar/actualizar dependencias.
- No modificar modelos existentes.
- No crear migraciones.
- No borrar archivos.
- No cambiar el diseño existente.

## Eficiencia de tokens
- No leer archivos enormes completos si basta una búsqueda dirigida (Grep/Glob).
- No repetir contenido de archivos ya leídos.
- Resúmenes cortos; código solo cuando aporta.
- Reusar helpers existentes (`src/config/siteNavigation`, `src/lib`) en vez de reescribir.

## Documentación viva
- Al completar trabajo relevante: actualizar `03-current-progress.md` y `changelog/CHANGELOG.md`.
- Decisiones de arquitectura → nuevo ADR en `ai-workspace/decisions/`.
- Tareas → `ai-workspace/tasks/`.

## Calidad
- Frontend: respetar i18n (no hardcodear strings), tipar todo, `pnpm run lint` limpio.
- Backend: PEP 8, patrón DRF por app.
- Verificar lints tras editar.
