# AGENTS.md — CNI Honduras Platform

Reglas obligatorias para agentes automatizados (Cursor, Claude Code, MiniMax u otros) que trabajan en `luis14mc/cni-honduras-platform`.

## Rama de integración

- **Integración actual:** `master`
- **Despliegues de testing:** Vercel (frontend) y Render (backend) desde `master`
- **No existe rama `staging`** por ahora. Todo PR va contra `master`.

## Reglas obligatorias

1. **Nunca trabajar directamente en `master`.**
2. **Nunca hacer push directo a `master`.**
3. **Una tarea funcional por rama** — no mezclar T1 + T5 + refactors visuales.
4. **No mezclar ajustes visuales con cambios de arquitectura** en el mismo PR.
5. **No crear modelos duplicados** (p. ej. otro `Sector` o `SuccessStory` fuera de su app).
6. **No hardcodear URLs de ambientes** — usar `NEXT_PUBLIC_API_URL`, `DATABASE_URL`, etc.
7. **No subir secretos** ni archivos `.env`, `.env.local`, credenciales o tokens.
8. **Reutilizar** arquitectura, modelos, servicios, serializers y componentes existentes.
9. **Mantener compatibilidad ES/EN** (`django-modeltranslation`, `?lang=` en API).
10. **No presentar mocks como contenido real** — diferenciar empty vs error.
11. **No eliminar compatibilidad legacy** (`/api/cms/…`) sin autorización explícita.
12. **No generar migraciones innecesarias** — ejecutar `makemigrations --check` antes del PR.
13. **No hacer merge automático** — el humano aprueba y mergea.

## Convenciones de ramas

```
feat/S1-T5-enlaces-institucionales
fix/S1-T4-sector-locale
chore/ci-pr-automation
```

Formato: `<tipo>/<ticket-o-descripcion-corta>`

## Commits convencionales

```
feat(cms): add institutional links admin filters
fix(frontend): distinguish empty and error on press list
fix(deploy): flatten backend requirements for Vercel
test(cms): cover banner window filtering
docs(workflow): document agent PR process
chore(workflow): configure agent-driven pull request process
```

Prefijos habituales: `feat`, `fix`, `test`, `docs`, `chore`, `refactor` (solo con autorización).

## Flujo obligatorio del agente implementador

1. `git checkout master && git pull origin master`
2. `git checkout -b <rama>`
3. Auditar el código existente **antes** de modificar
4. Implementar **solo** el alcance acordado
5. Ejecutar validaciones (ver abajo)
6. Revisar `git diff`
7. Commit convencional
8. `git push -u origin HEAD`
9. Crear Pull Request contra `master`
10. **No hacer merge**
11. Entregar URL del PR

## Validaciones mínimas

### Backend (`backend/`)

```bash
python manage.py check
python manage.py makemigrations --check
python manage.py test
```

En CI local usar: `DJANGO_SETTINGS_MODULE=config.settings.ci`

### Frontend (`frontend/`)

```bash
pnpm lint
pnpm run build
```

## Antes de implementar — reportar

- Estado actual del código
- Archivos que se espera tocar
- Riesgos (migraciones, API breaking, dual source of truth)
- Migraciones previstas (sí/no)
- Endpoints afectados

## Después de implementar — reportar

- Archivos modificados
- Pruebas ejecutadas y resultados
- Migraciones generadas (debe ser ninguna salvo alcance)
- Deuda técnica introducida o documentada
- **URL del Pull Request**

## Referencias

- Flujo detallado: `docs/development/agent-workflow.md`
- Reglas Cursor: `.cursor/rules/cni-project.mdc`
- Auditoría de PRs: `CLAUDE.md`
- Template de PR: `.github/pull_request_template.md`
