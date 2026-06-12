#!/usr/bin/env bash
# Unlock SuiteCRM custom/ for the local user (before SIGI CNI customization scripts).
# Run from crm/: bash scripts/dev-unlock-suitecrm-custom.sh
# Or from anywhere: bash crm/scripts/dev-unlock-suitecrm-custom.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CUSTOM_DIR="${CRM_DIR}/suitecrm/public/legacy/custom"

if [[ ! -d "${CUSTOM_DIR}" ]]; then
  echo "SuiteCRM custom path not found. Install SuiteCRM under crm/suitecrm/ first."
  echo "  Expected: ${CUSTOM_DIR}"
  exit 1
fi

sudo chown -R "${USER}:${USER}" "${CUSTOM_DIR}"

find "${CUSTOM_DIR}" -type d -exec chmod 775 {} \;
find "${CUSTOM_DIR}" -type f -exec chmod 664 {} \;

echo ""
echo "SuiteCRM custom unlocked for local development."
echo "Now you can run SIGI CNI customization scripts."
