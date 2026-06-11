#!/usr/bin/env bash
# Apply orientative filesystem permissions for local SuiteCRM on Linux/WSL.
# Run from crm/: bash scripts/fix-suitecrm-permissions.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${CRM_DIR}"

if [[ ! -d "suitecrm" ]]; then
  echo "Error: crm/suitecrm/ does not exist. Copy SuiteCRM source first."
  exit 1
fi

echo "Applying orientative permissions under crm/suitecrm/ ..."
echo ""

chmod -R 755 suitecrm

if [[ -d "suitecrm/public" ]]; then
  chmod -R 775 suitecrm/public
  echo "[OK] suitecrm/public"
fi

for dir in cache logs upload; do
  if [[ -d "suitecrm/${dir}" ]]; then
    chmod -R 775 "suitecrm/${dir}"
    echo "[OK] suitecrm/${dir}"
  else
    echo "[SKIP] suitecrm/${dir} (not present yet)"
  fi
done

echo ""
echo "Done."
echo ""
echo "WARNING: These permissions are for local development only."
echo "In production, set ownership and modes to match the real web server user"
echo "(e.g. www-data) instead of broad 775 on writable directories."
