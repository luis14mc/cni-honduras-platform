# 08 · Customización SIGI CNI por código (Extension)

Automatizar la configuración funcional inicial de SIGI CNI en SuiteCRM **sin usar Studio campo por campo** y **sin modificar archivos core**.

## Dos scripts complementarios

| Script | Qué hace | Dónde escribe |
|--------|----------|---------------|
| [`apply-sigi-cni-suitecrm-customizations.sh`](../scripts/apply-sigi-cni-suitecrm-customizations.sh) | Vardefs, listas desplegables y etiquetas | `suitecrm/public/legacy/custom/Extension/` |
| [`register-sigi-cni-fields-metadata.sh`](../scripts/register-sigi-cni-fields-metadata.sh) | Registro en `fields_meta_data` para que **Studio** liste los campos | Base MariaDB (`cni-suitecrm-db`) |

SuiteCRM Studio administra campos personalizados usando la tabla **`fields_meta_data`**. Los vardefs en `custom/Extension/` pueden existir a nivel runtime, pero Studio no necesariamente los muestra si no están registrados en esa tabla.

## Flujo recomendado

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
bash scripts/register-sigi-cni-fields-metadata.sh
```

Luego en SuiteCRM:

1. **Admin → Repair → Quick Repair and Rebuild**
2. Ejecutar el **SQL sugerido** en esa misma pantalla (crea/actualiza columnas en tablas `*_cstm`)
3. Revisar **Admin → Studio → Accounts / Contacts / Opportunities / Leads → Fields**

## Script 1: Extension (vardefs, listas, labels)

Escribe archivos PHP en:

```
crm/suitecrm/public/legacy/custom/Extension/
```

Genera:

| Destino | Contenido |
|---------|-----------|
| `application/Ext/Language/es_es.sigi_cni_lists.php` | Listas desplegables globales (`app_list_strings`) |
| `application/Ext/Language/en_us.sigi_cni_lists.php` | Mismas listas (etiquetas en español institucional) |
| `modules/Accounts/Ext/Vardefs/sigi_cni_fields.php` | Campos personalizados Accounts |
| `modules/Accounts/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas de campos |
| `modules/Accounts/Ext/Language/en_us.sigi_cni_fields.php` | Mismas etiquetas (español institucional CNI) |
| `modules/Contacts/Ext/Vardefs/sigi_cni_fields.php` | Campos Contacts |
| `modules/Contacts/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Contacts |
| `modules/Contacts/Ext/Language/en_us.sigi_cni_fields.php` | Mismas etiquetas (español institucional CNI) |
| `modules/Opportunities/Ext/Vardefs/sigi_cni_fields.php` | Campos Opportunities |
| `modules/Opportunities/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Opportunities |
| `modules/Opportunities/Ext/Language/en_us.sigi_cni_fields.php` | Mismas etiquetas (español institucional CNI) |
| `modules/Leads/Ext/Vardefs/sigi_cni_fields.php` | Campos Leads |
| `modules/Leads/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Leads |
| `modules/Leads/Ext/Language/en_us.sigi_cni_fields.php` | Mismas etiquetas (español institucional CNI) |

Cada par `es_es` / `en_us` usa **el mismo texto en español** por ahora, para que las etiquetas se vean aunque la interfaz de SuiteCRM esté en inglés (`en_us`).

Listas globales incluidas: ciclo de vida, sector económico, fuente de contacto, prioridad, tipo de inversión, estado de proyecto, idioma preferido y estado de lead.

### Qué **no** hace el script Extension

- No modifica `public/legacy/modules/` ni otros archivos core de SuiteCRM.
- No escribe en la base de datos.
- No ejecuta SQL manualmente.
- No toca `cache/` ni archivos generados por Repair.
- No sube nada a Git: los archivos generados viven en `crm/suitecrm/` (gitignored).

## Script 2: fields_meta_data (Studio)

[`register-sigi-cni-fields-metadata.sh`](../scripts/register-sigi-cni-fields-metadata.sh):

1. Verifica contenedores `cni-suitecrm-db` y `cni-suitecrm-app`.
2. Lee credenciales desde `crm/.env`.
3. Inserta o actualiza registros en `fields_meta_data` con `INSERT ... ON DUPLICATE KEY UPDATE`.
4. Usa IDs estables `<Módulo>_<campo>` (ej. `Accounts_estado_ciclo_vida_c`).
5. Si un campo ya existe (p. ej. creado manualmente en Studio con otro `id`), **actualiza ese registro** sin borrarlo ni duplicarlo.

Campos registrados: Accounts (10), Contacts (7), Opportunities (15), Leads (6).

### Qué **no** hace el script metadata

- No modifica archivos core de SuiteCRM.
- No borra campos existentes ni datos de registros CRM.
- No ejecuta `DROP TABLE`, `TRUNCATE` ni SQL de Repair (eso lo hace SuiteCRM en la UI).
- No sube `crm/.env` ni `crm/suitecrm/`.

## Requisitos previos

1. SuiteCRM 8 instalado y accesible (ej. `http://localhost:8085`).
2. Contenedores Docker en ejecución (`docker compose -f docker-compose.suitecrm.yml up -d`).
3. Existe `crm/suitecrm/public/legacy/` (para el script Extension).
4. Existe `crm/.env` con `SUITECRM_DB_NAME`, `SUITECRM_DB_USER`, `SUITECRM_DB_PASSWORD`.

