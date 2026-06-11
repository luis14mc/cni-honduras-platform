# 04 · Validación local de SuiteCRM

Checklist y comandos para validar una instalación local de SuiteCRM en `crm/`, sin mezclar el stack con Django ni Next.js.

## Scripts de soporte

| Script | Propósito |
|--------|-----------|
| `scripts/check-suitecrm-files.sh` | Verifica archivos mínimos antes de levantar Docker |
| `scripts/fix-suitecrm-permissions.sh` | Ajusta permisos orientativos en Linux/WSL |

Ejecutar desde `crm/`:

```bash
bash scripts/check-suitecrm-files.sh
bash scripts/fix-suitecrm-permissions.sh
```

## Paso 1 — Copiar SuiteCRM descargado

1. Descargar el ZIP oficial de SuiteCRM (no commitear el archivo).
2. Descomprimir **el contenido** dentro de `crm/suitecrm/`.

Estructura esperada (SuiteCRM 8+):

> **SuiteCRM 8+ usa `/public` como DocumentRoot.** Apache debe apuntar a `/var/www/html/public`, no a la raíz del proyecto. La configuración está en `apache/vhost.conf` y se monta en el contenedor `suitecrm-app`.

```
crm/
├── suitecrm/
│   ├── public/
│   │   └── index.php          ← obligatorio
│   ├── bin/
│   ├── config/
│   ├── cache/                 ← puede crearse en instalación
│   ├── logs/
│   ├── upload/
│   └── ...
├── .env
├── docker-compose.suitecrm.yml
└── mariadb/                   ← creado por Docker (ignorado por Git)
```

**Error común:** descomprimir el ZIP de forma que quede `crm/suitecrm/SuiteCRM/public/` con un nivel extra. El `index.php` debe estar en `crm/suitecrm/public/index.php`.

Ejemplo (Linux/WSL):

```bash
cd crm
mkdir -p suitecrm
unzip ~/Downloads/SuiteCRM-*.zip -d /tmp/suitecrm-extract
# Ajustar según la estructura del ZIP:
cp -a /tmp/suitecrm-extract/SuiteCRM/. suitecrm/
```

## Paso 2 — Entorno y validación de archivos

```bash
cd crm
cp .env.example .env
# Editar .env con contraseñas seguras (no commitear)

bash scripts/check-suitecrm-files.sh
```

El script valida:

- [x] Existe `crm/suitecrm/`
- [x] Existe `crm/suitecrm/public/index.php`
- [x] Existe `crm/.env`
- [x] Existe `crm/docker-compose.suitecrm.yml`

## Paso 3 — Permisos (Linux/WSL)

```bash
bash scripts/fix-suitecrm-permissions.sh
```

Aplica permisos orientativos para desarrollo. En producción usar el usuario real del servidor web.

## Paso 4 — Docker Compose

```bash
cd crm
docker compose -f docker-compose.suitecrm.yml up -d
docker compose -f docker-compose.suitecrm.yml ps
```

Volúmenes montados:

| Host | Contenedor | Propósito |
|------|------------|-----------|
| `./suitecrm` | `/var/www/html` | Código SuiteCRM 8+ |
| `./apache/vhost.conf` | `/etc/apache2/sites-available/000-default.conf.template` | VirtualHost (DocumentRoot `/public`) |

Al iniciar, el contenedor sustituye `${SUITECRM_DOMAIN}` desde `.env`, habilita `mod_rewrite` y `mod_headers`, y arranca Apache.

La imagen de `suitecrm-app` se construye desde `php/Dockerfile` (PHP 8.2 + extensiones requeridas por SuiteCRM). Los límites PHP para instalación local están en `php/conf.d/suitecrm.ini`. Tras cambiar el Dockerfile o ese archivo, reconstruir con `docker compose ... build --no-cache suitecrm-app`.

Abrir en el navegador (puerto por defecto):

```
http://localhost:8085
```

Si cambiaste `SUITECRM_PORT` en `.env`, usa ese puerto.

## Paso 5 — Revisar logs y Apache

App (Apache/PHP):

```bash
docker compose -f docker-compose.suitecrm.yml logs -f suitecrm-app
```

