#!/bin/bash

# 阿里云 Coding Plan 快速配置脚本
# 适用于 macOS / Linux (WSL2)

set -e

echo "============================================"
echo "  阿里云 Coding Plan 一键配置脚本"
echo "============================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
check_node() {
    echo -e "${YELLOW}[1/5] 检查 Node.js 环境...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js 未安装，正在安装...${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        source "$NVM_DIR/nvm.sh"
        nvm install 22
        nvm use 22
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 20 ]; then
            echo -e "${RED}Node.js 版本过低 (${node_version})，需要 >= 20${NC}"
            echo "正在使用 nvm 安装 Node.js 22..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            source "$NVM_DIR/nvm.sh"
            nvm install 22
            nvm use 22
        else
            echo -e "${GREEN}Node.js 版本满足要求: $(node -v)${NC}"
        fi
    fi
}

# 安装 CLI 工具
install_clis() {
    echo -e "${YELLOW}[2/5] 安装 AI CLI 工具...${NC}"
    
    # 安装 Qwen Code CLI
    echo "安装 Qwen Code CLI..."
    npm install -g @qwen-code/qwen-code 2>/dev/null || echo "Qwen Code CLI 安装失败，跳过"
    
    # 安装 Codex CLI
    echo "安装 Codex CLI..."
    npm install -g @openai/codex-cli 2>/dev/null || echo "Codex CLI 安装失败，跳过"
    
    # 安装 OpenClaw
    echo "安装 OpenClaw..."
    npm install -g openclaw@latest 2>/dev/null || echo "OpenClaw 安装失败，跳过"
    
    echo -e "${GREEN}CLI 工具安装完成${NC}"
}

# 配置阿里云 API Key
configure_aliyun() {
    echo -e "${YELLOW}[3/5] 配置阿里云百炼 API...${NC}"
    
    echo "请输入您的阿里云百炼 API Key (sk-xxx):"
    read -r API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo -e "${RED}API Key 不能为空，配置取消${NC}"
        exit 1
    fi
    
    # 检测 shell 类型
    SHELL_RC=""
    if [ "$SHELL" = "/bin/zsh" ]; then
        SHELL_RC="$HOME/.zshrc"
    else
        SHELL_RC="$HOME/.bashrc"
    fi
    
    # 添加环境变量
    if ! grep -q "DASHSCOPE_API_KEY" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# 阿里云百炼 API Key" >> "$SHELL_RC"
        echo "export DASHSCOPE_API_KEY='$API_KEY'" >> "$SHELL_RC"
        echo "export OPENAI_API_KEY='$API_KEY'" >> "$SHELL_RC"
        echo -e "${GREEN}环境变量已添加到 $SHELL_RC${NC}"
    else
        echo -e "${YELLOW}环境变量已存在，跳过添加${NC}"
    fi
    
    # 设置当前会话环境变量
    export DASHSCOPE_API_KEY="$API_KEY"
    export OPENAI_API_KEY="$API_KEY"
    
    echo -e "${GREEN}API Key 配置完成${NC}"
}

# 配置 OpenClaw
configure_openclaw() {
    echo -e "${YELLOW}[4/5] 配置 OpenClaw...${NC}"
    
    # 创建 OpenClaw 配置目录
    mkdir -p "$HOME/.openclaw"
    
    # 写入 OpenClaw 配置文件
    cat > "$HOME/.openclaw/openclaw.json" << 'EOF'
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
        "apiKey": "${DASHSCOPE_API_KEY}",
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
EOF
    
    echo -e "${GREEN}OpenClaw 配置文件已创建${NC}"
}

# 启动服务并验证
verify_setup() {
    echo -e "${YELLOW}[5/5] 验证配置...${NC}"
    
    # 使环境变量生效
    SHELL_RC=""
    if [ "$SHELL" = "/bin/zsh" ]; then
        SHELL_RC="$HOME/.zshrc"
    else
        SHELL_RC="$HOME/.bashrc"
    fi
    source "$SHELL_RC"
    
    echo ""
    echo "============================================"
    echo "  配置完成！"
    echo "============================================"
    echo ""
    echo "已安装的工具："
    echo "  - Qwen Code CLI: qwen"
    echo "  - Codex CLI: codex-cli"
    echo "  - OpenClaw: openclaw"
    echo ""
    echo "支持的模型："
    echo "  - qwen-plus (默认)"
    echo "  - qwen3-max-2026-01.23"
    echo "  - glm-4-7"
    echo "  - kimi-k2.5"
    echo ""
    echo "下一步操作："
    echo "  1. 重新打开终端或运行: source ~/.bashrc (或 ~/.zshrc)"
    echo "  2. 启动 OpenClaw: openclaw gateway start"
    echo "  3. 访问控制台: openclaw dashboard"
    echo ""
    echo "如需切换模型，请编辑 ~/.openclaw/openclaw.json 中的 model 配置"
    echo ""
}

# 主函数
main() {
    check_node
    install_clis
    configure_aliyun
    configure_openclaw
    verify_setup
}

# 运行主函数
main
