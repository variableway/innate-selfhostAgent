#!/usr/bin/env pwsh
#requires -Version 5.1
<#
.SYNOPSIS
    Innate Executable — Quick Environment Check

.DESCRIPTION
    Checks if Node.js, pnpm, and Rust are installed.
    Provides guidance if anything is missing.
#>

param(
    [switch]$Fix
)

# ── Colors ──
$Green = "`e[32m"; $Yellow = "`e[33m"; $Cyan = "`e[36m"; $Red = "`e[31m"; $Reset = "`e[0m"
function Ok  { param($msg); Write-Host "$Green[✓]$Reset $msg" }
function Warn{ param($msg); Write-Host "$Yellow[!]$Reset $msg" }
function Err { param($msg); Write-Host "$Red[x]$Reset $msg" }
function Info{ param($msg); Write-Host "$Cyan[*]$Reset $msg" }

function Test-Cmd { param($cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

$allOk = $true

Write-Host "`n=== Innate Executable — Environment Check ===`n" -ForegroundColor Cyan

# Node.js
if (Test-Cmd node) {
    $nodeVer = (node -v 2>$null).Trim()
    $major = [int]($nodeVer -replace "^v", "").Split(".")[0]
    if ($major -ge 18) {
        Ok "Node.js $nodeVer (≥18 required)"
    } else {
        Warn "Node.js $nodeVer found but 18+ is required"
        $allOk = $false
    }
} else {
    Err "Node.js not found"
    Info "  Install from: https://nodejs.org/"
    $allOk = $false
}

# pnpm
if (Test-Cmd pnpm) {
    Ok "pnpm $(pnpm -v 2>$null)"
} else {
    Err "pnpm not found"
    Info "  Install: npm install -g pnpm"
    Info "  Or:      iwr https://get.pnpm.io/install.ps1 -useb | iex"
    if ($Fix) {
        Info "  Auto-fixing..."
        npm install -g pnpm
        if (Test-Cmd pnpm) {
            Ok "pnpm installed successfully"
        } else {
            Err "Failed to install pnpm"
            $allOk = $false
        }
    } else {
        $allOk = $false
    }
}

# Rust
if (Test-Cmd rustc) {
    Ok "Rust $(rustc --version 2>$null)"
} else {
    Err "Rust not found"
    Info "  Install from: https://rustup.rs/"
    $allOk = $false
}

# Cargo
if (Test-Cmd cargo) {
    Ok "Cargo $(cargo --version 2>$null)"
} else {
    Err "Cargo not found"
    Info "  Install with Rust from https://rustup.rs/"
    $allOk = $false
}

Write-Host ""

if ($allOk) {
    Write-Host "✅ All prerequisites are ready!" -ForegroundColor Green
    Write-Host "   Run: .\scripts\start.ps1 dev" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some prerequisites are missing." -ForegroundColor Yellow
    Write-Host "   Run with -Fix flag to auto-install pnpm:" -ForegroundColor Cyan
    Write-Host "   .\scripts\check-env.ps1 -Fix" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
