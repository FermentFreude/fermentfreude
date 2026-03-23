#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# promote-to-prod.sh — Surgical sync of staging changes to production
#
# WHAT THIS CHANGES IN PRODUCTION:
#   1. media      — upsert (adds staging media, never deletes production-only)
#   2. products   — upsert (adds/updates, never deletes)
#   3. categories — upsert (adds/updates, never deletes)
#   4. pages slug:shop ONLY — full replace (you confirmed this is OK)
#   5. Cloudflare R2: staging media files copied to production (additive)
#
# WHAT IS NEVER TOUCHED:
#   home, about, workshops, gastronomy, voucher, posts — all other pages
#   orders, users, bookings, enrollments — all other collections
#
# PREREQUISITES (one-time setup):
#   1. Add to your .env:
#        PROD_DATABASE_URL=mongodb+srv://...fermentfreude?...
#        PROD_R2_BUCKET=fermentfreude-media
#        PROD_R2_PUBLIC_URL=https://pub-c70f47169a...r2.dev
#   2. rclone configured: ~/.config/rclone/rclone.conf with r2-staging + r2-prod
#   3. brew install mongodb-database-tools
#
# USAGE:
#   pnpm promote             — runs everything (asks for confirmation)
#   pnpm promote --dry-run   — shows what WOULD happen, writes nothing
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TMPDIR_WORK="/tmp/ff-promote-$$"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

DRY_RUN=false
for arg in "$@"; do [[ "$arg" == "--dry-run" ]] && DRY_RUN=true; done

# ── Load .env (safe, no xargs) ───────────────────────────────────────────────
if [[ -f "$ROOT/.env" ]]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    if [[ "$line" == *=* ]]; then
      key="${line%%=*}"
      val="${line#*=}"
      val="${val%\"}" ; val="${val#\"}"
      val="${val%\'}" ; val="${val#\'}"
      # Only set if not already set by caller
      [[ -z "${!key+x}" ]] && export "$key=$val" 2>/dev/null || true
    fi
  done < "$ROOT/.env"
fi

# ── Required vars ────────────────────────────────────────────────────────────
missing=()
[[ -z "${DATABASE_URL:-}" ]]       && missing+=("DATABASE_URL (staging URI, already in .env)")
[[ -z "${PROD_DATABASE_URL:-}" ]]  && missing+=("PROD_DATABASE_URL — production MongoDB URI")
[[ -z "${PROD_R2_BUCKET:-}" ]]     && missing+=("PROD_R2_BUCKET — e.g. fermentfreude-media")
[[ -z "${PROD_R2_PUBLIC_URL:-}" ]] && missing+=("PROD_R2_PUBLIC_URL — production CDN URL")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo -e "${RED}❌  Missing env vars in .env:${NC}"
  for v in "${missing[@]}"; do echo "   • $v"; done
  echo ""
  echo "Add them to .env and re-run."
  exit 1
fi

# ── Check required tools ─────────────────────────────────────────────────────
for tool in mongoexport mongoimport rclone; do
  if ! command -v "$tool" &>/dev/null; then
    echo -e "${RED}❌  '$tool' not found.${NC}"
    case "$tool" in
      mongoexport|mongoimport) echo "   Install: brew install mongodb-database-tools" ;;
      rclone) echo "   Install: brew install rclone" ;;
    esac
    exit 1
  fi
done

# ── Extract DB names from URIs ───────────────────────────────────────────────
STAGING_URI="$DATABASE_URL"
PROD_URI="$PROD_DATABASE_URL"
STAGING_DB=$(echo "$STAGING_URI" | sed 's|.*\/||' | sed 's|\?.*||')
PROD_DB=$(echo "$PROD_URI"       | sed 's|.*\/||' | sed 's|\?.*||')
STAGING_R2_REMOTE="${STAGING_R2_REMOTE:-r2-staging}"
PROD_R2_REMOTE="${PROD_R2_REMOTE:-r2-prod}"
STAGING_R2_BUCKET="${R2_BUCKET:-fermentfreude-media-staging}"

# ── Safety checks ────────────────────────────────────────────────────────────
if [[ "$PROD_DB" == *"staging"* ]]; then
  echo -e "${RED}❌  PROD_DATABASE_URL contains 'staging' — check your .env${NC}"
  exit 1
fi
if [[ "$STAGING_DB" == "$PROD_DB" ]]; then
  echo -e "${RED}❌  DATABASE_URL and PROD_DATABASE_URL point to the same DB: $STAGING_DB${NC}"
  exit 1
