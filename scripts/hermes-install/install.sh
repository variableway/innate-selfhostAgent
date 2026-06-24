#!/usr/bin/env bash
# ============================================================================
# Hermes Agent — One-Stop Installer
# ----------------------------------------------------------------------------
# Auto-detects macOS, Linux, and WSL2, then dispatches to the correct
# Hermes Agent installer from Nous Research.
#
# Official upstream install commands (kept in sync with the docs):
#   Linux / macOS / WSL2 / Termux:
#     curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
#   Windows (native PowerShell):
#     iex (irm https://hermes-agent.nousresearch.com/install.ps1)
#
# This wrapper is a thin, friendly dispatcher that:
#   - Picks the right upstream command for the running platform
#   - Verifies the only hard prerequisite (git) up front
#   - Streams progress with colored output
#   - Forwards every flag you pass straight to the upstream installer
#   - Refuses to run inside Git-Bash / MSYS on Windows (those are not POSIX)
#
# Usage:
#   ./install.sh                          # default install
#   ./install.sh --skip-browser           # forward flags
#   ./install.sh --branch main --no-skills
#   curl -fsSL .../install.sh | bash -s -- --skip-browser
#
# Repo: https://hermes-agent.nousresearch.com
# ============================================================================
set -euo pipefail

# ---- Configuration ---------------------------------------------------------
HERMES_INSTALL_URL="https://hermes-agent.nousresearch.com/install.sh"
HERMES_DMG_URL="https://hermes-assets.nousresearch.com/Hermes-Setup.dmg?build=f9c8d95e4366"
HERMES_DESKTOP_DMG_URL="${HERMES_DMG_URL}"

# ---- Pretty output ---------------------------------------------------------
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_DIM=$'\033[2m'
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'
  C_CYAN=$'\033[36m'
else
  C_RESET=""; C_BOLD=""; C_DIM=""
  C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""; C_CYAN=""
fi

info()    { printf "%s[info]%s %s\n"    "$C_CYAN"   "$C_RESET" "$*"; }
ok()      { printf "%s[ ok ]%s %s\n"    "$C_GREEN"  "$C_RESET" "$*"; }
warn()    { printf "%s[warn]%s %s\n"    "$C_YELLOW" "$C_RESET" "$*"; }
err()     { printf "%s[err ]%s %s\n"    "$C_RED"    "$C_RESET" "$*" >&2; }
section() { printf "\n%s== %s ==%s\n"   "$C_BOLD$C_BLUE" "$*" "$C_RESET"; }

