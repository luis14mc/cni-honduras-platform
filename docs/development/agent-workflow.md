# Flujo de trabajo con agentes y Pull Requests

Este documento describe cómo trabajan los agentes automatizados en `luis14mc/cni-honduras-platform`.

## Contexto

| Elemento | Valor |
|----------|-------|
| Repositorio | `luis14mc/cni-honduras-platform` |
| Rama de integración | `master` |
| Entorno Railway `staging` | Rama `testing` · `test.cni.hn` |
| Entorno Railway `production` | Rama `production` · `cni.hn` |

Las ramas permanentes reciben cambios mediante pull requests. [Decisión del PO](https://github.com/luis14mc/cni-honduras-platform/issues/91#issuecomment-7143751224).

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
- Integra en `master` cuando CI y auditoría están en verde
- Aprueba las promociones a `testing` y `production` según sus criterios de salida

---

## Flujo de ramas

```text
feature → master → testing → production
                    staging    producción
```

1. Abra los PR de funcionalidad contra `master`. Esta rama ejecuta CI para integración.
2. Promueva `master` a `testing` mediante PR. Railway despliega staging tras pasar la CI del push a `testing`.
3. Registre el SHA desplegado y el [smoke de staging](../CMS_STAGING_SMOKE_TEST.md). Abra el PR de `testing` a `production` cuando el smoke esté en verde. Con CI y aprobación humana del CNI, el responsable puede hacer merge y Railway despliega producción tras la CI del push.

Proteja `testing` y `production` contra pushes directos. Exija PR y CI para ambas y al menos una aprobación humana para `production`. Use merge commits para promociones y reincorporaciones entre ramas permanentes, de modo que Git conserve el historial compartido. [Guía de Railway](../deployment/railway.md#ramas-de-despliegue).

### Hotfix de producción

1. Actualice la referencia remota y cree la rama desde producción con `git fetch origin production` y `git switch -c fix/hotfix-descripcion origin/production`.
2. Abra el PR del hotfix contra `production`. El responsable humano aprueba y hace merge cuando la CI está en verde. Verifique el autodeploy y los flujos afectados.
3. Reincorpore el cambio mediante PR de `production` hacia `testing` y otro hacia `master`. Si hay conflictos, resuélvalos en ramas de trabajo dirigidas a cada destino y verifique la corrección en ambos antes de retomar las promociones.

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

Se ejecuta para PRs con base `master`, `testing` o `production` y para pushes a cualquiera de esas tres ramas, incluidos los commits de merge.

| Job | Qué valida |
|-----|------------|
| `frontend-ci` | Instalación bloqueada, lint, pruebas unitarias, build y E2E |
| `backend-ci` | PostGIS 16 (servicio efímero), `check`, `makemigrations --check`, `test` |
| `backend-image` | Build de la imagen de Django sin publicación |
| `strapi-ci` | Build del admin y pruebas de permisos y API |

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

- [ ] CI verde
- [ ] Auditoría sin BLOCKER (Claude u humano)
- [ ] Template de PR completo
- [ ] CODEOWNERS aprobó (si branch protection está activa)
- [ ] Humano autoriza explícitamente

**Los agentes nunca mergean.**

---

## Rollback si el deploy falla

Pause el autodeploy del entorno afectado y restaure en Railway la última revisión compatible según el [checklist de marcha atrás](../deployment/checklist-produccion.md#marcha-atrás). Abra un PR de reversión para reconciliar la rama afectada. En producción, siga el [flujo de hotfix](#hotfix-de-producción) para devolver el cambio a `testing` y `master`.

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
