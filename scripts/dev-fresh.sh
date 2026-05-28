#!/usr/bin/env sh
# Stop stale Next dev servers and clear corrupted webpack cache.
set -e
cd "$(dirname "$0")/.."

echo "Stopping dev servers on ports 3000–3002…"
for port in 3000 3001 3002; do
  lsof -ti:"$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
done

echo "Removing .next cache…"
rm -rf .next

echo "Starting Next.js dev server…"
exec npm run dev
