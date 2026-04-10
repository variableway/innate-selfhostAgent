#Requires -Version 5.1

param(
    [switch]$SkipWinget
)

$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host '[INFO] ' -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host '[SUCCESS] ' -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Err {
    param([string]$Message)
    Write-Host '[ERROR] ' -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Print-Banner {
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host '  Rust / Cargo Installer' -ForegroundColor Cyan
    Write-Host '  Required for Tauri desktop development' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ''
}

function Install-Rustup {
    Write-Info 'Checking Rust...'

    if (Test-Command rustup) {
        Write-Success 'Rustup is already installed'
        Write-Info ('Current version: ' + (rustc --version))
        Write-Info 'Updating...'
        rustup update
        Write-Success 'Rust is up to date'
        return
    }

    if ((-not $SkipWinget) -and (Test-Command winget)) {
        Write-Info 'Installing Rustup via winget...'
        winget install Rustlang.Rustup --silent --accept-source-agreements --accept-package-agreements
        Write-Success 'Rustup installed'
    } else {
        Write-Info 'Downloading rustup-init.exe...'
        $installerPath = "$env:TEMP\rustup-init.exe"
        Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile $installerPath
        Write-Info 'Running rustup installer (default install)...'
        & $installerPath -y
        Remove-Item $installerPath -Force
        Write-Success 'Rustup installed'
    }

    $cargoBin = "$env:USERPROFILE\.cargo\bin"
    if (-not ($env:PATH -like "*$cargoBin*")) {
        $env:PATH = "$cargoBin;$env:PATH"
    }
}

function Install-VsBuildTools {
    Write-Info 'Checking Visual Studio Build Tools...'

    $vsWherePath = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'

    $hasMsvc = $false
    if (Test-Path $vsWherePath) {
        $vsPath = & $vsWherePath -latest -property installationPath 2>$null
        if ($vsPath) {
            $msvcDir = Join-Path $vsPath 'VC\Tools\MSVC'
            $hasMsvc = Test-Path $msvcDir
        }
    }

    if ($hasMsvc) {
        Write-Success 'Visual Studio Build Tools already installed'
        return
    }

    if (-not $SkipWinget -and (Test-Command winget)) {
        Write-Info 'Installing Visual Studio Build Tools (C++ desktop dev)...'
        winget install Microsoft.VisualStudio.2022.BuildTools --silent --accept-source-agreements --accept-package-agreements
        winget install Microsoft.VisualStudio.2022.BuildTools --override '--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive' --accept-source-agreements
        Write-Success 'Visual Studio Build Tools installed'
    } else {
        Write-Info 'Please install Visual Studio Build Tools manually:'
        Write-Host '  https://visualstudio.microsoft.com/visual-cpp-build-tools/' -ForegroundColor Yellow
    }
}

function Install-Webview2 {
    Write-Info 'Checking WebView2...'
    $webView2 = Get-AppxPackage -Name Microsoft.WebView2Runtime -ErrorAction SilentlyContinue
    if ($webView2) {
        Write-Success 'WebView2 already installed'
    } else {
        if (-not $SkipWinget -and (Test-Command winget)) {
            winget install Microsoft.EdgeWebView2Runtime --silent --accept-source-agreements --accept-package-agreements
            Write-Success 'WebView2 installed'
        }
    }
}

function Test-Installation {
    Write-Host ''
    Write-Host '=== Verification ===' -ForegroundColor Green

    $cargoBin = "$env:USERPROFILE\.cargo\bin"
    if (-not ($env:PATH -like "*$cargoBin*")) {
        $env:PATH = "$cargoBin;$env:PATH"
    }

    if (Test-Command rustc) {
        Write-Host ('  OK rustc: ' + (rustc --version 2>$null)) -ForegroundColor Green
    } else {
        Write-Host '  FAIL rustc: not found' -ForegroundColor Red
    }

    if (Test-Command cargo) {
        Write-Host ('  OK cargo: ' + (cargo --version 2>$null)) -ForegroundColor Green
    } else {
        Write-Host '  FAIL cargo: not found' -ForegroundColor Red
    }

    if (Test-Command rustup) {
        Write-Host ('  OK rustup: ' + (rustup --version 2>$null | Select-Object -First 1)) -ForegroundColor Green
    } else {
        Write-Host '  FAIL rustup: not found' -ForegroundColor Red
    }

    Write-Host ''
}

function Print-NextSteps {
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host '  Installation Complete!' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ''
    Write-Host 'Next steps:' -ForegroundColor Yellow
    Write-Host '1. Restart your terminal (important for PATH)'
    Write-Host '2. Verify: cargo --version'
    Write-Host '3. Run Tauri dev: pnpm tauri dev'
    Write-Host ''
    Write-Host 'Useful commands:' -ForegroundColor Yellow
    Write-Host '  rustup update        - Update Rust'
    Write-Host '  cargo build          - Build project'
    Write-Host '  cargo run            - Run project'
    Write-Host '  rustup target list   - List compile targets'
    Write-Host ''
}

try {
    Print-Banner

    Install-VsBuildTools
    Write-Host ''

    Install-Rustup
    Write-Host ''

    Install-Webview2
    Write-Host ''

    Test-Installation

    Print-NextSteps

} catch {
    Write-Err ('Installation failed: ' + $_)
    Write-Host $_.ScriptStackTrace
    exit 1
}
