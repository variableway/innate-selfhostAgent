#!/usr/bin/env pwsh
#requires -Version 5.1
<#
.SYNOPSIS
    Innate Executable — One-Click Start Script (Windows)

.DESCRIPTION
    Detects prerequisites, installs dependencies, and starts the Tauri dev server.
    Supports interactive and CI modes.

.PARAMETER Command
    dev         Start development server (default)
    dev:fast    Pre-compile Rust deps, then dev (recommended first time)
    build       Build production app
    build:web   Build frontend only
    build:rust  Build Rust backend only
    clean       Clean build artifacts
    status      Check environment

.EXAMPLE
    .\scripts\start.ps1
    .\scripts\start.ps1 dev
    .\scripts\start.ps1 build
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet("dev", "dev:fast", "build", "build:web", "build:rust", "clean", "status", "help")]
    [string]$Command = "dev"
)

# ── Paths ──
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$PlaygroundDir = Join-Path $RepoRoot "playground"
$DesktopDir = Join-Path $PlaygroundDir "apps\desktop"
$PnpmLock = Join-Path $PlaygroundDir "pnpm-lock.yaml"

# ── Colors ──
$Green = "`e[32m"; $Yellow = "`e[33m"; $Cyan = "`e[36m"; $Red = "`e[31m"; $Reset = "`e[0m"
function Info { param($msg); Write-Host "$Cyan[*]$Reset $msg" }
function Ok { param($msg); Write-Host "$Green[✓]$Reset $msg" }
function Warn { param($msg); Write-Host "$Yellow[!]$Reset $msg" }
function Err { param($msg); Write-Host "$Red[x]$Reset $msg" }

