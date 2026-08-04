# Flujo de trabajo con agentes y Pull Requests

Este documento describe cómo trabajan los agentes automatizados en `luis14mc/cni-honduras-platform`.

## Contexto

| Elemento | Valor |
|----------|-------|
| Repositorio | `luis14mc/cni-honduras-platform` |
| Rama de integración | `master` |
| Deploy testing frontend | Vercel (`test.cni.hn`) desde `master` |
| Deploy testing backend | Render (`api-test.cni.hn`) desde `master` |
| Rama `staging` | **No existe** por ahora |

`master` es producción de testing. **No pushear directamente.**

---

## Roles

### Cursor (implementador)

- Crea rama desde `master`
- Audita, implementa, valida, commit, push
- Abre PR contra `master`
- **No mergea**

Reglas: `.cursor/rules/cni-project.mdc`, `AGENTS.md`

### Claude (auditor)

- Revisa PRs abiertos
- Emite BLOCKER / HIGH / MEDIUM / LOW / APPROVED
- **No implementa** ni commitea en la rama del PR

Reglas: `CLAUDE.md`

### MiniMax (opcional)

- Delegación del humano para implementación alternativa o revisión secundaria
- Mismas reglas que Cursor si implementa

### Humano (owner)

- Aprueba PRs
- Resuelve conflictos de merge
- Mergea a `master` cuando CI y auditoría están OK
- Dispara deploys automáticos en Vercel/Render

---

## Flujo de ramas

```text
master (integración + deploy testing)
  │
  ├── feat/S1-T5-enlaces-institucionales
  ├── fix/S1-T4-sector-locale
  └── chore/ci-pr-automation
```

### Convención de nombres

```
<tipo>/<ticket-o-descripcion-corta>
```

Tipos: `feat`, `fix`, `chore`, `test`, `docs`, `refactor` (con autorización)

### Commits

Formato convencional:

```
feat(cms): add featured filter to documents API
fix(deploy): adapt Dockerfile for monorepo context
docs(workflow): document agent PR process
```

---

## Proceso paso a paso (implementador)

1. **Actualizar base**
   ```bash
   git checkout master
   git pull origin master
   ```

2. **Crear rama**
   ```bash
   git checkout -b feat/S1-T5-enlaces-institucionales
   ```

3. **Auditar** — leer modelos, servicios, páginas afectadas; reportar alcance

4. **Implementar** — solo lo acordado; sin refactors colaterales

5. **Validar localmente**

   Backend:
   ```bash
   cd backend
   python manage.py check
   python manage.py makemigrations --check
   python manage.py test
   ```

   Frontend:
   ```bash
   cd frontend
   pnpm lint
   pnpm run build
   ```

   CI local backend (con PostGIS):
   ```bash
   cd backend
   DJANGO_SETTINGS_MODULE=config.settings.ci \
   POSTGRES_DB=cni_test POSTGRES_USER=cni POSTGRES_PASSWORD=cni \
   python manage.py test
   ```

6. **Revisar diff**
   ```bash
   git diff master...HEAD
   ```

7. **Commit y push**
   ```bash
   git add <archivos>
   git commit -m "feat(cms): descripción"
   git push -u origin HEAD
   ```

8. **Crear PR**
   ```bash
   gh pr create --base master --title "..." --body-file .github/pull_request_template.md
   ```
   Completar todas las secciones del template.

9. **Entregar URL del PR** — no mergear

---

## CI en GitHub Actions

Workflow: `.github/workflows/ci.yml`

| Job | Qué valida |
|-----|------------|
| `frontend-ci` | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm run build` |
| `backend-ci` | PostGIS 16 (servicio efímero), `check`, `makemigrations --check`, `test` |

- **No usa Neon** — base PostgreSQL/PostGIS temporal en el runner
- Settings aislados: `config.settings.ci`
- Python **3.11** (alineado con Dockerfile)

---

## Cómo corregir observaciones del auditor

1. Hacer checkout de la **misma rama** del PR
2. Corregir solo lo señalado (BLOCKER/HIGH primero)
3. Re-ejecutar validaciones
4. Push a la rama — CI se re-ejecuta automáticamente
5. Responder en el PR con resumen de fixes

---

## Cuándo se permite merge

Merge a `master` solo cuando:

- [ ] CI verde (`frontend-ci` + `backend-ci`)
- [ ] Auditoría sin BLOCKER (Claude u humano)
- [ ] Template de PR completo
- [ ] CODEOWNERS aprobó (si branch protection está activa)
- [ ] Humano autoriza explícitamente

**Los agentes nunca mergean.**

---

## Rollback si el deploy falla

Tras merge a `master`, Vercel y Render despliegan automáticamente.

### Opción A — Revert del merge commit

```bash
git checkout master
git pull origin master
git revert -m 1 <merge-commit-sha>
git push origin master
```

### Opción B — Redeploy de commit anterior

- **Vercel:** dashboard → Deployments → redeploy commit anterior estable
- **Render:** dashboard → Manual Deploy → commit anterior

### Opción C — Hotfix en rama nueva

```bash
git checkout -b fix/hotfix-deploy master
# corrección mínima
git push -u origin HEAD
# PR urgente → merge cuando CI pase
```

---

## Archivos de referencia

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Reglas globales para agentes |
| `CLAUDE.md` | Rol del auditor |
| `.cursor/rules/cni-project.mdc` | Reglas Cursor en IDE |
| `.github/pull_request_template.md` | Template de PR |
| `.github/workflows/ci.yml` | CI automático |
| `.github/CODEOWNERS` | Revisores requeridos |
| `backend/config/settings/ci.py` | Settings Django aislados para CI |

---

## Limitaciones conocidas

1. **CI backend** requiere GDAL en el runner — instalado vía `apt` en el workflow
2. **Tests** son el suite Django actual (`apps/cms/tests/`) — ampliar según nuevas apps
3. **Branch protection** debe activarse manualmente en GitHub para exigir CI + review
4. **Neon/PostGIS local** no se usa en CI — solo contenedor PostGIS efímero
5. **pnpm lint** puede reportar warnings sin fallar — solo errors bloquean
