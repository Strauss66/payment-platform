#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Building frontend…"
cd "$ROOT_DIR/frontend"
npm install
npm run build

echo "==> Installing backend dependencies…"
cd "$ROOT_DIR/backend"
npm install

if npm run | grep -q " build"; then
  echo "==> Building backend…"
  npm run build
else
  echo "==> Backend has no build step; skipping."
fi

echo "==> Done."