# ── Helpers ──
function Test-Command { param($cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Test-Node {
    if (-not (Test-Command node)) { return $false }
    $ver = (node -v 2>$null).Trim()
    Info "Node.js: $ver"
    # Require >= 18
    $major = [int]($ver -replace "^v", "").Split(".")[0]
    return $major -ge 18
}

function Test-Pnpm {
    if (Test-Command pnpm) {
        Info "pnpm: $(pnpm -v 2>$null)"
        return $true
    }
    Warn "pnpm not found"
    return $false
}

function Test-Rust {
    if (Test-Command rustc) {
        Info "Rust: $(rustc --version 2>$null)"
        return $true
    }
    Warn "Rust not found"
    return $false
}

function Test-Cargo {
    if (Test-Command cargo) {
        return $true
    }
    Warn "Cargo not found"
    return $false
}

function Install-Pnpm {
    Warn "pnpm is required but not installed."
    Info "Installing pnpm via npm..."
    npm install -g pnpm
    if (Test-Command pnpm) {
        Ok "pnpm installed: $(pnpm -v)"
    } else {
        Err "Failed to install pnpm. Please install manually:"
        Err "  npm install -g pnpm"
        Err "  or: iwr https://get.pnpm.io/install.ps1 -useb | iex"
        exit 1
    }
}

function Install-Rust {
    Warn "Rust is required for Tauri but not installed."
    Info "Please install Rust from https://rustup.rs/"
    Info "After installation, restart your terminal and re-run this script."
    exit 1
}

function Check-Prerequisites {
    Write-Host "`n=== Checking Prerequisites ===" -ForegroundColor Cyan
    $missing = 0

    if (-not (Test-Node)) {
        Err "Node.js 18+ is required. Please install from https://nodejs.org/"
        $missing++
    }

    if (-not (Test-Pnpm)) {
        Install-Pnpm
    }

    if (-not (Test-Rust)) {
        Install-Rust
    }

    if (-not (Test-Cargo)) {
        Err "Cargo is required but not found."
        $missing++
    }

    if ($missing -gt 0) {
        exit 1
    }
    Ok "All prerequisites satisfied!"
}

function Install-Dependencies {
    Write-Host "`n=== Installing Dependencies ===" -ForegroundColor Cyan
    Set-Location $PlaygroundDir

    if (Test-Path $PnpmLock) {
        Info "Using frozen lockfile..."
        pnpm install --frozen-lockfile
    } else {
        Warn "No lockfile found, running pnpm install..."
        pnpm install
    }

    if ($LASTEXITCODE -ne 0) {
        Err "Dependency installation failed."
        exit 1
    }
    Ok "Dependencies installed."
}

function Start-Dev {
    Write-Host "`n=== Starting Development Server ===" -ForegroundColor Cyan
    Info "Project: $DesktopDir"
    Info "This will:"
    Info "  1. Install dependencies if needed"
    Info "  2. Start Next.js dev server (http://localhost:5001)"
    Info "  3. Start Tauri desktop app"
    Info ""
    Info "Web changes: Hot Module Replacement (HMR) - no restart needed"
    Info "Rust changes: Tauri incremental compilation"
    Info ""

    Install-Dependencies

    Set-Location $DesktopDir
    Ok "Launching Tauri dev server... (Ctrl+C to stop)"

    # Generate manifest first
    node scripts/generate-tutorials-manifest.mjs

    # Start tauri dev
    pnpm tauri dev
}

function Start-DevFast {
    Write-Host "`n=== Fast Dev Mode ===" -ForegroundColor Cyan
    Info "Pre-compiling Rust dependencies first..."

    Install-Dependencies

    # Step 1: Background cargo build
    Info "Step 1/3: Pre-compiling Rust dependencies in background..."
    Set-Location $DesktopDir
    $cargoJob = Start-Job -ScriptBlock { cargo build } -WorkingDirectory $using:DesktopDir
    Info "  Cargo PID: $($cargoJob.Id)"

    # Step 2: Start Next.js dev server
    Info "Step 2/3: Starting Next.js dev server..."
    $nextJob = Start-Job -ScriptBlock { pnpm next dev --port 5001 } -WorkingDirectory $using:DesktopDir
    Info "  Next.js PID: $($nextJob.Id)"
    Info "  Next.js URL: http://localhost:5001"

    # Step 3: Wait for cargo, then start tauri
    Info "Step 3/3: Waiting for Rust compilation..."
    Wait-Job $cargoJob | Out-Null
    $cargoResult = Receive-Job $cargoJob

    if ($cargoJob.State -eq "Completed") {
        Ok "Rust dependencies compiled!"
    } else {
        Warn "Cargo compilation may have issues, but continuing..."
    }
    Remove-Job $cargoJob

    # Stop the Next.js background job (tauri dev will start its own)
    Stop-Job $nextJob -ErrorAction SilentlyContinue
    Remove-Job $nextJob -ErrorAction SilentlyContinue

    Ok "Launching Tauri dev server..."
    pnpm tauri dev
}

function Build-All {
    Write-Host "`n=== Building Production App ===" -ForegroundColor Cyan
    Install-Dependencies

    # Build frontend and Rust in parallel
    Info "Building frontend (Next.js) in background..."
    Set-Location $DesktopDir
    $webJob = Start-Job -ScriptBlock { pnpm build } -WorkingDirectory $using:DesktopDir

    Info "Building Rust backend in background..."
    Set-Location $DesktopDir
    $rustJob = Start-Job -ScriptBlock { pnpm tauri build } -WorkingDirectory $using:DesktopDir

    Info "Build processes started. Waiting..."
    Wait-Job $webJob, $rustJob | Out-Null

    Ok "Frontend build complete!"
    Ok "Rust build complete!"
    Ok "Build finished!"

    $bundleDir = Join-Path $DesktopDir "src-tauri\target\release\bundle"
    if (Test-Path $bundleDir) {
        Info "Output directory: $bundleDir"
        Get-ChildItem $bundleDir -Recurse -File | ForEach-Object { Info "  $($_.FullName)" }
    }
}

function Build-WebOnly {
    Write-Host "`n=== Building Frontend Only ===" -ForegroundColor Cyan
    Install-Dependencies
    Set-Location $DesktopDir
    pnpm build
    Ok "Frontend build complete!"
    Info "Output: $DesktopDir\out"
}

function Build-RustOnly {
    Write-Host "`n=== Building Rust Backend Only ===" -ForegroundColor Cyan
    Set-Location $DesktopDir
    cargo build --release
    Ok "Rust build complete!"
}

function Clean-BuildArtifacts {
    Write-Host "`n=== Cleaning Build Artifacts ===" -ForegroundColor Cyan
    $items = @(
        (Join-Path $DesktopDir "out"),
        (Join-Path $DesktopDir ".next"),
        (Join-Path $DesktopDir "src-tauri\target")
    )
    foreach ($item in $items) {
        if (Test-Path $item) {
            Remove-Item $item -Recurse -Force
            Ok "Removed: $item"
        }
    }
    Ok "Clean complete!"
}

function Show-Status {
    Write-Host "`n=== Innate Executable — Environment Status ===" -ForegroundColor Cyan
    Check-Prerequisites

    Write-Host "`nProject directories:" -ForegroundColor Cyan
    Info "Script:     $ScriptDir"
    Info "Repo:       $RepoRoot"
    Info "Playground: $PlaygroundDir"
    Info "Desktop:    $DesktopDir"

    Write-Host "`nDependencies:" -ForegroundColor Cyan
    if (Test-Path (Join-Path $PlaygroundDir "node_modules")) {
        Ok "Installed"
    } else {
        Warn "Not installed (run '.\scripts\start.ps1 dev' to install)"
    }

    $binaryPath = Join-Path $DesktopDir "src-tauri\target\release\innate-playground.exe"
    if (Test-Path $binaryPath) {
        Ok "Binary: built ($binaryPath)"
    } else {
        Warn "Binary: not built"
    }
    Write-Host ""
}

function Show-Usage {
    Write-Host @"

Innate Executable — Start Script (Windows)
===========================================

Usage: .\scripts\start.ps1 <command>

Commands:
  dev         Start in development mode (Tauri + HMR)
  dev:fast    Pre-compile Rust deps, then start dev (recommended first time)
  build       Build the production application
  build:web   Build only the frontend (Next.js)
  build:rust  Build only the Rust backend
  clean       Remove build artifacts
  status      Check environment and prerequisites
  help        Show this help message

Examples:
  .\scripts\start.ps1              # Start development (default)
  .\scripts\start.ps1 dev          # Same as above
  .\scripts\start.ps1 dev:fast     # Faster first startup
  .\scripts\start.ps1 build       # Full production build
  .\scripts\start.ps1 status      # Check if everything is ready

Prerequisites:
  - Node.js 18+  (https://nodejs.org/)
  - pnpm         (will auto-install if missing)
  - Rust + Cargo (https://rustup.rs/)

"@ -ForegroundColor Cyan
}

# ── Main ──
switch ($Command) {
    "dev" { Start-Dev }
    "dev:fast" { Start-DevFast }
    "build" { Build-All }
    "build:web" { Build-WebOnly }
    "build:rust" { Build-RustOnly }
    "clean" { Clean-BuildArtifacts }
    "status" { Show-Status }
    "help" { Show-Usage }
    default { Show-Usage }
}
