#!/usr/bin/env bash
# One-shot starter for the RMS app (backend + frontend) in this repo.
# Prereqs: Node.js (LTS), PostgreSQL reachable at DATABASE_URL in backend/.env.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

ensure_env() {
  local dir="$1"
  if [ ! -f "$dir/.env" ] && [ -f "$dir/.env.example" ]; then
    cp "$dir/.env.example" "$dir/.env"
    echo "Copied $dir/.env.example to $dir/.env (adjust values as needed)."
  fi
}

echo ">> Ensuring .env files..."
ensure_env "$ROOT/backend"
ensure_env "$ROOT/frontend"

echo ">> Installing backend dependencies (if needed)..."
if [ ! -d "$ROOT/backend/node_modules" ]; then
  (cd "$ROOT/backend" && npm install)
fi

echo ">> Installing frontend dependencies (if needed)..."
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  (cd "$ROOT/frontend" && npm install)
fi

echo ">> Generating Prisma client..."
(cd "$ROOT/backend" && npx prisma generate)

start_backend() {
  echo ">> Starting backend (port ${PORT:-4000})..."
  (cd "$ROOT/backend" && npm run dev)
}

start_frontend() {
  echo ">> Starting frontend (port 5173)..."
  (cd "$ROOT/frontend" && npm run dev)
}

start_backend &
BACK_PID=$!
start_frontend &
FRONT_PID=$!

trap 'echo "Stopping..."; kill $BACK_PID $FRONT_PID 2>/dev/null || true' EXIT

wait