banner() {
  printf "%s%s" "$C_BOLD$C_CYAN" ""
  cat <<'EOF'
   _   _                                 _
  | | | | ___  _ __ ___  _ __ ___  _ __ | |_
  | |_| |/ _ \| '_ ` _ \| '_ ` _ \| '_ \| __|
  |  _  | (_) | | | | | | | | | | | |_) | |_
  |_| |_|\___/|_| |_| |_|_| |_| |_| .__/ \__|
                                   |_|
EOF
  printf "%s   one-stop installer (macOS · Linux · WSL2)%s\n\n" "$C_DIM" "$C_RESET"
}

# ---- Helpers ---------------------------------------------------------------
have_cmd() { command -v "$1" >/dev/null 2>&1; }

require_git() {
  if have_cmd git; then
    ok "git found: $(git --version)"
    return
  fi
  warn "git is not installed — the upstream installer needs it to clone the repo."

  if have_cmd brew; then
    info "Installing git via Homebrew..."
    brew install git
  elif have_cmd apt-get; then
    info "Installing git via apt-get (sudo may prompt)..."
    sudo apt-get update && sudo apt-get install -y git
  elif have_cmd dnf; then
    info "Installing git via dnf (sudo may prompt)..."
    sudo dnf install -y git
  elif have_cmd pacman; then
    info "Installing git via pacman (sudo may prompt)..."
    sudo pacman -Sy --noconfirm git
  elif have_cmd apk; then
    info "Installing git via apk..."
    sudo apk add git
  else
    err "No supported package manager found. Please install git manually, then re-run."
    exit 1
  fi

  have_cmd git || { err "git still not available after install attempt."; exit 1; }
  ok "git installed: $(git --version)"
}

# ---- Platform detection ----------------------------------------------------
detect_platform() {
  local uname_s
  uname_s="$(uname -s 2>/dev/null || echo Unknown)"

  # Refuse to run in Git-Bash / MSYS / Cygwin on Windows — those should use
  # the PowerShell installer instead, because bash there lies about PATH and
  # registry access is invisible.
  if [[ -n "${MSYSTEM:-}" || -n "${CYGWIN:-}" ]]; then
    err "You appear to be running Git-Bash / MSYS / Cygwin on Windows."
    err "Please run this in PowerShell instead:"
    err "  iex (irm https://hermes-agent.nousresearch.com/install.ps1)"
    err "Or download the official EXE installer from:"
    err "  https://hermes-agent.nousresearch.com/"
    exit 1
  fi

  case "$uname_s" in
    Darwin)
      PLATFORM="macos"
      PLATFORM_LABEL="macOS"
      ;;
    Linux)
      # WSL sets WSL_DISTRO_NAME (and WSL_INTEROP) — detect before the generic
      # Linux branch so we can warn users about the native-Windows option.
      if [[ -n "${WSL_DISTRO_NAME:-}" || -n "${WSL_INTEROP:-}" ]]; then
        PLATFORM="wsl2"
        PLATFORM_LABEL="WSL2 (${WSL_DISTRO_NAME:-Linux})"
      else
        PLATFORM="linux"
        PLATFORM_LABEL="Linux"
      fi
      ;;
    *)
      err "Unsupported platform: $uname_s"
      err "This script supports macOS, Linux, and WSL2 only."
      err "For native Windows, run the PowerShell installer instead:"
      err "  iex (irm https://hermes-agent.nousresearch.com/install.ps1)"
      exit 1
      ;;
  esac
}

# ---- Install dispatchers ---------------------------------------------------
run_bash_installer() {
  section "Running official bash installer"
  info "Source : $HERMES_INSTALL_URL"
  info "Flags  : $*"

  # Stream the install script straight from the official URL and forward
  # every flag we received. `set -e` (above) aborts on a non-zero exit.
  if have_cmd curl; then
    curl -fsSL "$HERMES_INSTALL_URL" | bash -s -- "$@"
  elif have_cmd wget; then
    wget -qO- "$HERMES_INSTALL_URL" | bash -s -- "$@"
  else
    err "Neither curl nor wget is available. Please install one and retry."
    exit 1
  fi

  ok "Hermes Agent CLI installation finished."
}

offer_dmg_install() {
  section "Desktop installer (optional)"
  printf "%sThe official macOS app bundles a desktop GUI on top of the CLI.%s\n" \
    "$C_DIM" "$C_RESET"
  printf "%sDownload: %s%s%s\n" "$C_DIM" "$C_BLUE" "$HERMES_DMG_URL" "$C_RESET"

  if [[ -t 0 ]]; then
    local ans
    read -r -p "$(printf '%sOpen the DMG download in your browser? [y/N] %s' "$C_YELLOW" "$C_RESET")" ans
    if [[ "${ans:-N}" =~ ^[Yy]$ ]]; then
      if have_cmd open; then
        open "$HERMES_DMG_URL"
        ok "Opened in default browser."
      else
        warn "'open' not found — copy this URL into your browser manually."
      fi
    fi
  else
    info "Non-interactive shell — skipping browser prompt. Download manually above."
  fi
}

post_install_mac() {
  cat <<EOF

${C_BOLD}Next steps for macOS:${C_RESET}
  1. Reload your shell config (or open a new terminal):
       source ~/.zshrc       # zsh (default on modern macOS)
       source ~/.bashrc      # bash
  2. Verify the install:
       hermes doctor
  3. Configure your model provider:
       hermes setup --portal     # fastest: Nous Portal + 300+ models
       # or
       hermes model              # OpenAI / OpenRouter / custom endpoint
  4. (Optional) Install the desktop app:
       hermes desktop
EOF
}

post_install_linux_or_wsl() {
  cat <<EOF

${C_BOLD}Next steps for ${PLATFORM_LABEL}:${C_RESET}
  1. Reload your shell config (or open a new shell):
       source ~/.bashrc
  2. Verify the install:
       hermes doctor
  3. Configure your model provider:
       hermes setup --portal
  4. (Optional) Run as a background gateway:
       hermes gateway setup
EOF
}

# ---- Main ------------------------------------------------------------------
main() {
  banner
  section "Detecting platform"
  detect_platform
  ok "Detected: $PLATFORM_LABEL"

  section "Checking prerequisites"
  require_git

  case "$PLATFORM" in
    macos)
      info "On macOS we use the upstream bash installer (installs CLI into ~/.hermes)."
      run_bash_installer "$@"
      offer_dmg_install
      post_install_mac
      ;;
    wsl2)
      warn "You're inside WSL2. The CLI will install into the WSL filesystem."
      info "Tip: for the desktop GUI, run the PowerShell installer on the Windows side:"
      info "  iex (irm https://hermes-agent.nousresearch.com/install.ps1)"
      run_bash_installer "$@"
      post_install_linux_or_wsl
      ;;
    linux)
      run_bash_installer "$@"
      post_install_linux_or_wsl
      ;;
  esac

  printf "\n%s%sDone.%s Hermes Agent is ready. Try: %shermes%s\n" \
    "$C_BOLD" "$C_GREEN" "$C_RESET" "$C_CYAN" "$C_RESET"
}

main "$@"
