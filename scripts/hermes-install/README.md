# Hermes Agent — One-Stop Installer

A single pair of wrapper scripts that installs [Hermes Agent](https://hermes-agent.nousresearch.com/)
(Nous Research, MIT-licensed) on every platform you care about:

| Platform          | Run with                                                          |
|-------------------|-------------------------------------------------------------------|
| macOS             | `./install.sh` (CLI) · optional DMG from the same script          |
| Linux             | `./install.sh`                                                    |
| WSL2              | `./install.sh` (inside the distro) **or** `install.ps1` on the Windows side |
| Windows (native)  | `install.ps1` from PowerShell                                     |

Both wrappers are thin dispatchers — they detect the platform, verify the
only hard prerequisite (`git`), and forward every flag you pass to the
**official** upstream installer maintained by Nous Research. We do not
fork, patch, or pin a specific version: you always get the latest
release from `hermes-agent.nousresearch.com`.

---

## Quick start

### macOS / Linux / WSL2

```bash
# From a local clone
./scripts/hermes-install/install.sh

# Or pipe straight from this repo (or the upstream URL — both work)
curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash

# Forward any flag the official installer supports
./install.sh --skip-browser --branch main
```

The script will:
1. Refuse to run if it detects Git-Bash / MSYS / Cygwin on Windows.
2. Verify `git` is installed (auto-install via `brew` / `apt` / `dnf` / `pacman` / `apk` if missing).
3. Detect your platform (macOS / Linux / WSL2) and print what it found.
4. Stream the official `https://hermes-agent.nousresearch.com/install.sh` into `bash`, forwarding your flags.
5. On macOS, offer to open the official DMG in your browser for the desktop GUI.

### Windows (native PowerShell)

```powershell
# Default: run the official PowerShell installer
iex (irm https://hermes-agent.nousresearch.com/install.ps1)

# Or, using the wrapper in this repo
.\scripts\hermes-install\install.ps1

# Forward flags
.\install.ps1 -SkipBrowser -Branch main

# Just download the EXE installer (e.g. to install offline / via USB)
.\install.ps1 -DownloadExe
# -> saves to %USERPROFILE%\Downloads\Hermes-Setup.exe
```

If PowerShell is launched *inside* a WSL distribution (`wsl.exe` is on
`PATH` and `WSL_DISTRO_NAME` is set), `install.ps1` delegates to
`install.sh` inside the distro.

---

## What gets installed (and where)

The upstream installer handles everything. You only need `git` and
(outside Windows) a working `curl` or `wget`. Everything else —
Python 3.11, Node 22 LTS, `ripgrep`, `ffmpeg`, the `hermes` Python
package, Playwright/Chromium, and the global `hermes` command — is
provisioned by the installer.

| Installer mode   | Code location                | `hermes` binary         | Data dir    |
|------------------|------------------------------|--------------------------|-------------|
| Per-user (git)   | `~/.hermes/hermes-agent/`    | `~/.local/bin/hermes`    | `~/.hermes/` |
| Root (`sudo …`)  | `/usr/local/lib/hermes-agent/` | `/usr/local/bin/hermes` | `/root/.hermes/` |
| Windows (per-user) | `%LOCALAPPDATA%\hermes\`   | on user `PATH`           | `%LOCALAPPDATA%\hermes\` |
| Windows (EXE)    | system-wide                  | Start menu shortcut      | `%APPDATA%\Hermes\` |

---

## Post-install

Reload your shell (or open a new terminal) and verify:

```bash
source ~/.bashrc   # Linux / WSL2
source ~/.zshrc    # macOS
```

```powershell
# Windows — open a fresh PowerShell window
```

Then:

```bash
hermes doctor              # sanity check
hermes setup --portal      # fastest: Nous Portal + 300+ models + Tool Gateway
hermes model               # pick a different provider (OpenAI / OpenRouter / custom)
hermes tools               # enable/disable tools
hermes gateway setup       # messaging platforms (Telegram, Discord, Slack, WhatsApp)
hermes --tui               # terminal UI
hermes desktop             # (optional) build & install the desktop app
```

---

## Supported flags

Both wrappers forward every argument to the upstream installer, so
anything the official installer accepts is accepted here. Common ones:

| Wrapper flag            | Upstream flag         | Effect                              |
|-------------------------|-----------------------|-------------------------------------|
| `--skip-browser`        | `--skip-browser`      | Skip Playwright/Chromium download   |
| `--no-skills`           | `--no-skills`         | Don't seed bundled skills           |
| `--include-desktop`     | `--include-desktop`   | Build the Electron desktop app      |
| `--branch <name>`       | `--branch <name>`     | Pin to a specific git branch        |
| `--commit <sha>`        | `--commit <sha>`      | Pin to a specific commit            |
| `--dir <path>`          | `--dir <path>`        | Custom install location             |
| `-SkipBrowser` (PS)     | `-SkipBrowser`        | Same as `--skip-browser` on Unix    |
| `-DownloadExe` (PS)     | n/a                   | Just download the EXE, don't run it |

Run the upstream installer with `--help` for the full list:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --help
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `git: command not found` on Linux/macOS | The wrapper auto-installs via your package manager. If that fails, install git manually and re-run. |
| `command not found: hermes` | `source ~/.bashrc` / `~/.zshrc`, or check that `~/.local/bin` is on your `PATH`. |
| Running `install.sh` inside Git-Bash on Windows | Refused by design — use `install.ps1` in PowerShell instead. |
| WSL installer succeeds but `hermes` is missing on Windows side | WSL and Windows are separate environments. Run `install.ps1` on the Windows side to get the desktop app. |
| `API key not set` on first run | `hermes model` or `hermes setup --portal`. |
| `hermes doctor` reports a broken config after an update | `hermes config check` then `hermes config migrate`. |
| Corporate proxy / TLS errors on Playwright download | Re-run with `--skip-browser`, or ask IT for the cert chain. |
| Need to wipe and start over | `rm -rf ~/.hermes` (Unix) or `rmdir /s /q %LOCALAPPDATA%\hermes` (Windows), then re-run the installer. |

For anything else, run `hermes doctor` and read the full upstream docs:
<https://hermes-agent.nousresearch.com/docs>.

---

## Files in this directory

```
scripts/hermes-install/
├── README.md     # this file
├── install.sh    # macOS / Linux / WSL2 entry point
└── install.ps1   # Windows (native + WSL-aware) entry point
```

Both scripts are pure dispatchers — they contain **no Hermes source
code** and pull the real installer from `hermes-agent.nousresearch.com`
at run time. Bump a flag or a URL here and the wrapper stays in sync
with the upstream project without needing a re-release.
