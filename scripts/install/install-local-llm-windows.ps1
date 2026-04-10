# Windows 本地 LLM 安装脚本
# 运行方式：以管理员身份打开 PowerShell，执行 .\install-local-llm-windows.ps1
# 最后更新：2026-04-08

param(
    [string]$Action = "install",
    [string]$Model = ""
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Print-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Print-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Print-Banner {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "    Local LLM Installation for Windows" -ForegroundColor Magenta
    Write-Host "    本地大语言模型安装工具" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
}

# 检查 Ollama 是否已安装
function Test-OllamaInstalled {
    $ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
    if ($ollamaPath) {
        return $true
    }

    # 检查默认安装路径
    $defaultPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
    if (Test-Path $defaultPath) {
        return $true
    }

    return $false
}

# 安装 Ollama
function Install-Ollama {
    Print-Info "开始安装 Ollama..."

    if (Test-OllamaInstalled) {
        Print-Success "Ollama 已安装"
        $version = & ollama --version 2>&1
        Print-Info "当前版本: $version"
        return $true
    }

    # 检查 winget
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Print-Info "使用 winget 安装 Ollama..."
        winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements

        if ($LASTEXITCODE -eq 0) {
            Print-Success "Ollama 安装成功"
            return $true
        } else {
            Print-Warning "winget 安装失败，尝试手动下载..."
        }
    }

    # 手动下载
    Print-Info "准备手动下载 Ollama..."
    $downloadUrl = "https://ollama.com/download/windows"
    Print-Info "请在浏览器中打开以下链接下载安装："
    Write-Host $downloadUrl -ForegroundColor Blue
    Print-Info "下载完成后运行安装程序，然后重新运行此脚本。"

    return $false
}

# 检查 GPU 信息
function Get-GPUInfo {
    Print-Info "检测 GPU 信息..."

    try {
        $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
        $gpuName = $gpu.Name
        $gpuMemory = [math]::Round($gpu.AdapterRAM / 1GB, 2)

        Write-Host ""
        Write-Host "GPU 信息:" -ForegroundColor Yellow
        Write-Host "  名称: $gpuName"
        Write-Host "  显存: ${gpuMemory} GB"
        Write-Host ""

        # 推荐模型大小
        if ($gpuMemory -ge 24) {
            Print-Info "推荐模型: 27B-31B (如 qwen3.5:27b, gemma4:31b)"
        } elseif ($gpuMemory -ge 16) {
            Print-Info "推荐模型: 9B-27B (如 qwen3.5:9b, qwen3.5:27b, gemma4:e4b)"
        } elseif ($gpuMemory -ge 8) {
            Print-Info "推荐模型: 4B-9B (如 qwen3.5:9b, gemma4:e4b, qwen3.5:35b-a3b)"
        } elseif ($gpuMemory -ge 4) {
            Print-Info "推荐模型: 2B-4B (如 gemma4:e2b, gemma4:e4b)"
        } else {
            Print-Warning "显存较小，推荐使用小模型或 CPU 模式"
            Print-Info "推荐模型: gemma4:e2b, qwen3.5:35b-a3b (MoE 轻量版)"
        }

        return $gpuMemory
    } catch {
        Print-Warning "无法检测 GPU 信息"
        return 0
    }
}

# 下载模型
function Download-Model {
    param([string]$ModelName)

    if ([string]::IsNullOrEmpty($ModelName)) {
        Print-Error "请指定模型名称"
        Print-Info "示例: .\install-local-llm-windows.ps1 -Action download -Model qwen3.5:9b"
        return $false
    }

    Print-Info "下载模型: $ModelName"
    Print-Info "这可能需要几分钟，取决于模型大小和网络速度..."

    try {
        & ollama pull $ModelName
        Print-Success "模型 $ModelName 下载完成"
        return $true
    } catch {
        Print-Error "下载失败: $_"
        return $false
    }
}

# 列出已安装模型
function List-Models {
    Print-Info "已安装的模型:"
    Write-Host ""
    & ollama list
    Write-Host ""
}

