# 10 · Permisos de desarrollo en `custom/`

SuiteCRM escribe y fusiona customizaciones bajo:

```
crm/suitecrm/public/legacy/custom/
```

En Docker local, Apache/PHP corre como **`www-data`** dentro del contenedor `cni-suitecrm-app`. Ese usuario es el dueño efectivo de muchos archivos en `custom/` después de:

- Quick Repair and Rebuild
- Uso de Studio
- Cualquier operación del CRM que genere Extension o metadata

En WSL/Linux, el usuario local (`$USER`) ejecuta los scripts SIGI CNI desde el host. Si `custom/` pertenece a `www-data`, los scripts fallan con *Permission denied* y hay que corregir ownership a mano.

## Scripts de desarrollo

| Script | Cuándo usarlo |
|--------|----------------|
| [`dev-unlock-suitecrm-custom.sh`](../scripts/dev-unlock-suitecrm-custom.sh) | **Antes** de generar o editar archivos custom desde el host |
| [`dev-lock-suitecrm-custom.sh`](../scripts/dev-lock-suitecrm-custom.sh) | **Después** de los scripts SIGI CNI y **antes** de Repair/Rebuild |

### `dev-unlock-suitecrm-custom.sh`

1. Valida que exista `crm/suitecrm/public/legacy/custom/`.
2. Ejecuta `sudo chown -R $USER:$USER` sobre ese directorio.
3. Ajusta permisos orientativos: directorios `775`, archivos `664` (no usa `777`).

### `dev-lock-suitecrm-custom.sh`

1. Valida que `cni-suitecrm-app` esté en ejecución.
2. Dentro del contenedor: `chown -R www-data:www-data` en `/var/www/html/public/legacy/custom`.
3. Mismos permisos `775` / `664` para dirs/archivos.

## Flujo recomendado (SIGI CNI)

```bash
cd crm
bash scripts/dev-unlock-suitecrm-custom.sh
bash scripts/apply-sigi-cni-suitecrm-customizations.sh
bash scripts/register-sigi-cni-fields-metadata.sh
bash scripts/apply-sigi-cni-suitecrm-layouts.sh
bash scripts/dev-lock-suitecrm-custom.sh
```

Luego en SuiteCRM:

**Admin → Repair → Quick Repair and Rebuild**

(Ejecutar SQL sugerido si la pantalla lo muestra.)

## Solo desarrollo local

Estos scripts están pensados para **desarrollo local** con el stack `docker-compose.suitecrm.yml`.

En **producción** (`crm.cni.hn` u otro servidor):

- Definir ownership y permisos según el usuario real del servicio web.
- No aplicar `sudo chown` al usuario de la máquina de desarrollo.
- Automatizar despliegues con el usuario/grupo correcto desde CI/CD o el playbook de infraestructura.

## Relación con otros scripts

| Documento / script | Relación |
|--------------------|----------|
| [08-suitecrm-code-customization.md](08-suitecrm-code-customization.md) | Campos y labels SIGI CNI |
| [09-suitecrm-layout-customization.md](09-suitecrm-layout-customization.md) | Layouts EditView/DetailView |
| [`fix-suitecrm-permissions.sh`](../scripts/fix-suitecrm-permissions.sh) | Permisos generales bajo `suitecrm/` (chmod orientativo); no alterna ownership host/contenedor |

## Si algo falla

**Unlock pide contraseña sudo:** normal en WSL/Linux; el script necesita elevar privilegios para cambiar ownership.

**Lock dice que el contenedor no corre:**

```bash
cd crm
docker compose -f docker-compose.suitecrm.yml up -d
```

**Repair falla tras unlock sin lock:** ejecutar `dev-lock-suitecrm-custom.sh` y repetir Repair para que Apache escriba como `www-data`.
