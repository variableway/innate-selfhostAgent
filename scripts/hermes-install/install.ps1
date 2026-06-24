<#
.SYNOPSIS
    One-stop installer for Hermes Agent on Windows (native + WSL).

.DESCRIPTION
    Detects whether the script is running:
      - Inside a WSL distribution (uses wsl.exe to invoke install.sh), or
      - On native Windows (downloads and runs the official PowerShell
        installer from hermes-agent.nousresearch.com).

    All extra arguments are forwarded to the upstream installer
    (for example: -SkipBrowser, -IncludeDesktop, -Branch main).

.PARAMETER DownloadExe
    Skip the official PowerShell installer and download the Hermes-Setup.exe
    directly into the current directory. Useful when you want a manual
    double-clickable installer or are behind a proxy that blocks TLS to the
    installer endpoint.

.PARAMETER ExePath
    Path where the downloaded EXE should be saved. Defaults to
    "$env:USERPROFILE\Downloads\Hermes-Setup.exe".

.PARAMETER NoDesktop
    Convenience flag — forwards -SkipBrowser to the upstream installer so
    the Playwright/Chromium download is skipped.

.EXAMPLE
    iex (irm https://hermes-agent.nousresearch.com/install.ps1)

.EXAMPLE
    # From a saved file
    .\install.ps1 -SkipBrowser -Branch main

.EXAMPLE
    # Get the EXE installer without running it
    .\install.ps1 -DownloadExe

.LINK
    https://hermes-agent.nousresearch.com
#>

[CmdletBinding()]
param(
    [switch]$DownloadExe,
    [string]$ExePath = (Join-Path $env:USERPROFILE 'Downloads\Hermes-Setup.exe'),
    [switch]$NoDesktop
)

$ErrorActionPreference = 'Stop'

# ---- Pretty output ---------------------------------------------------------
function Write-Banner {
    Write-Host ''
    Write-Host '   _   _                                 _'                  -ForegroundColor Cyan
    Write-Host '  | | | | ___  _ __ ___  _ __ ___  _ __ | |_'                 -ForegroundColor Cyan
    Write-Host '  | |_| |/ _ ' "`" '_ ' "`" _ '` | '_ ' "`" _ '` | '_ '` | __|'             -ForegroundColor Cyan
    Write-Host '  |  _  | (_) | | | | | | | | | | | | |_) | |_'                 -ForegroundColor Cyan
    Write-Host '  |_| |_|' "`" ___/|_| |_| |_|_| |_| |_| .__/ ' "`" __|'               -ForegroundColor Cyan
    Write-Host '                                   |_|'                        -ForegroundColor Cyan
    Write-Host '   one-stop installer (Windows · WSL2)' -ForegroundColor DarkGray
    Write-Host ''
}

function Write-Step   { param($m) Write-Host "[step] $m" -ForegroundColor Cyan }
function Write-Info   { param($m) Write-Host "[info] $m" -ForegroundColor DarkCyan }
function Write-Ok     { param($m) Write-Host "[ ok ] $m" -ForegroundColor Green }
function Write-Warn   { param($m) Write-Host "[warn] $m" -ForegroundColor Yellow }
function Write-Err    { param($m) Write-Host "[err ] $m" -ForegroundColor Red }

# ---- WSL detection ---------------------------------------------------------
$runningInWsl = $false
try {
    $runningInWsl = ($env:WSL_DISTRO_NAME -or $env:WSLENV) -and (Get-Command wsl.exe -ErrorAction SilentlyContinue)
} catch { }

# ---- Git prerequisite (native Windows only) -------------------------------
function Test-Git {
    return [bool](Get-Command git.exe -ErrorAction SilentlyContinue)
}

# ---- Platform dispatch -----------------------------------------------------
function Invoke-BashInstallerInWsl {
    Write-Step "Detected WSL — delegating to install.sh inside the distro."
    $distro = $env:WSL_DISTRO_NAME
    if (-not $distro) { $distro = 'Ubuntu' }

    $remote = 'https://hermes-agent.nousresearch.com/install.sh'
    $flags  = $args
    $flagStr = ''
    if ($flags.Count -gt 0) {
        $flagStr = ' ' + (($flags | ForEach-Object { "'$_'" }) -join ' ')
    }

    # We pull install.sh from the SAME repo so users can self-host it.
    $localScript = Join-Path $PSScriptRoot 'install.sh'
    if (Test-Path $localScript) {
        Write-Info "Using local install.sh: $localScript"
        $wslPath = wsl.exe wslpath -u "$localScript"
        wsl.exe --distribution $distro bash -lc "chmod +x '$wslPath' && '$wslPath'$flagStr"
    } else {
        Write-Info "Downloading install.sh from $remote"
        wsl.exe --distribution $distro bash -lc "curl -fsSL '$remote' | bash -s$flagStr"
    }
}

function Invoke-NativeWindowsInstaller {
    Write-Step "Detected native Windows — running the official PowerShell installer."

    $forward = @()
    if ($NoDesktop) { $forward += '-SkipBrowser' }
    # forward any extra args the caller passed through
    foreach ($a in $args) { $forward += $a }

    $iex = "iex (irm https://hermes-agent.nousresearch.com/install.ps1)"
    if ($forward.Count -gt 0) {
        $iex += ' ' + ($forward -join ' ')
    }

    Write-Info "Running: $iex"
    Invoke-Expression $iex
}

function Invoke-ExeDownload {
    Write-Step "Downloading Hermes-Setup.exe"
    $url  = 'https://hermes-assets.nousresearch.com/Hermes-Setup.exe?build=f9c8d95e4366'
    $dest = $ExePath
    $dir  = Split-Path -Parent $dest
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    Write-Info "URL : $url"
    Write-Info "Dest: $dest"

    # Use BITS if available (resume + proxy friendly), fall back to Invoke-WebRequest.
    if (Get-Command Start-BitsTransfer -ErrorAction SilentlyContinue) {
        Start-BitsTransfer -Source $url -Destination $dest -DisplayName 'Hermes Agent installer'
    } else {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    }

    Write-Ok "Saved to $dest"
    Write-Host ''
    Write-Host "Double-click the EXE to launch the graphical installer, or run:" -ForegroundColor White
    Write-Host "  & '$dest'" -ForegroundColor Cyan
}

# ---- Main ------------------------------------------------------------------
Write-Banner

if ($runningInWsl) {
    Invoke-BashInstallerInWsl @args
} elseif ($DownloadExe) {
    Invoke-ExeDownload
} else {
    if (-not (Test-Git)) {
        Write-Warn "git is not on PATH. The official installer can fetch a portable copy for you, so we'll continue — but installing git for Windows is recommended: https://git-scm.com/download/win"
    } else {
        Write-Ok "git found: $(git --version)"
    }
    Invoke-NativeWindowsInstaller @args
}

Write-Host ''
Write-Ok "Done."
Write-Host "After install, in a NEW PowerShell window:" -ForegroundColor White
Write-Host "  hermes doctor" -ForegroundColor Cyan
Write-Host "  hermes setup --portal" -ForegroundColor Cyan
Write-Host ''
