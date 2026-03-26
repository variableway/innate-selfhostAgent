#Requires -Version 5.1

param(
    [switch]$SkipWinget,
    [switch]$InstallAll
)

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Print-Banner {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Windows Terminal Tools Installer" -ForegroundColor Cyan
    Write-Host "  适用于初学者的AI开发环境配置" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Install-Winget {
    Write-Info "检查 winget..."
    if (Test-Command winget) {
        Write-Success "winget 已安装: $(winget --version)"
    } else {
        Write-Info "正在安装 App Installer (包含 winget)..."
        try {
            $progressPreference = 'silentlyContinue'
            Invoke-WebRequest -Uri "https://aka.ms/getwinget" -OutFile "$env:TEMP\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
            Add-AppxPackage -Path "$env:TEMP\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
            Write-Success "winget 安装完成"
        } catch {
            Write-Error "winget 安装失败: $_"
            Write-Info "请手动从 Microsoft Store 安装 App Installer"
            exit 1
        }
    }
}

function Install-Chocolatey {
    Write-Info "检查 Chocolatey..."
    if (Test-Command choco) {
        Write-Success "Chocolatey 已安装"
    } else {
        Write-Info "正在安装 Chocolatey..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Success "Chocolatey 安装完成"
    }
}

function Install-TerminalApps {
    Write-Info "安装Terminal应用程序..."
    
    Write-Info "[1/3] Windows Terminal..."
    $wt = Get-AppxPackage -Name Microsoft.WindowsTerminal -ErrorAction SilentlyContinue
    if ($wt) {
        Write-Success "Windows Terminal 已安装"
    } else {
        if (Test-Command winget) {
            winget install Microsoft.WindowsTerminal --silent
            Write-Success "Windows Terminal 安装完成"
        } else {
            Write-Info "请从 Microsoft Store 安装 Windows Terminal"
        }
    }
    
    Write-Info "[2/3] WezTerm..."
    if (Test-Command wezterm) {
        Write-Success "WezTerm 已安装"
    } else {
        if (Test-Command winget) {
            $install = $InstallAll -or (Read-Host "是否安装 WezTerm? (y/n)") -eq 'y'
            if ($install) {
                winget install wez.wezterm --silent
                Write-Success "WezTerm 安装完成"
            }
        }
    }
    
    Write-Info "[3/3] PowerShell 7..."
    if (Test-Command pwsh) {
        Write-Success "PowerShell 7 已安装: $(pwsh --version)"
    } else {
        if (Test-Command winget) {
            winget install Microsoft.PowerShell --silent
            Write-Success "PowerShell 7 安装完成"
        }
    }
}

function Install-OhMyPosh {
    Write-Info "安装 Oh My Posh..."
    
    if (Test-Command oh-my-posh) {
        Write-Success "Oh My Posh 已安装"
    } else {
        if (Test-Command winget) {
            winget install JanDeDobbeleer.OhMyPosh --silent
            Write-Success "Oh My Posh 安装完成"
        }
    }
    
    Write-Info "安装 Nerd Font..."
    $fonts = @("FiraCode", "CascadiaCode")
    foreach ($font in $fonts) {
        oh-my-posh font install "$font" 2>$null
    }
    Write-Success "字体安装完成"
    
    $profilePath = $PROFILE.CurrentUserAllHosts
    if (-not (Test-Path $profilePath)) {
        New-Item -Path $profilePath -Type File -Force | Out-Null
    }
    
    if (-not (Select-String -Path $profilePath -Pattern "oh-my-posh" -Quiet)) {
        Add-Content -Path $profilePath -Value @"

# Oh My Posh
oh-my-posh init pwsh --config `"`$env:POSH_THEMES_PATH\paradox.omp.json`" | Invoke-Expression
"@
        Write-Success "PowerShell Profile 已配置"
    }
}

function Install-Nushell {
    Write-Info "安装 Nu Shell..."
    
    if (Test-Command nu) {
        Write-Success "Nu Shell 已安装: $(nu --version)"
    } else {
        $install = $InstallAll -or (Read-Host "是否安装 Nu Shell? (y/n)") -eq 'y'
        if ($install -and (Test-Command winget)) {
            winget install Nushell.Nushell --silent
            Write-Success "Nu Shell 安装完成"
        }
    }
}

function Install-Utilities {
    Write-Info "安装实用工具..."
    
    $tools = @(
        @{Name="Git"; Package="Git.Git"; Command="git"},
        @{Name="fzf"; Package="junegunn.fzf"; Command="fzf"},
        @{Name="bat"; Package="sharkdp.bat"; Command="bat"},
        @{Name="ripgrep"; Package="BurntSushi.ripgrep.MSVC"; Command="rg"},
        @{Name="zoxide"; Package="ajeetdsouza.zoxide"; Command="zoxide"}
    )
    
    foreach ($tool in $tools) {
        Write-Info "安装 $($tool.Name)..."
        if (Test-Command $tool.Command) {
            Write-Success "$($tool.Name) 已安装"
        } else {
            if (Test-Command winget) {
                winget install "$($tool.Package)" --silent --accept-source-agreements --accept-package-agreements
                Write-Success "$($tool.Name) 安装完成"
            }
        }
    }
    
    Write-Info "安装 Terminal-Icons PowerShell 模块..."
    if (-not (Get-Module -ListAvailable -Name Terminal-Icons)) {
        Install-Module -Name Terminal-Icons -Repository PSGallery -Force -Scope CurrentUser
        Write-Success "Terminal-Icons 安装完成"
    }
    
    $profilePath = $PROFILE.CurrentUserAllHosts
    $configAdded = $false
    
    if (-not (Select-String -Path $profilePath -Pattern "zoxide" -Quiet)) {
        Add-Content -Path $profilePath -Value @"

# zoxide
Invoke-Expression (& { (zoxide init powershell | Out-String) })
"@
        $configAdded = $true
    }
    
    if (-not (Select-String -Path $profilePath -Pattern "Terminal-Icons" -Quiet)) {
        Add-Content -Path $profilePath -Value @"

# Terminal Icons
Import-Module Terminal-Icons
"@
        $configAdded = $true
    }
    
    if (-not (Select-String -Path $profilePath -Pattern "PSReadLine" -Quiet)) {
        Add-Content -Path $profilePath -Value @"

# PSReadLine
Set-PSReadLineOption -PredictiveViewSource History
Set-PSReadLineOption -EditMode Windows
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
"@
        $configAdded = $true
    }
    
    if ($configAdded) {
        Write-Success "PowerShell Profile 已更新"
    }
}

function Install-WSL {
    Write-Info "检查 WSL..."
    
    $wsl = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -ErrorAction SilentlyContinue
    $vm = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue
    
    if ($wsl.State -eq "Enabled" -and $vm.State -eq "Enabled") {
        Write-Success "WSL 已启用"
    } else {
        $install = $InstallAll -or (Read-Host "是否安装 WSL2? (y/n)") -eq 'y'
        if ($install) {
            Write-Info "启用 WSL 功能..."
            dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
            dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart | Out-Null
            Write-Success "WSL 功能已启用，需要重启电脑"
            Write-Info "重启后运行: wsl --install"
        }
    }
}

function Test-Installation {
    Write-Info "验证安装..."
    Write-Host ""
    Write-Host "=== 验证结果 ===" -ForegroundColor Green
    
    $results = @()
    
    $results += "✓ winget: $(winget --version 2>$null)"
    $results += "✓ PowerShell: $($PSVersionTable.PSVersion)"
    $results += "✓ Git: $(git --version 2>$null)"
    
    $wt = Get-AppxPackage Microsoft.WindowsTerminal -ErrorAction SilentlyContinue
    $results += "✓ Windows Terminal: $($wt.Version)"
    
    if (Test-Command pwsh) {
        $results += "✓ PowerShell 7: $(pwsh --version 2>$null)"
    }
    
    if (Test-Command nu) {
        $results += "✓ Nu Shell: $(nu --version 2>$null)"
    }
    
    $results += "✓ zoxide: $(zoxide --version 2>$null)"
    $results += "✓ bat: $(bat --version 2>$null)"
    $results += "✓ ripgrep: $(rg --version 2>$null | Select-Object -First 1)"
    
    foreach ($result in $results) {
        Write-Host $result
    }
    
    Write-Host ""
}

function Print-NextSteps {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  安装完成！" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 重启 PowerShell 或运行: . `$PROFILE"
    Write-Host "2. 打开 Windows Terminal 体验增强的终端"
    Write-Host "3. 尝试命令: z <目录名> 快速跳转"
    Write-Host "4. 按 Ctrl+R 搜索命令历史 (fzf)"
    Write-Host ""
    Write-Host "常用命令:" -ForegroundColor Yellow
    Write-Host "  z <目录>          - 快速跳转目录"
    Write-Host "  bat <文件>        - 查看文件内容"
    Write-Host "  rg <关键词>       - 快速搜索"
    Write-Host "  nu                - 启动 Nu Shell"
    Write-Host ""
    Write-Host "文档参考: docs/guides/terminal-setup-windows.md" -ForegroundColor Cyan
    Write-Host ""
}

try {
    Print-Banner
    
    if (-not $SkipWinget) {
        Install-Winget
        Write-Host ""
    }
    
    Install-TerminalApps
    Write-Host ""
    
    Install-OhMyPosh
    Write-Host ""
    
    Install-Nushell
    Write-Host ""
    
    Install-Utilities
    Write-Host ""
    
    Install-WSL
    Write-Host ""
    
    Test-Installation
    
    Print-NextSteps
    
} catch {
    Write-Error "安装过程中出错: $_"
    Write-Host $_.ScriptStackTrace
    exit 1
}
