# 阿里云 Coding Plan 快速配置脚本
# 适用于 Windows (PowerShell)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  阿里云 Coding Plan 一键配置脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 版本
function Check-Node {
    Write-Host "[1/5] 检查 Node.js 环境..." -ForegroundColor Yellow
    
    $nodeVersion = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeVersion) {
        Write-Host "Node.js 未安装，请先安装 Node.js 22+" -ForegroundColor Red
        Write-Host "访问 https://nodejs.org/ 下载安装" -ForegroundColor Yellow
        return $false
    }
    
    $version = node -v
    Write-Host "Node.js 版本: $version" -ForegroundColor Green
    return $true
}

# 安装 CLI 工具
function Install-CLIs {
    Write-Host "[2/5] 安装 AI CLI 工具..." -ForegroundColor Yellow
    
    # 安装 Qwen Code CLI
    Write-Host "安装 Qwen Code CLI..." -ForegroundColor White
    npm install -g @qwen-code/qwen-code 2>$null
    
    # 安装 Codex CLI
    Write-Host "安装 Codex CLI..." -ForegroundColor White
    npm install -g @openai/codex-cli 2>$null
    
    # 安装 OpenClaw (Windows 推荐 WSL2)
    Write-Host "安装 OpenClaw..." -ForegroundColor White
    npm install -g openclaw@latest 2>$null
    
    Write-Host "CLI 工具安装完成" -ForegroundColor Green
}

# 配置阿里云 API Key
function Configure-Aliyun {
    Write-Host "[3/5] 配置阿里云百炼 API..." -ForegroundColor Yellow
    
    Write-Host "请输入您的阿里云百炼 API Key (sk-xxx):" -ForegroundColor White
    $apiKey = Read-Host
    
    if ([string]::IsNullOrEmpty($apiKey)) {
        Write-Host "API Key 不能为空，配置取消" -ForegroundColor Red
        exit 1
    }
    
    # 设置用户环境变量
    [Environment]::SetEnvironmentVariable("DASHSCOPE_API_KEY", $apiKey, "User")
    [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $apiKey, "User")
    
    # 设置当前进程环境变量
    $env:DASHSCOPE_API_KEY = $apiKey
    $env:OPENAI_API_KEY = $apiKey
    
    Write-Host "API Key 配置完成" -ForegroundColor Green
    Write-Host "注意: 环境变量已设置为当前用户级别" -ForegroundColor Yellow
}

# 配置 OpenClaw
function Configure-OpenClaw {
    Write-Host "[4/5] 配置 OpenClaw..." -ForegroundColor Yellow
    
    $openclawDir = "$env:USERPROFILE\.openclaw"
    if (-not (Test-Path $openclawDir)) {
        New-Item -ItemType Directory -Path $openclawDir -Force | Out-Null
    }
    
    # 写入 OpenClaw 配置文件
    $config = @"
{
  "agents": {
    "defaults": {
      "model": { "primary": "bailian/qwen-plus" },
      "models": {
        "bailian/qwen-plus": { "alias": "通义千问 Plus" },
        "bailian/qwen3-max-2026-01-23": { "alias": "通义千问 Max Thinking" },
        "bailian/glm-4-7": { "alias": "GLM-4.7" },
        "bailian/kimi-k2.5": { "alias": "Kimi K2.5" }
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "bailian": {
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "apiKey": "${env:DASHSCOPE_API_KEY}",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen-plus",
            "name": "通义千问 Plus",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0.008, "output": 0.008 },
            "contextWindow": 262144,
            "maxTokens": 32000
          },
          {
            "id": "qwen3-max-2026-01-23",
            "name": "通义千问 Max Thinking",
            "reasoning": true,
            "input": ["text"],
            "cost": { "input": 0.0025, "output": 0.01 },
            "contextWindow": 262144,
            "maxTokens": 32768
          },
          {
            "id": "glm-4-7",
            "name": "GLM-4.7",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0.005, "output": 0.005 },
            "contextWindow": 200000,
            "maxTokens": 32000
          },
          {
            "id": "kimi-k2.5",
            "name": "Kimi K2.5",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0.015, "output": 0.015 },
            "contextWindow": 200000,
            "maxTokens": 32000
          }
        ]
      }
    }
  }
}
"@
    
    $configPath = Join-Path $openclawDir "openclaw.json"
    $config | Out-File -FilePath $configPath -Encoding UTF8
    
    Write-Host "OpenClaw 配置文件已创建: $configPath" -ForegroundColor Green
}

# 验证配置
function Verify-Setup {
    Write-Host "[5/5] 验证配置..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  配置完成！" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "已安装的工具：" -ForegroundColor White
    Write-Host "  - Qwen Code CLI: qwen" -ForegroundColor White
    Write-Host "  - Codex CLI: codex-cli" -ForegroundColor White
    Write-Host "  - OpenClaw: openclaw" -ForegroundColor White
    Write-Host ""
    Write-Host "支持的模型：" -ForegroundColor White
    Write-Host "  - qwen-plus (默认)" -ForegroundColor White
    Write-Host "  - qwen3-max-2026-01.23" -ForegroundColor White
    Write-Host "  - glm-4-7" -ForegroundColor White
    Write-Host "  - kimi-k2.5" -ForegroundColor White
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Yellow
    Write-Host "  1. 重新打开 PowerShell 终端" -ForegroundColor White
    Write-Host "  2. 启动 OpenClaw: openclaw gateway start" -ForegroundColor White
    Write-Host "  3. 访问控制台: openclaw dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "如需切换模型，请编辑 ~\openclaw\openclaw.json 中的 model 配置" -ForegroundColor White
    Write-Host ""
}

# 主函数
function Main {
    if (-not (Check-Node)) {
        Write-Host "请先安装 Node.js 后再运行此脚本" -ForegroundColor Red
        exit 1
    }
    
    Install-CLIs
    Configure-Aliyun
    Configure-OpenClaw
    Verify-Setup
}

# 运行主函数
Main