# 运行模型
function Run-Model {
    param([string]$ModelName)

    if ([string]::IsNullOrEmpty($ModelName)) {
        Print-Error "请指定模型名称"
        Print-Info "示例: .\install-local-llm-windows.ps1 -Action run -Model qwen3.5:9b"
        return
    }

    Print-Info "启动模型: $ModelName"
    Print-Info "输入 /bye 退出对话"
    Write-Host ""

    & ollama run $ModelName
}

# 显示帮助
function Show-Help {
    Write-Host ""
    Write-Host "用法:" -ForegroundColor Yellow
    Write-Host "  .\install-local-llm-windows.ps1 -Action <action> [-Model <model>]"
    Write-Host ""
    Write-Host "操作 (Action):" -ForegroundColor Yellow
    Write-Host "  install     - 安装 Ollama (默认)"
    Write-Host "  gpu         - 检测 GPU 信息"
    Write-Host "  download    - 下载模型 (需要 -Model 参数)"
    Write-Host "  list        - 列出已安装模型"
    Write-Host "  run         - 运行模型 (需要 -Model 参数)"
    Write-Host "  help        - 显示帮助"
    Write-Host ""
    Write-Host "示例:" -ForegroundColor Yellow
    Write-Host "  .\install-local-llm-windows.ps1"
    Write-Host "  .\install-local-llm-windows.ps1 -Action gpu"
    Write-Host "  .\install-local-llm-windows.ps1 -Action download -Model qwen3.5:9b"
    Write-Host "  .\install-local-llm-windows.ps1 -Action download -Model gemma4:e4b"
    Write-Host "  .\install-local-llm-windows.ps1 -Action list"
    Write-Host "  .\install-local-llm-windows.ps1 -Action run -Model qwen3.5:9b"
    Write-Host ""
    Write-Host "Qwen 3.5 模型 (阿里巴巴, 2026-02 发布):" -ForegroundColor Yellow
    Write-Host "  qwen3.5            - 默认 9B [推荐]"
    Write-Host "  qwen3.5:27b        - 27B 大型"
    Write-Host "  qwen3.5:35b-a3b    - MoE, 35B/3B 激活, 高效轻量"
    Write-Host "  qwen3.5:122b-a10b  - MoE, 122B/10B 激活, 旗舰级"
    Write-Host ""
    Write-Host "Gemma 4 模型 (Google, 2026-04 发布):" -ForegroundColor Yellow
    Write-Host "  gemma4:e2b         - 2.3B 有效参数, 边缘设备 (约 7.2GB)"
    Write-Host "  gemma4             - 默认 e4b [推荐] (约 9.6GB)"
    Write-Host "  gemma4:26b         - 26B 参数, 大型"
    Write-Host "  gemma4:31b         - 31B 参数, 旗舰级"
    Write-Host ""
}

# 主程序
function Main {
    Print-Banner

    switch ($Action.ToLower()) {
        "install" {
            Install-Ollama
            if (Test-OllamaInstalled) {
                Get-GPUInfo
                Write-Host ""
                Print-Success "安装完成！"
                Print-Info "下一步："
                Write-Host "  1. 下载 Qwen 3.5: .\install-local-llm-windows.ps1 -Action download -Model qwen3.5"
                Write-Host "  2. 下载 Gemma 4:  .\install-local-llm-windows.ps1 -Action download -Model gemma4"
                Write-Host "  3. 运行模型:      ollama run qwen3.5"
            }
        }
        "gpu" {
            Get-GPUInfo
        }
        "download" {
            if (-not (Test-OllamaInstalled)) {
                Print-Error "请先安装 Ollama"
                Print-Info "运行: .\install-local-llm-windows.ps1 -Action install"
                return
            }
            Download-Model -ModelName $Model
        }
        "list" {
            if (-not (Test-OllamaInstalled)) {
                Print-Error "请先安装 Ollama"
                return
            }
            List-Models
        }
        "run" {
            if (-not (Test-OllamaInstalled) ) {
                Print-Error "请先安装 Ollama"
                return
            }
            Run-Model -ModelName $Model
        }
        "help" {
            Show-Help
        }
        default {
            Print-Error "未知操作: $Action"
            Show-Help
        }
    }
}

Main
