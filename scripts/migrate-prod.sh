#!/usr/bin/env bash
# migrate-prod.sh — Run pending migrations against PRODUCTION database.
#
# Uses PROD_DATABASE_URL from .env as DATABASE_URL, so the migration runner
# connects to production without needing to edit .env manually.
#
# Usage:
#   pnpm migrate:prod
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Load .env to get PROD_DATABASE_URL
if [[ -f "$ROOT/.env" ]]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    if [[ "$line" == *=* ]]; then
      key="${line%%=*}"
      val="${line#*=}"
      val="${val%\"}" ; val="${val#\"}"
      val="${val%\'}" ; val="${val#\'}"
      [[ -z "${!key+x}" ]] && export "$key=$val" 2>/dev/null || true
    fi
  done < "$ROOT/.env"
fi

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  echo -e "${RED}❌  PROD_DATABASE_URL is not set in .env${NC}"
  exit 1
fi

PROD_DB=$(echo "$PROD_DATABASE_URL" | sed 's|.*\/||' | sed 's|\?.*||')

if [[ "$PROD_DB" == *"staging"* ]]; then
  echo -e "${RED}❌  PROD_DATABASE_URL contains 'staging' — refusing to run${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠️   Running migrations against PRODUCTION: ${RED}$PROD_DB${NC}"
echo -ne "${YELLOW}    Type 'yes' to continue: ${NC}"
read -r confirm
if [[ "$confirm" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

# Run migrations with DATABASE_URL overridden to production URI
# dotenv in Payload will NOT override already-set process.env vars
echo ""
DATABASE_URL="$PROD_DATABASE_URL" npx tsx "$ROOT/src/scripts/migrations/_run.ts"
