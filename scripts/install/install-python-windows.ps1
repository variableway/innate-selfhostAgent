# Python 开发环境安装脚本 (Windows)
# 以管理员身份运行 PowerShell

$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║              Python 开发环境安装脚本 (Windows)                 ║" -ForegroundColor Blue
    Write-Host "║                                                               ║" -ForegroundColor Blue
    Write-Host "║  安装内容: uv + Python 3.12 + 常用工具                         ║" -ForegroundColor Blue
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Install-Uv {
    Write-Host "[INFO] 检查 uv..." -ForegroundColor Blue
    
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if ($uv) {
        Write-Host "[SUCCESS] uv 已安装: $(uv --version)" -ForegroundColor Green
        return
    }
    
    Write-Host "[INFO] 安装 uv..." -ForegroundColor Blue
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install astral-sh.uv --silent
    } else {
        Write-Host "[INFO] 使用安装脚本下载 uv..." -ForegroundColor Blue
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    }
    
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
    
    Write-Host "[SUCCESS] uv 安装完成" -ForegroundColor Green
}

function Configure-PowerShell {
    Write-Host "[INFO] 配置 PowerShell..." -ForegroundColor Blue
    
    $profileContent = @'

# uv Python configuration
$env:UV_PYTHON_PREFERENCE = "only-managed"
'@
    
    if (-not (Test-Path $PROFILE)) {
        New-Item -Path $PROFILE -Type File -Force | Out-Null
    }
    
    if (-not (Select-String -Path $PROFILE -Pattern "UV_PYTHON" -Quiet)) {
        Add-Content -Path $PROFILE -Value $profileContent
        Write-Host "[SUCCESS] 已添加 uv 配置到 PowerShell Profile" -ForegroundColor Green
    } else {
        Write-Host "[SUCCESS] uv 配置已存在" -ForegroundColor Green
    }
    
    $env:UV_PYTHON_PREFERENCE = "only-managed"
}

function Install-Python {
    Write-Host "[INFO] 安装 Python..." -ForegroundColor Blue
    
    uv python install 3.12
    uv python install 3.11
    
    Write-Host "[SUCCESS] Python 安装完成" -ForegroundColor Green
}

function Set-DefaultPython {
    Write-Host "[INFO] 设置默认 Python 版本..." -ForegroundColor Blue
    
    uv python pin 3.12 --global
    
    $pythonVersion = uv python find 3.12
    Write-Host "[SUCCESS] 默认 Python: $pythonVersion" -ForegroundColor Green
}

function Configure-PipMirror {
    Write-Host "[INFO] 配置 pip 镜像..." -ForegroundColor Blue
    
    $response = Read-Host "是否配置清华镜像? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $pipDir = "$env:APPDATA\pip"
        if (-not (Test-Path $pipDir)) {
            New-Item -Path $pipDir -Type Directory -Force | Out-Null
        }
        
        $pipConfig = @"
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
"@
        Set-Content -Path "$pipDir\pip.ini" -Value $pipConfig
        Write-Host "[SUCCESS] 已配置清华镜像" -ForegroundColor Green
    } else {
        Write-Host "[INFO] 跳过镜像配置" -ForegroundColor Blue
    }
}

function Install-CommonTools {
    Write-Host "[INFO] 安装常用 Python 工具..." -ForegroundColor Blue
    
    $tools = @("black", "ruff", "pytest", "httpie")
    
    foreach ($tool in $tools) {
        $response = Read-Host "是否安装 $tool? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            uv tool install $tool
            Write-Host "[SUCCESS] $tool 安装完成" -ForegroundColor Green
        }
    }
}

function Verify-Installation {
    Write-Host "[INFO] 验证安装..." -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "uv 版本:" -ForegroundColor Yellow
    uv --version 2>$null
    if (-not $?) { Write-Host "未安装" }
    
    Write-Host "Python 版本:" -ForegroundColor Yellow
    uv python list 2>$null
    
    Write-Host "已安装的工具:" -ForegroundColor Yellow
    uv tool list 2>$null
}

function Print-NextSteps {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "                  安装完成！" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. 重启 PowerShell"
    Write-Host "  2. 验证安装: python --version"
    Write-Host "  3. 创建项目: uv init my-project; cd my-project"
    Write-Host "  4. 安装 Kimi CLI: uv tool install kimi-cli"
    Write-Host ""
    Write-Host "uv 常用命令:" -ForegroundColor Yellow
    Write-Host "  uv python install 3.11   # 安装 Python 版本"
    Write-Host "  uv python list           # 查看已安装版本"
    Write-Host "  uv venv                  # 创建虚拟环境"
    Write-Host "  uv add requests          # 添加依赖"
    Write-Host "  uv run python app.py     # 运行脚本"
    Write-Host "  uv tool install black    # 安装全局工具"
    Write-Host ""
}

Write-Banner
Install-Uv
Write-Host ""
Configure-PowerShell
Write-Host ""
Install-Python
Write-Host ""
Set-DefaultPython
Write-Host ""
Configure-PipMirror
Write-Host ""
Install-CommonTools
Write-Host ""
Verify-Installation
Print-NextSteps
