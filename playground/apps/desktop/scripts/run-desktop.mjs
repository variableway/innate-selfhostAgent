#!/usr/bin/env node
/**
 * Run the desktop app (Tauri dev mode).
 *
 * Equivalent to: pnpm tauri dev
 *
 * What it does:
 *   1. Regenerates the tutorial manifest from public/tutorials/ (same as pnpm predev)
 *   2. Invokes the Tauri CLI in dev mode, which:
 *        - Starts the Next.js dev server on http://localhost:5001
 *        - Compiles the Rust backend in src-tauri/ (first build ~1-3 min)
 *        - Opens a native Tauri window pointing at the dev server
 *
 * Logs:
 *   - Rust eprintln! / panic output -> stdout of this script
 *   - Frontend console.log         -> DevTools inside the Tauri window (F12)
 *
 * Usage:
 *   node scripts/run-desktop.mjs
 *   (or: pnpm tauri dev   for the same result)
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const tauriBin = join(projectRoot, 'node_modules', '.bin', 'tauri' + (process.platform === 'win32' ? '.cmd' : ''));

// Sanity checks with friendly errors
function fail(msg) {
  console.error(`\n[x] ${msg}\n`);
  process.exit(1);
}

if (!existsSync(join(projectRoot, 'package.json'))) {
  fail(`package.json not found at ${projectRoot}. Run from inside apps/desktop.`);
}
if (!existsSync(tauriBin)) {
  fail(
    `Tauri CLI not installed. Run "pnpm install" at the repo root first.\n` +
    `Looked for: ${tauriBin}`
  );
}

// (1) Regenerate the tutorial manifest so newly added MDX files are picked up.
console.log('[1/2] Regenerating tutorial manifest...');
const manifest = spawn(
  process.execPath,
  [join(projectRoot, 'scripts', 'generate-tutorials-manifest.mjs')],
  { stdio: 'inherit', cwd: projectRoot }
);
manifest.on('exit', (code) => {
  if (code !== 0) fail(`manifest generation exited with code ${code}`);

  // (2) Hand off to `tauri dev` with the same stdio so all logs flow through.
  console.log('[2/2] Starting Tauri dev mode (Ctrl+C to stop)...\n');
  const tauri = spawn(tauriBin, ['dev'], { stdio: 'inherit', cwd: projectRoot });

  const shutdown = (sig) => { try { tauri.kill(sig); } catch {} };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  tauri.on('exit', (tcode, tsig) => {
    if (tsig) process.kill(process.pid, tsig);
    process.exit(tcode ?? 0);
  });
});
