#!/usr/bin/env bash
# Lock SuiteCRM custom/ back to www-data inside the container (after customization scripts).
# Run from crm/: bash scripts/dev-lock-suitecrm-custom.sh
# Or from anywhere: bash crm/scripts/dev-lock-suitecrm-custom.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTAINER="cni-suitecrm-app"
CUSTOM_PATH="/var/www/html/public/legacy/custom"

if ! docker ps --format '{{.Names}}' | grep -Fxq "${CONTAINER}"; then
  echo "Error: ${CONTAINER} is not running."
  echo "Start it with:"
  echo "  docker compose -f docker-compose.suitecrm.yml up -d"
  exit 1
fi

docker exec "${CONTAINER}" bash -c "
  chown -R www-data:www-data '${CUSTOM_PATH}'
  find '${CUSTOM_PATH}' -type d -exec chmod 775 {} \;
  find '${CUSTOM_PATH}' -type f -exec chmod 664 {} \;
"

echo ""
echo "SuiteCRM custom locked back to www-data."
echo "Now run Admin → Repair → Quick Repair and Rebuild."
