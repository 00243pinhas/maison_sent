#!/bin/sh
set -e

echo "→ Running database migrations..."
npm run migration:run:prod

echo "→ Starting Maison Sent API..."
exec node dist/main
