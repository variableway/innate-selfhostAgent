# Node.js 开发环境安装脚本 (Windows)
# 以管理员身份运行 PowerShell

$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║              Node.js 开发环境安装脚本 (Windows)                ║" -ForegroundColor Blue
    Write-Host "║                                                               ║" -ForegroundColor Blue
    Write-Host "║  安装内容: fnm + Node.js LTS + 常用全局工具                    ║" -ForegroundColor Blue
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Install-Fnm {
    Write-Host "[INFO] 检查 fnm..." -ForegroundColor Blue
    
    $fnm = Get-Command fnm -ErrorAction SilentlyContinue
    if ($fnm) {
        Write-Host "[SUCCESS] fnm 已安装: $(fnm --version)" -ForegroundColor Green
        return
    }
    
    Write-Host "[INFO] 安装 fnm..." -ForegroundColor Blue
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install Schniz.fnm --silent
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        scoop install fnm
    } else {
        Write-Host "[INFO] 使用安装程序下载 fnm..." -ForegroundColor Blue
        $fnmUrl = "https://github.com/Schniz/fnm/releases/latest/download/fnm-windows.zip"
        $downloadPath = "$env:TEMP\fnm-windows.zip"
        $installPath = "$env:LOCALAPPDATA\fnm"
        
        Invoke-WebRequest -Uri $fnmUrl -OutFile $downloadPath
        Expand-Archive -Path $downloadPath -DestinationPath $installPath -Force
        
        $env:PATH += ";$installPath"
        [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$installPath", "User")
        
        Remove-Item $downloadPath
    }
    
    Write-Host "[SUCCESS] fnm 安装完成" -ForegroundColor Green
}

function Configure-PowerShell {
    Write-Host "[INFO] 配置 PowerShell..." -ForegroundColor Blue
    
    $profileContent = @'

# fnm configuration
fnm env --use-on-cd | Out-String | Invoke-Expression
'@
    
    if (-not (Test-Path $PROFILE)) {
        New-Item -Path $PROFILE -Type File -Force | Out-Null
    }
    
    if (-not (Select-String -Path $PROFILE -Pattern "fnm env" -Quiet)) {
        Add-Content -Path $PROFILE -Value $profileContent
        Write-Host "[SUCCESS] 已添加 fnm 配置到 PowerShell Profile" -ForegroundColor Green
    } else {
        Write-Host "[SUCCESS] fnm 配置已存在" -ForegroundColor Green
    }
    
    fnm env --use-on-cd | Out-String | Invoke-Expression
}

function Install-NodeJS {
    Write-Host "[INFO] 安装 Node.js LTS 版本..." -ForegroundColor Blue
    
    fnm install --lts
    $ltsVersion = (fnm ls | Select-String -Pattern 'v[\d.]+' | Select-Object -First 1).Matches.Value
    fnm use $ltsVersion
    fnm default $ltsVersion
    
    $nodeVersion = node -v
    $npmVersion = npm -v
    
    Write-Host "[SUCCESS] Node.js 安装完成: $nodeVersion" -ForegroundColor Green
    Write-Host "[SUCCESS] npm 版本: $npmVersion" -ForegroundColor Green
}

function Configure-NpmMirror {
    Write-Host "[INFO] 配置 npm 镜像..." -ForegroundColor Blue
    
    $response = Read-Host "是否配置淘宝镜像? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        npm config set registry https://registry.npmmirror.com
        Write-Host "[SUCCESS] 已配置淘宝镜像" -ForegroundColor Green
    } else {
        Write-Host "[INFO] 跳过镜像配置" -ForegroundColor Blue
    }
}

function Install-GlobalTools {
    Write-Host "[INFO] 安装常用全局工具..." -ForegroundColor Blue
    
    $tools = @("pnpm", "yarn", "nodemon", "serve")
    
    foreach ($tool in $tools) {
        $response = Read-Host "是否安装 $tool? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            npm install -g $tool
            Write-Host "[SUCCESS] $tool 安装完成" -ForegroundColor Green
        }
    }
}

function Verify-Installation {
    Write-Host "[INFO] 验证安装..." -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Node.js 版本:" -ForegroundColor Yellow
    node -v 2>$null
    if (-not $?) { Write-Host "未安装" }
    
    Write-Host "npm 版本:" -ForegroundColor Yellow
    npm -v 2>$null
    if (-not $?) { Write-Host "未安装" }
    
    Write-Host "fnm 版本:" -ForegroundColor Yellow
    fnm --version 2>$null
    if (-not $?) { Write-Host "未安装" }
    
    Write-Host "已安装的 Node.js 版本:" -ForegroundColor Yellow
    fnm list 2>$null
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
    Write-Host "  2. 验证安装: node -v; npm -v"
    Write-Host "  3. 安装 Claude Code CLI: npm install -g @anthropic-ai/claude-code"
    Write-Host ""
    Write-Host "fnm 常用命令:" -ForegroundColor Yellow
    Write-Host "  fnm install 18      # 安装 Node.js 18"
    Write-Host "  fnm use 18          # 切换到 Node.js 18"
    Write-Host "  fnm default 18      # 设为默认版本"
    Write-Host "  fnm list            # 查看已安装版本"
    Write-Host ""
}

Write-Banner
Install-Fnm
Write-Host ""
Configure-PowerShell
Write-Host ""
Install-NodeJS
Write-Host ""
Configure-NpmMirror
Write-Host ""
Install-GlobalTools
Write-Host ""
Verify-Installation
Print-NextSteps