fi

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  FermentFreude — Promote Staging → Production                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Source staging : ${YELLOW}$STAGING_DB${NC}"
echo -e "  Target prod    : ${RED}$PROD_DB${NC}"
echo ""
echo -e "  ${GREEN}UPSERT (adds/updates, NEVER deletes):${NC}"
echo    "    • media collection + R2 files"
echo    "    • products collection"
echo    "    • categories collection"
echo ""
echo -e "  ${YELLOW}REPLACE (full content replacement):${NC}"
echo    "    • pages → slug:shop  (all other pages left completely untouched)"
echo ""
echo -e "  ${GREEN}NOT TOUCHED:${NC} home, about, workshops, voucher, posts + all other pages"
echo    "              orders, users, bookings, enrollments + all other collections"
echo ""

if $DRY_RUN; then
  echo -e "${YELLOW}━━━ DRY RUN MODE — no writes ━━━${NC}"
  echo ""
else
  echo -ne "${RED}⚠️   Type 'yes' to write to PRODUCTION: ${NC}"
  read -r confirm
  if [[ "$confirm" != "yes" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
mkdir -p "$TMPDIR_WORK"
trap 'rm -rf "$TMPDIR_WORK"' EXIT

# Helper: either run the command, or echo it in dry-run mode
run() {
  if $DRY_RUN; then
    echo -e "  ${CYAN}[dry-run]${NC} $*"
  else
    "$@"
  fi
}

# ════════════════════════════════════════════════════════════════════════════
# STEP 1 — Export from staging DB
# ════════════════════════════════════════════════════════════════════════════
echo -e "${CYAN}▶ Step 1/4  Exporting from staging ($STAGING_DB)...${NC}"

run mongoexport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=media \
  --out="$TMPDIR_WORK/media.json" --quiet

run mongoexport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=products \
  --out="$TMPDIR_WORK/products.json" --quiet

run mongoexport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=categories \
  --out="$TMPDIR_WORK/categories.json" --quiet

# Pages: export ONLY the shop document (query by slug)
run mongoexport \
  --uri="$STAGING_URI" --db="$STAGING_DB" --collection=pages \
  '--query={"slug":"shop"}' \
  --out="$TMPDIR_WORK/page-shop.json" --quiet

if ! $DRY_RUN; then
  echo "  ✔ media:      $(wc -l < "$TMPDIR_WORK/media.json" | tr -d ' ') docs"
  echo "  ✔ products:   $(wc -l < "$TMPDIR_WORK/products.json" | tr -d ' ') docs"
  echo "  ✔ categories: $(wc -l < "$TMPDIR_WORK/categories.json" | tr -d ' ') docs"
  echo "  ✔ shop page:  $(wc -l < "$TMPDIR_WORK/page-shop.json" | tr -d ' ') doc"
fi

# ════════════════════════════════════════════════════════════════════════════
# STEP 2 — Sync R2 media files (staging → production, additive)
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}▶ Step 2/4  Copying R2 files: staging → production (no deletes)...${NC}"

run rclone copy \
  "${STAGING_R2_REMOTE}:${STAGING_R2_BUCKET}/media/" \
  "${PROD_R2_REMOTE}:${PROD_R2_BUCKET}/media/" \
  --progress

echo "  ✔ R2 files copied."

# ════════════════════════════════════════════════════════════════════════════
# STEP 3 — Import into production DB
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}▶ Step 3/4  Importing into production ($PROD_DB)...${NC}"

run mongoimport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=media \
  --mode=upsert --file="$TMPDIR_WORK/media.json" --quiet
echo "  ✔ media (upsert by _id)"

run mongoimport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=products \
  --mode=upsert --file="$TMPDIR_WORK/products.json" --quiet
echo "  ✔ products (upsert by _id)"

run mongoimport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=categories \
  --mode=upsert --file="$TMPDIR_WORK/categories.json" --quiet
echo "  ✔ categories (upsert by _id)"

# Shop page: upsert by SLUG so it correctly replaces even if prod _id differs
run mongoimport \
  --uri="$PROD_URI" --db="$PROD_DB" --collection=pages \
  --mode=upsert --upsertFields=slug \
  --file="$TMPDIR_WORK/page-shop.json" --quiet
echo "  ✔ shop page (upsert by slug — full content replaced)"

# ════════════════════════════════════════════════════════════════════════════
# STEP 4 — Done
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}▶ Step 4/4  Done.${NC}"
echo ""

if $DRY_RUN; then
  echo -e "${YELLOW}DRY RUN complete — nothing was written.${NC}"
  echo "Remove --dry-run to run for real."
else
  echo -e "${GREEN}✅  Promotion complete!${NC}"
  echo ""
  echo "  Changed in production:"
  echo "    • media: staging docs upserted + R2 files copied"
  echo "    • products: upserted from staging"
  echo "    • categories: upserted from staging"
  echo "    • shop page: replaced with staging version"
  echo ""
  echo "  NOT touched:"
  echo "    • all other pages (home, about, workshops, gastronomy, voucher...)"
  echo "    • all other collections (orders, users, bookings...)"
  echo "    • production-only content of any kind (upsert never deletes)"
  echo ""
  echo -e "  ${YELLOW}Your .env still points to staging — no changes needed there.${NC}"
fi
