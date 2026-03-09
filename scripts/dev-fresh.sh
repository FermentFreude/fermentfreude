#!/bin/bash
# Fresh dev start - clears cache, kills old servers, restarts
# Run: ./scripts/dev-fresh.sh

cd "$(dirname "$0")/.."

echo "Stopping any running dev servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "Clearing .next cache..."
rm -rf .next

echo "Starting dev server..."
echo ""
echo ">>> Open http://localhost:3000/fermentation in your browser <<<"
echo ">>> Use Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to HARD REFRESH <<<"
echo ""

pnpm dev