Verificar extensiones PHP instaladas:

```bash
docker exec -it cni-suitecrm-app php -m
docker exec -it cni-suitecrm-app php -m | grep intl
```

Debe incluir `intl` (y otras extensiones del Dockerfile: `pdo_mysql`, `mysqli`, `zip`, `gd`, `mbstring`, `soap`, `opcache`).

Verificar límites PHP para el instalador:

```bash
docker exec -it cni-suitecrm-app php -i | grep -E "memory_limit|upload_max_filesize|post_max_size|max_execution_time|max_input_time|date.timezone"
```

> **Nota:** `php -i` usa el SAPI **CLI**. En CLI, PHP ignora `max_execution_time` (muestra `0`) y `max_input_time` (muestra `-1`) aunque estén en `suitecrm.ini`. El instalador web usa **Apache/mod_php**, donde sí aplican `300`. Para comprobarlo vía HTTP: crear temporalmente un script en `public/` que haga `echo ini_get('max_execution_time');` y abrirlo en el navegador, o revisar **PHP CHECKS** en `/install.php`.

Valores esperados (desde `php/conf.d/suitecrm.ini`):

| Directiva | Valor |
|-----------|-------|
| `memory_limit` | 512M |
| `upload_max_filesize` | 64M |
| `post_max_size` | 64M |
| `max_execution_time` | 300 |
| `max_input_time` | 300 |
| `date.timezone` | America/Tegucigalpa |

Verificar virtual host y DocumentRoot:

```bash
docker exec -it cni-suitecrm-app apache2ctl -S
```

Debe mostrar `DocumentRoot "/var/www/html/public"`. Si aparece listado de directorio o 403, revisar que exista `suitecrm/public/index.php` y permisos.

Base de datos (MariaDB):

```bash
docker compose -f docker-compose.suitecrm.yml logs -f suitecrm-db
```

## Checklist de instalación

- [ ] ZIP descargado localmente (no en Git)
- [ ] Contenido en `crm/suitecrm/` con `public/index.php`
- [ ] `cp .env.example .env` y contraseñas actualizadas
- [ ] `bash scripts/check-suitecrm-files.sh` → OK
- [ ] `bash scripts/fix-suitecrm-permissions.sh` (Linux/WSL)
- [ ] `docker compose -f docker-compose.suitecrm.yml up -d`
- [ ] `docker exec -it cni-suitecrm-app php -m | grep intl` → `intl`
- [ ] `docker exec -it cni-suitecrm-app php -i | grep memory_limit` → 512M
- [ ] `docker exec -it cni-suitecrm-app apache2ctl -S` → DocumentRoot `/var/www/html/public` (sin warning AH00558)
- [ ] Contenedores `suitecrm-db` y `suitecrm-app` en estado running/healthy
- [ ] Instalador web accesible en `http://localhost:${SUITECRM_PORT}` (sin listado de directorio ni 403)
- [ ] Conexión DB en instalador: host `suitecrm-db`, puerto `3306`, credenciales de `.env`
- [ ] Login SuiteCRM funcional tras instalación

## Errores comunes

### Error: Call to undefined function locale_get_default()

**Síntoma:** Al abrir `http://localhost:${SUITECRM_PORT}` aparece un fatal error en `SugarLogger.php` indicando que `locale_get_default()` no está definida.

**Explicación:** La función `locale_get_default()` pertenece a la extensión PHP **intl**. Si aparece este error, el contenedor PHP no tiene `ext-intl` instalada.

**Solución:** Reconstruir `suitecrm-app` con el Dockerfile personalizado:

```bash
cd crm
docker compose -f docker-compose.suitecrm.yml down
docker compose -f docker-compose.suitecrm.yml build --no-cache suitecrm-app
docker compose -f docker-compose.suitecrm.yml up -d
```

Validar:

```bash
docker exec -it cni-suitecrm-app php -m | grep intl
```

Debe devolver:

```
intl
```

Comandos adicionales de diagnóstico:

```bash
docker exec -it cni-suitecrm-app php -m
docker exec -it cni-suitecrm-app apache2ctl -S
docker compose -f docker-compose.suitecrm.yml logs -f suitecrm-app
```

### PHP CHECKS fallan por límites bajos

