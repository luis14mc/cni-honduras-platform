#!/usr/bin/env bash
# Validate local SuiteCRM prerequisites before docker compose up.
# Run from anywhere: ./scripts/check-suitecrm-files.sh
# Or from crm/: bash scripts/check-suitecrm-files.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRM_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${CRM_DIR}"

errors=0

check_path() {
  local label="$1"
  local path="$2"
  if [[ -e "${path}" ]]; then
    echo "[OK]   ${label}: ${path}"
  else
    echo "[FAIL] ${label}: ${path} (missing)"
    errors=$((errors + 1))
  fi
}

echo "SuiteCRM local file check (crm dir: ${CRM_DIR})"
echo "---"

check_path "SuiteCRM directory" "suitecrm"
check_path "SuiteCRM entrypoint" "suitecrm/public/index.php"
check_path "Environment file" ".env"
check_path "Docker Compose file" "docker-compose.suitecrm.yml"

echo "---"
if [[ "${errors}" -eq 0 ]]; then
  echo "All checks passed."
  exit 0
fi

echo "${errors} check(s) failed."
echo ""
echo "Next steps:"
echo "  1. Copy downloaded SuiteCRM into crm/suitecrm/"
echo "  2. cp .env.example .env"
echo "  3. See docs/04-suitecrm-local-validation.md"
exit 1
