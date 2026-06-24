#!/usr/bin/env bash
# Run the desktop app (Tauri dev mode) from the repo root.
#
# Equivalent to: pnpm desktop:dev
#
# What it does:
#   1. Regenerates the tutorial manifest from public/tutorials/
#   2. Starts `tauri dev` which:
#        - Runs the Next.js dev server on http://localhost:5001
#        - Compiles the Rust backend (src-tauri/) — first build ~1-3 min
#        - Opens a native Tauri window pointing at the dev server
#
# Logs:
#   - Rust eprintln! / panic output  -> stdout of this script
#   - Frontend console.log           -> DevTools inside the Tauri window (F12)
#
# Usage (from the repo root):
#   bash scripts/run-desktop.sh
#   # or, if executable:
#   ./scripts/run-desktop.sh

set -e

# Resolve the desktop app directory from this script's location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DESKTOP_DIR="$REPO_ROOT/playground/apps/desktop"

if [ ! -d "$DESKTOP_DIR" ]; then
  echo "[x] Desktop app not found at: $DESKTOP_DIR" >&2
  exit 1
fi

if [ ! -d "$DESKTOP_DIR/node_modules/.bin" ] || [ ! -x "$DESKTOP_DIR/node_modules/.bin/tauri" ]; then
  echo "[x] Tauri CLI not installed. Run 'pnpm install' at the repo root first." >&2
  exit 1
fi

# (1) Regenerate the tutorial manifest so newly added MDX files are picked up.
echo "[1/2] Regenerating tutorial manifest..."
node "$DESKTOP_DIR/scripts/generate-tutorials-manifest.mjs"

# (2) Hand off to `tauri dev` with stdio passed through.
echo "[2/2] Starting Tauri dev mode (Ctrl+C to stop)..."
cd "$DESKTOP_DIR"
exec ./node_modules/.bin/tauri dev
