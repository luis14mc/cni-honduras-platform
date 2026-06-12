# 09 · Layouts SIGI CNI (EditView / DetailView)

Automatizar la **ubicación de campos SIGI CNI** en los layouts de SuiteCRM para Accounts, Contacts, Opportunities y Leads, sin arrastrarlos manualmente en Studio.

## Qué hace el script

[`apply-sigi-cni-suitecrm-layouts.sh`](../scripts/apply-sigi-cni-suitecrm-layouts.sh) genera archivos de metadata en:

```
crm/suitecrm/public/legacy/custom/modules/<Module>/metadata/
├── editviewdefs.php
└── detailviewdefs.php
```

También crea etiquetas de panel en (por módulo):

```
crm/suitecrm/public/legacy/custom/Extension/modules/<Module>/Ext/Language/
├── es_es.sigi_cni_layout.php
└── en_us.sigi_cni_layout.php
```

Ambos locales llevan las **mismas etiquetas en español** (CRM institucional CNI), para que los títulos de panel se muestren aunque el usuario tenga la UI en inglés.

| Módulo | Sección (panel) | Etiqueta |
|--------|-----------------|----------|
| Accounts | Perfil del inversionista | `LBL_SIGI_CNI_INVESTOR_PROFILE` |
| Contacts | Perfil del contacto inversionista | `LBL_SIGI_CNI_CONTACT_PROFILE` |
| Opportunities | Proyecto de inversión | `LBL_SIGI_CNI_PROJECT_PROFILE` |
| Leads | Datos del lead de inversión | `LBL_SIGI_CNI_LEAD_PROFILE` |

Los paneles usan la clave interna `lbl_sigi_cni_panel` y un panel `default` (información estándar en Accounts; vacío en los demás módulos donde todos los campos van en la sección SIGI CNI).

## Requisitos previos

1. SuiteCRM 8 instalado en `crm/suitecrm/` con `public/legacy/`.
2. **Los campos personalizados ya deben existir** (vardefs + columnas `*_cstm`):
   - [`apply-sigi-cni-suitecrm-customizations.sh`](../scripts/apply-sigi-cni-suitecrm-customizations.sh)
   - [`register-sigi-cni-fields-metadata.sh`](../scripts/register-sigi-cni-fields-metadata.sh) (recomendado para Studio)
   - **Admin → Repair → Quick Repair and Rebuild** (y SQL sugerido si aplica)

Este script **no crea campos**; solo define dónde aparecen en EditView y DetailView.

## Orden de ejecución recomendado

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
bash scripts/register-sigi-cni-fields-metadata.sh
# En SuiteCRM: Admin → Repair → Quick Repair and Rebuild (+ SQL si lo pide)
bash scripts/apply-sigi-cni-suitecrm-layouts.sh
# En SuiteCRM: Admin → Repair → Quick Repair and Rebuild (de nuevo)
```

## Ejecutar el script de layouts

```bash
cd crm
bash scripts/apply-sigi-cni-suitecrm-layouts.sh
```

Si aparece error de permisos en `custom/modules/`, los archivos pueden pertenecer a `www-data` (Docker). Ajustar ownership localmente, por ejemplo:

```bash
sudo chown -R "$(whoami):$(whoami)" suitecrm/public/legacy/custom
```

Salida esperada: lista de archivos `[OK]` y, si ya existían layouts custom, copias de respaldo `[BACKUP] ... .bak.YYYYMMDDHHMMSS`.

Luego en SuiteCRM:

**Admin → Repair → Quick Repair and Rebuild**

## Validación en la UI

Después de Repair/Rebuild, crear registros de prueba:

| Acción | Sección esperada |
|--------|------------------|
| Accounts → Create Account | **Perfil del inversionista** con campos `*_c` |
| Contacts → Create Contact | **Perfil del contacto inversionista** |
| Opportunities → Create Opportunity | **Proyecto de inversión** |
| Leads → Create Lead | **Datos del lead de inversión** |

Los campos SIGI CNI deben aparecer automáticamente en EditView y DetailView.

## Si no se ven los cambios

1. Ejecutar de nuevo **Admin → Repair → Quick Repair and Rebuild**.
2. Limpiar caché del navegador (o ventana privada).
3. Si los **títulos de panel** muestran claves `LBL_*` con UI en inglés, re-ejecutar el script (genera `en_us.sigi_cni_layout.php`) y repetir Repair.
4. Confirmar que existen los archivos en el host:
   ```bash
   ls crm/suitecrm/public/legacy/custom/modules/Accounts/metadata/
   ls crm/suitecrm/public/legacy/custom/modules/Contacts/metadata/
   ls crm/suitecrm/public/legacy/custom/modules/Opportunities/metadata/
   ls crm/suitecrm/public/legacy/custom/modules/Leads/metadata/
   ```
4. Si hubo layouts previos, revisar respaldos `*.bak.YYYYMMDDHHMMSS` en la misma carpeta.

## Qué **no** hace este script

- No modifica `public/legacy/modules/` (core).
- No escribe SQL ni toca la base de datos.
- No borra datos de registros CRM.
- No sube `crm/suitecrm/` a Git (gitignored).

## Respaldo automático

Si ya existen `custom/modules/<Module>/metadata/editviewdefs.php` o `detailviewdefs.php`, el script crea una copia `.bak.YYYYMMDDHHMMSS` antes de sobrescribir.

## Referencias

- Campos y vardefs: [08-suitecrm-code-customization.md](08-suitecrm-code-customization.md)
- Campos manuales (referencia): [06-suitecrm-custom-fields.md](06-suitecrm-custom-fields.md)
