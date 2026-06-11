#!/usr/bin/env bash
# Register SIGI CNI custom fields in SuiteCRM fields_meta_data so Studio lists them.
# Complements apply-sigi-cni-suitecrm-customizations.sh (Extension vardefs/labels).
# Run from crm/: bash scripts/register-sigi-cni-fields-metadata.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${CRM_DIR}"

require_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -Fxq "${name}"; then
    echo "Error: container '${name}' is not running."
    echo "Start the stack from crm/:"
    echo "  docker compose -f docker-compose.suitecrm.yml up -d"
    exit 1
  fi
}

require_container "cni-suitecrm-db"
require_container "cni-suitecrm-app"

if [[ ! -f "${CRM_DIR}/.env" ]]; then
  echo "Error: ${CRM_DIR}/.env not found."
  echo "Copy .env.example to .env and configure database credentials."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "${CRM_DIR}/.env"
set +a

for var in SUITECRM_DB_NAME SUITECRM_DB_USER SUITECRM_DB_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "Error: ${var} is not set in .env"
    exit 1
  fi
done

mysql_exec() {
  docker exec -i cni-suitecrm-db \
    mariadb -u"${SUITECRM_DB_USER}" -p"${SUITECRM_DB_PASSWORD}" "${SUITECRM_DB_NAME}" "$@"
}

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