## Permisos (Linux/WSL + Docker)

Si `custom/Extension/` fue creado por el contenedor (`www-data`), el usuario del host puede no poder escribir ahí:

```bash
bash scripts/fix-suitecrm-permissions.sh
# o, si persiste el error:
docker exec -u root cni-suitecrm-app chmod -R a+rwX /var/www/html/public/legacy/custom/Extension
```

Luego re-ejecutar `apply-sigi-cni-suitecrm-customizations.sh`.

## Quick Repair and Rebuild (obligatorio)

Tras ambos scripts:

1. Iniciar sesión como administrador.
2. **Admin → Repair → Quick Repair and Rebuild** → **Repair and Rebuild**.
3. Si aparece SQL para tablas/columnas `*_cstm`, **aplicarlo desde esa pantalla**.
4. Limpiar caché si SuiteCRM lo solicita.

SuiteCRM fusionará Extension en `custom/application/` y `custom/modules/` durante el Repair.

## Verificar en Studio

1. **Admin → Studio → Accounts / Contacts / Opportunities / Leads → Fields**
   - Deben aparecer campos `_c` SIGI CNI junto a los creados manualmente.
2. Si existen pero no se ven en formularios:
   - **Studio → [Módulo] → Layouts → Edit View / Detail View** — arrastrar campos, o usar [09-suitecrm-layout-customization.md](09-suitecrm-layout-customization.md).

### Etiquetas no visibles con UI en inglés

Si la interfaz está en **English (US)** y los campos muestran claves (`LBL_*`) en lugar de texto:

1. Re-ejecutar `apply-sigi-cni-suitecrm-customizations.sh` (genera `en_us.sigi_cni_*.php`).
2. **Admin → Repair → Quick Repair and Rebuild**.
3. Limpiar caché del navegador.

Los archivos `en_us` usan las mismas etiquetas en español que `es_es` (decisión institucional CNI).

Verificación rápida en base de datos:

```bash
docker exec -i cni-suitecrm-db mariadb -u"$SUITECRM_DB_USER" -p"$SUITECRM_DB_PASSWORD" "$SUITECRM_DB_NAME" \
  -e "SELECT id, custom_module, name, type FROM fields_meta_data WHERE name LIKE '%_c' AND deleted=0 ORDER BY custom_module, name;"
```

(Cargar variables desde `crm/.env` antes.)

## Relación con otra documentación

| Documento | Relación |
|-----------|----------|
| [06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md) | Especificación funcional de campos |
| [07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md) | Valores de ciclo de vida y etapas de proyecto |
| [05-suitecrm-cni-configuration.md](05-suitecrm-cni-configuration.md) | Configuración operativa general SIGI CNI |

Campos como `responsable_cni_c` (relate User) pueden seguir creándose en Studio si se requieren.

## Re-ejecutar

Ambos scripts son idempotentes. Tras cambios en el repo:

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
bash scripts/register-sigi-cni-fields-metadata.sh
```

Repetir **Quick Repair and Rebuild** en SuiteCRM.

## Referencias

- [SuiteCRM Extension Framework](https://docs.suitecrm.com/developer/extensions/)
- [04-suitecrm-local-validation.md](04-suitecrm-local-validation.md)
