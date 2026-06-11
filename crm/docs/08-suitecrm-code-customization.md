# 08 · Customización SIGI CNI por código (Extension)

Automatizar la configuración funcional inicial de SIGI CNI en SuiteCRM **sin usar Studio campo por campo** y **sin modificar archivos core**.

## Qué hace el script

El script [`scripts/apply-sigi-cni-suitecrm-customizations.sh`](../scripts/apply-sigi-cni-suitecrm-customizations.sh) escribe archivos PHP en el mecanismo estándar de SuiteCRM/SugarCRM:

```
crm/suitecrm/public/legacy/custom/Extension/
```

Genera:

| Destino | Contenido |
|---------|-----------|
| `application/Ext/Language/es_es.sigi_cni_lists.php` | Listas desplegables globales (`app_list_strings`) |
| `modules/Accounts/Ext/Vardefs/sigi_cni_fields.php` | Campos personalizados Accounts |
| `modules/Accounts/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas en español |
| `modules/Contacts/Ext/Vardefs/sigi_cni_fields.php` | Campos Contacts |
| `modules/Contacts/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Contacts |
| `modules/Opportunities/Ext/Vardefs/sigi_cni_fields.php` | Campos Opportunities |
| `modules/Opportunities/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Opportunities |
| `modules/Leads/Ext/Vardefs/sigi_cni_fields.php` | Campos Leads |
| `modules/Leads/Ext/Language/es_es.sigi_cni_fields.php` | Etiquetas Leads |

Listas globales incluidas: ciclo de vida, sector económico, fuente de contacto, prioridad, tipo de inversión, estado de proyecto, idioma preferido y estado de lead.

## Qué **no** hace

- No modifica `public/legacy/modules/` ni otros archivos core de SuiteCRM.
- No escribe en la base de datos directamente.
- No ejecuta SQL manualmente.
- No toca `cache/` ni archivos generados por Repair.
- No sube nada a Git: los archivos generados viven en `crm/suitecrm/` (gitignored).

El script vive en el repo (`crm/scripts/`). Los archivos Extension se generan **localmente** dentro de la instalación SuiteCRM descargada.

## Requisitos previos

1. SuiteCRM 8 instalado y accesible (ej. `http://localhost:8085`).
2. Existe la ruta:
   ```
   crm/suitecrm/public/legacy/
   ```

## Cómo ejecutarlo

Desde la raíz del monorepo o desde `crm/`:

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
```

El script detecta automáticamente `crm/suitecrm/public/legacy`. Si no existe, falla con un mensaje claro.

### Permisos (Linux/WSL + Docker)

Si `custom/Extension/` fue creado por el contenedor (`www-data`), el usuario del host puede no poder escribir ahí. Opciones:

```bash
bash scripts/fix-suitecrm-permissions.sh
# o, si persiste el error:
docker exec -u root cni-suitecrm-app chmod -R a+rwX /var/www/html/public/legacy/custom/Extension
```

Luego re-ejecutar el script.

Salida esperada al final:

```
Customizaciones SIGI CNI generadas.
Ahora ejecutar en SuiteCRM:
  Admin → Repair → Quick Repair and Rebuild
Luego ejecutar cualquier SQL sugerido por SuiteCRM para crear columnas *_cstm.
```

## Paso siguiente en SuiteCRM (obligatorio)

1. Iniciar sesión como administrador.
2. Ir a **Admin → Repair → Quick Repair and Rebuild**.
3. Ejecutar **Repair and Rebuild**.
4. Si SuiteCRM muestra SQL para crear tablas/columnas `*_cstm`, **ejecutarlo desde esa misma pantalla** (botón proporcionado por SuiteCRM).
5. Limpiar caché si el instalador lo solicita.

SuiteCRM fusionará los archivos de `custom/Extension/` en `custom/application/` y `custom/modules/` durante el Repair.

## Verificar campos creados

1. **Admin → Studio → Accounts / Contacts / Opportunities / Leads → Fields**
   - Deben aparecer los campos con sufijo `_c` (ej. `sector_economico_c`, `estado_proyecto_c`).
2. Si los campos existen pero no se ven en formularios:
   - **Studio → [Módulo] → Layouts → Edit View / Detail View**
   - Arrastrar los campos SIGI CNI a la vista deseada.

## Relación con otra documentación

| Documento | Relación |
|-----------|----------|
| [06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md) | Especificación funcional de campos (referencia manual en Studio) |
| [07-suitecrm-pipeline-stages.md](07-suitecrm-pipeline-stages.md) | Valores de ciclo de vida y etapas de proyecto |
| [05-suitecrm-cni-configuration.md](05-suitecrm-cni-configuration.md) | Configuración operativa general SIGI CNI |

El script implementa por código la mayor parte de lo descrito en el doc 06. Campos como `responsable_cni_c` (relate User) pueden seguir creándose en Studio si se requieren.

## Re-ejecutar el script

Es idempotente: sobrescribe los archivos `sigi_cni_*.php` en Extension. Tras cambios en el script del repo:

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
```

Luego repetir **Quick Repair and Rebuild** en SuiteCRM.

## Referencias

- [SuiteCRM Extension Framework](https://docs.suitecrm.com/developer/extensions/)
- [04-suitecrm-local-validation.md](04-suitecrm-local-validation.md)
