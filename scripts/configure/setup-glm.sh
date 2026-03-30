#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    GLM API Key 一键配置脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

API_KEY="${ANTHROPIC_AUTH_TOKEN:-}"

if [ -z "$API_KEY" ]; then
    echo -e "${YELLOW}请输入您的智谱 GLM API Key:${NC}"
    echo -e "${YELLOW}(可从 https://open.bigmodel.cn/ 获取)${NC}"
    read -p "> " API_KEY
fi

if [ -z "$API_KEY" ]; then
    echo -e "${RED}错误: API Key 不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}正在配置...${NC}"

if [ -f ~/.zshrc ]; then
    SHELL_RC=~/.zshrc
elif [ -f ~/.bashrc ]; then
    SHELL_RC=~/.bashrc
else
    SHELL_RC=~/.bashrc
    touch "$SHELL_RC"
fi

if grep -q "ANTHROPIC_AUTH_TOKEN" "$SHELL_RC" 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/export ANTHROPIC_AUTH_TOKEN=.*/export ANTHROPIC_AUTH_TOKEN='$API_KEY'/" "$SHELL_RC"
    else
        sed -i "s/export ANTHROPIC_AUTH_TOKEN=.*/export ANTHROPIC_AUTH_TOKEN='$API_KEY'/" "$SHELL_RC"
    fi
    echo -e "${GREEN}✓ 已更新 $SHELL_RC 中的 ANTHROPIC_AUTH_TOKEN${NC}"
else
    echo "" >> "$SHELL_RC"
    echo "# GLM API Key" >> "$SHELL_RC"
    echo "export ANTHROPIC_AUTH_TOKEN='$API_KEY'" >> "$SHELL_RC"
    echo -e "${GREEN}✓ 已添加 ANTHROPIC_AUTH_TOKEN 到 $SHELL_RC${NC}"
fi

export ANTHROPIC_AUTH_TOKEN="$API_KEY"
echo -e "${GREEN}✓ 已设置当前会话的环境变量${NC}"

CLAUDE_DIR="$HOME/.claude"
CLAUDE_SETTINGS="$CLAUDE_DIR/settings.json"

mkdir -p "$CLAUDE_DIR"

if [ -f "$CLAUDE_SETTINGS" ]; then
    echo -e "${YELLOW}检测到已存在 Claude Code 配置文件${NC}"
    echo -e "${YELLOW}请手动编辑 $CLAUDE_SETTINGS 添加以下内容:${NC}"
    echo ""
    echo -e "${BLUE}  \"env\": {${NC}"
    echo -e "${BLUE}    \"ANTHROPIC_DEFAULT_HAIKU_MODEL\": \"GLM-4.5-air\",${NC}"
    echo -e "${BLUE}    \"ANTHROPIC_DEFAULT_SONNET_MODEL\": \"GLM-5.1\",${NC}"
    echo -e "${BLUE}    \"ANTHROPIC_DEFAULT_OPUS_MODEL\": \"GLM-5.1\"${NC}"
    echo -e "${BLUE}  }${NC}"
else
    cat > "$CLAUDE_SETTINGS" << 'EOF'
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "${API_KEY}",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/coding/paas/v4",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "GLM-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "GLM-5.1",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "GLM-5.1"
  }
}
EOF
    echo -e "${GREEN}✓ 已创建 Claude Code 配置文件 ($CLAUDE_SETTINGS)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    配置完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}请执行以下命令使环境变量生效:${NC}"
echo ""
echo -e "  ${BLUE}source $SHELL_RC${NC}"
echo ""
echo -e "${YELLOW}或在新的终端窗口中开始使用${NC}"
echo ""
echo -e "${YELLOW}验证配置:${NC}"
echo -e "  ${BLUE}echo \$API_KEY${NC}"
echo ""