register_field() {
  local module="$1"
  local name="$2"
  local vname="$3"
  local type="$4"
  local len="${5:-}"
  local ext1="${6:-}"
  local default_value="${7:-}"

  local stable_id="${module}_${name}"
  local existing_id
  existing_id="$(mysql_exec -N -e \
    "SELECT id FROM fields_meta_data WHERE custom_module='$(sql_escape "${module}")' AND name='$(sql_escape "${name}")' AND deleted=0 LIMIT 1;" \
    2>/dev/null || true)"

  local record_id="${stable_id}"
  if [[ -n "${existing_id}" ]]; then
    record_id="${existing_id}"
  fi

  local len_sql="NULL"
  if [[ -n "${len}" ]]; then
    len_sql="${len}"
  fi

  local ext1_sql="NULL"
  if [[ -n "${ext1}" ]]; then
    ext1_sql="'$(sql_escape "${ext1}")'"
  fi

  local default_sql="NULL"
  if [[ -n "${default_value}" ]]; then
    default_sql="'$(sql_escape "${default_value}")'"
  fi

  mysql_exec <<SQL
INSERT INTO fields_meta_data (
  id,
  name,
  vname,
  custom_module,
  type,
  len,
  required,
  default_value,
  date_modified,
  deleted,
  audited,
  massupdate,
  reportable,
  importable,
  ext1
) VALUES (
  '$(sql_escape "${record_id}")',
  '$(sql_escape "${name}")',
  '$(sql_escape "${vname}")',
  '$(sql_escape "${module}")',
  '$(sql_escape "${type}")',
  ${len_sql},
  0,
  ${default_sql},
  NOW(),
  0,
  1,
  0,
  1,
  'true',
  ${ext1_sql}
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  vname = VALUES(vname),
  custom_module = VALUES(custom_module),
  type = VALUES(type),
  len = VALUES(len),
  required = VALUES(required),
  default_value = VALUES(default_value),
  date_modified = NOW(),
  deleted = 0,
  audited = VALUES(audited),
  massupdate = VALUES(massupdate),
  reportable = VALUES(reportable),
  importable = VALUES(importable),
  ext1 = VALUES(ext1);
SQL

  echo "[OK] ${module}.${name} (id: ${record_id})"
}

echo "Registering SIGI CNI fields in fields_meta_data ..."
echo "Database: ${SUITECRM_DB_NAME} @ cni-suitecrm-db"
echo "---"

# Accounts
register_field Accounts estado_ciclo_vida_c LBL_ESTADO_CICLO_VIDA enum 100 estado_ciclo_vida_list
register_field Accounts sector_economico_c LBL_SECTOR_ECONOMICO enum 100 sector_economico_cni_list
register_field Accounts pais_origen_c LBL_PAIS_ORIGEN varchar 120
register_field Accounts cliente_objetivo_c LBL_CLIENTE_OBJETIVO bool 1 "" 0
register_field Accounts tipo_entidad_c LBL_TIPO_ENTIDAD varchar 100
register_field Accounts fuente_contacto_c LBL_FUENTE_CONTACTO enum 100 fuente_contacto_cni_list
register_field Accounts monto_potencial_c LBL_MONTO_POTENCIAL currency
register_field Accounts empleos_potenciales_c LBL_EMPLEOS_POTENCIALES int
register_field Accounts fecha_primer_contacto_c LBL_FECHA_PRIMER_CONTACTO date
register_field Accounts ultima_interaccion_c LBL_ULTIMA_INTERACCION datetime

# Contacts
register_field Contacts estado_lead_c LBL_ESTADO_LEAD enum 100 estado_lead_cni_list
register_field Contacts idioma_preferido_c LBL_IDIOMA_PREFERIDO enum 100 idioma_preferido_cni_list
register_field Contacts sector_interes_c LBL_SECTOR_INTERES enum 100 sector_economico_cni_list
register_field Contacts fuente_entrada_c LBL_FUENTE_ENTRADA enum 100 fuente_contacto_cni_list
register_field Contacts consentimiento_comunicaciones_c LBL_CONSENTIMIENTO_COMUNICACIONES bool 1 "" 0
register_field Contacts cargo_institucional_c LBL_CARGO_INSTITUCIONAL varchar 150
register_field Contacts pais_contacto_c LBL_PAIS_CONTACTO varchar 120

# Opportunities
register_field Opportunities sector_c LBL_SECTOR enum 100 sector_economico_cni_list
register_field Opportunities monto_inversion_c LBL_MONTO_INVERSION currency
register_field Opportunities empleos_estimados_c LBL_EMPLEOS_ESTIMADOS int
register_field Opportunities departamento_c LBL_DEPARTAMENTO varchar 150
register_field Opportunities municipio_c LBL_MUNICIPIO varchar 150
register_field Opportunities fecha_anuncio_c LBL_FECHA_ANUNCIO date
register_field Opportunities fecha_inicio_estimada_c LBL_FECHA_INICIO_ESTIMADA date
register_field Opportunities fecha_finalizacion_estimada_c LBL_FECHA_FINALIZACION_ESTIMADA date
register_field Opportunities obstaculos_identificados_c LBL_OBSTACULOS_IDENTIFICADOS text
register_field Opportunities instituciones_involucradas_c LBL_INSTITUCIONES_INVOLUCRADAS text
register_field Opportunities prioridad_c LBL_PRIORIDAD enum 100 prioridad_cni_list
register_field Opportunities tipo_inversion_c LBL_TIPO_INVERSION enum 100 tipo_inversion_cni_list
register_field Opportunities estado_proyecto_c LBL_ESTADO_PROYECTO enum 100 estado_proyecto_cni_list
register_field Opportunities django_submission_id_c LBL_DJANGO_SUBMISSION_ID varchar 120
register_field Opportunities webhook_event_id_c LBL_WEBHOOK_EVENT_ID varchar 120

# Leads
register_field Leads sector_interes_c LBL_SECTOR_INTERES enum 100 sector_economico_cni_list
register_field Leads fuente_entrada_c LBL_FUENTE_ENTRADA enum 100 fuente_contacto_cni_list
register_field Leads pais_contacto_c LBL_PAIS_CONTACTO varchar 120
register_field Leads consentimiento_comunicaciones_c LBL_CONSENTIMIENTO_COMUNICACIONES bool 1 "" 0
register_field Leads django_submission_id_c LBL_DJANGO_SUBMISSION_ID varchar 120
register_field Leads webhook_event_id_c LBL_WEBHOOK_EVENT_ID varchar 120

echo "---"
echo "Campos registrados en fields_meta_data."
echo ""
echo "Ahora ejecutar en SuiteCRM:"
echo "  Admin → Repair → Quick Repair and Rebuild"
echo "Ejecutar SQL sugerido para crear columnas *_cstm si SuiteCRM lo muestra en esa pantalla."
