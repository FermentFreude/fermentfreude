#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# sync-prod-to-staging.sh — Copy production content → staging for local parity
#
# Use when localhost should match https://www.fermentfreude.at (production admin
# is the source of truth for home + legacy workshop pages).
#
# WHAT THIS CHANGES IN STAGING:
#   1. pages  — upsert by slug: home, workshops, lakto-gemuese, tempeh, kombucha
#   2. media  — upsert all production media docs (additive, never deletes staging-only)
#   3. R2     — copy production media files → staging bucket (additive, no deletes)
#
# WHAT IS NOT TOUCHED:
#   orders, users, bookings, appointments, products (except via separate promote)
#
# PREREQUISITES:
#   1. .env already has staging DATABASE_URL + R2_BUCKET (normal local dev)
#   2. Add production read credentials to .env:
#        PROD_DATABASE_URL=mongodb+srv://.../fermentfreude?...
#        PROD_R2_BUCKET=fermentfreude-media
#   3. rclone: r2-staging + r2-prod remotes in ~/.config/rclone/rclone.conf
#   4. brew install mongodb-database-tools
#
# USAGE:
#   pnpm sync-prod             — run sync (asks for confirmation)
#   pnpm sync-prod --dry-run   — preview only
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TMPDIR_WORK="/tmp/ff-sync-prod-$$"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

DRY_RUN=false
for arg in "$@"; do [[ "$arg" == "--dry-run" ]] && DRY_RUN=true; done

PAGE_SLUGS=(home workshops lakto-gemuese tempeh kombucha)

# ── Load .env ────────────────────────────────────────────────────────────────
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

missing=()
[[ -z "${DATABASE_URL:-}" ]]       && missing+=("DATABASE_URL (staging — normal .env)")
[[ -z "${PROD_DATABASE_URL:-}" ]]  && missing+=("PROD_DATABASE_URL — production MongoDB URI")
[[ -z "${PROD_R2_BUCKET:-}" ]]     && missing+=("PROD_R2_BUCKET — e.g. fermentfreude-media")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo -e "${RED}❌  Missing env vars in .env:${NC}"
  for v in "${missing[@]}"; do echo "   • $v"; done
  exit 1
fi

for tool in mongoexport mongoimport rclone; do
  if ! command -v "$tool" &>/dev/null; then
    echo -e "${RED}❌  '$tool' not found.${NC}"
    exit 1
  fi
done

STAGING_URI="$DATABASE_URL"
PROD_URI="$PROD_DATABASE_URL"
STAGING_DB=$(echo "$STAGING_URI" | sed 's|.*\/||' | sed 's|\?.*||')
PROD_DB=$(echo "$PROD_URI"       | sed 's|.*\/||' | sed 's|\?.*||')
STAGING_R2_REMOTE="${STAGING_R2_REMOTE:-r2-staging}"
PROD_R2_REMOTE="${PROD_R2_REMOTE:-r2-prod}"
STAGING_R2_BUCKET="${R2_BUCKET:-fermentfreude-media-staging}"

if [[ "$PROD_DB" == *"staging"* ]]; then
  echo -e "${RED}❌  PROD_DATABASE_URL contains 'staging' — check your .env${NC}"
  exit 1
fi
if [[ "$STAGING_DB" != *"staging"* ]]; then
  echo -e "${RED}❌  DATABASE_URL does not look like staging ($STAGING_DB)${NC}"
  echo "   Refusing to overwrite production. Point DATABASE_URL to fermentfreude-staging."
  exit 1
fi

# Build MongoDB query for page slugs
SLUG_JSON=$(printf '"%s",' "${PAGE_SLUGS[@]}" | sed 's/,$//')
PAGE_QUERY="{\"slug\":{\"\$in\":[${SLUG_JSON}]}}"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FermentFreude — Sync Production → Staging                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Source prod    : ${YELLOW}$PROD_DB${NC}"
echo -e "  Target staging : ${GREEN}$STAGING_DB${NC}"
echo ""
echo -e "  Pages (upsert by slug): ${PAGE_SLUGS[*]}"
echo -e "  Media: full collection upsert + R2 copy (additive)"
echo ""

if $DRY_RUN; then
  echo -e "${YELLOW}━━━ DRY RUN — no writes ━━━${NC}"
else
  echo -ne "${YELLOW}Type 'yes' to overwrite staging pages + upsert prod media: ${NC}"
  read -r confirm
  [[ "$confirm" == "yes" ]] || { echo "Aborted."; exit 0; }
fi

echo ""
mkdir -p "$TMPDIR_WORK"
trap 'rm -rf "$TMPDIR_WORK"' EXIT

run() {
  if $DRY_RUN; then
    echo -e "  ${CYAN}[dry-run]${NC} $*"
  else
    "$@"
  fi
}

# ── Step 1: Export from production ───────────────────────────────────────────
echo -e "${CYAN}▶ Step 1/3  Export from production ($PROD_DB)...${NC}"

run mongoexport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=pages \
  --query="$PAGE_QUERY" \
  --out="$TMPDIR_WORK/pages.json" --quiet

run mongoexport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=media \
  --out="$TMPDIR_WORK/media.json" --quiet

if ! $DRY_RUN; then
  echo "  ✔ pages: $(wc -l < "$TMPDIR_WORK/pages.json" | tr -d ' ') docs"
  echo "  ✔ media: $(wc -l < "$TMPDIR_WORK/media.json" | tr -d ' ') docs"
fi

# ── Step 2: R2 prod → staging (additive) ─────────────────────────────────────
echo ""
echo -e "${CYAN}▶ Step 2/3  R2 copy: production → staging (no deletes)...${NC}"

run rclone copy \
  "${PROD_R2_REMOTE}:${PROD_R2_BUCKET}/media/" \
  "${STAGING_R2_REMOTE}:${STAGING_R2_BUCKET}/media/" \
  --progress

echo "  ✔ R2 media copied."

# ── Step 3: Import into staging DB ───────────────────────────────────────────
echo ""
echo -e "${CYAN}▶ Step 3/3  Import into staging ($STAGING_DB)...${NC}"

run mongoimport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=media \
  --mode=upsert --file="$TMPDIR_WORK/media.json" --quiet
echo "  ✔ media upserted"

run mongoimport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=pages \
  --mode=upsert --upsertFields=slug \
  --file="$TMPDIR_WORK/pages.json" --quiet
echo "  ✔ pages upserted (home + workshops + lakto + tempeh + kombucha)"

echo ""
if $DRY_RUN; then
  echo -e "${YELLOW}DRY RUN complete.${NC}"
else
  echo -e "${GREEN}✅  Sync complete!${NC}"
  echo ""
  echo "  Restart dev server and hard-refresh:"
  echo "    pnpm dev  →  http://localhost:3000"
  echo "    http://localhost:3000/workshops/tempeh"
  echo ""
  echo -e "  ${YELLOW}.env still points to staging — no change needed.${NC}"
fi