**Síntoma:** En el instalador (`/install.php`), la sección **PHP CHECKS** marca error en `memory_limit`, `upload_max_filesize`, `post_max_size`, `max_execution_time`, `max_input_time` o `date.timezone`.

**Explicación:** SuiteCRM requiere valores PHP más altos que los de la imagen base `php:8.2-apache` (por defecto: 128M, 2M, 8M, etc.). Los valores para instalación local se configuran en `crm/php/conf.d/suitecrm.ini` y se copian al contenedor en el build del Dockerfile.

**Solución:** Reconstruir la imagen tras cambiar `suitecrm.ini`:

```bash
cd crm
docker compose -f docker-compose.suitecrm.yml down
docker compose -f docker-compose.suitecrm.yml build --no-cache suitecrm-app
docker compose -f docker-compose.suitecrm.yml up -d
```

Validar:

```bash
docker exec -it cni-suitecrm-app php -i | grep -E "memory_limit|upload_max_filesize|post_max_size|max_execution_time|max_input_time|date.timezone"
```

En CLI, `memory_limit`, `upload_max_filesize`, `post_max_size` y `date.timezone` deben coincidir con la tabla. `max_execution_time` y `max_input_time` solo se validan correctamente bajo Apache (ver nota arriba).

### Warning AH00558 ServerName

**Síntoma:** Al ejecutar `apache2ctl -S` o revisar logs aparece:

```
AH00558: apache2: Could not reliably determine the server's fully qualified domain name
```

**Explicación:** Apache no tiene un `ServerName` global definido. Al iniciar el contenedor, el `command` de `docker-compose.suitecrm.yml` genera `/etc/apache2/conf-available/servername.conf` con el valor de `SUITECRM_DOMAIN` desde `.env` y lo habilita con `a2enconf servername`.

**Solución:** Verificar que `.env` tenga `SUITECRM_DOMAIN` (ej. `crm.localhost`) y reiniciar:

```bash
docker compose -f docker-compose.suitecrm.yml restart suitecrm-app
docker exec -it cni-suitecrm-app apache2ctl -S
```

El warning AH00558 no debe aparecer tras el reinicio.

### Carpeta `suitecrm/` vacía

**Síntoma:** `check-suitecrm-files.sh` falla; Apache muestra listado de directorio o 403.

**Solución:** Descomprimir el código SuiteCRM en `crm/suitecrm/`. Ver estructura esperada arriba.

### `public/index.php` no existe

**Síntoma:** Check falla; URL muestra error o directorio incorrecto.

**Solución:** Revisar un nivel de carpetas al descomprimir. Debe existir `crm/suitecrm/public/index.php`.

### Permisos

**Síntoma:** SuiteCRM no puede escribir en `cache/`, `logs/` o `upload/` durante instalación.

**Solución:**

```bash
bash scripts/fix-suitecrm-permissions.sh
```

Reintentar instalador. En producción, asignar owner al usuario del servidor web.

### Base de datos no conecta

**Síntoma:** Instalador no conecta a MariaDB; logs de `suitecrm-db` con errores de auth.

**Solución:**

- Verificar `.env`: `SUITECRM_DB_NAME`, `SUITECRM_DB_USER`, `SUITECRM_DB_PASSWORD`
- Host desde el contenedor app: **`suitecrm-db`** (nombre del servicio en compose)
- Puerto interno: **3306** (no `SUITECRM_DB_PORT`, que es solo el mapeo al host)
- Esperar healthcheck de MariaDB: `docker compose ... ps`

### Puerto 8085 ocupado

**Síntoma:** `docker compose up` falla al bind del puerto.

**Solución:** Cambiar `SUITECRM_PORT` en `.env` (ej. `8086`) y reiniciar:

```bash
docker compose -f docker-compose.suitecrm.yml down
docker compose -f docker-compose.suitecrm.yml up -d
```

## Referencias

- [01-suitecrm-setup.md](01-suitecrm-setup.md)
- [02-suitecrm-modules-cni.md](02-suitecrm-modules-cni.md)
- [03-suitecrm-integration-flow.md](03-suitecrm-integration-flow.md)
- [../README.md](../README.md)
