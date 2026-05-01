---
title: "Claude Code + GLM 5.1 + DeepSeek V4 安装指南"
description: "一次性安装 Claude Code，配置 GLM 5.1 和 DeepSeek V4 模型，使用 Coding Tool Helper 自动化管理"
difficulty: beginner
duration: 15
category: dev-tools
tags: ["claude-code", "glm", "deepseek", "ai", "setup", "coding-helper"]
---

# Claude Code + GLM 5.1 + DeepSeek V4 安装指南

> 本教程将指导你一次性完成 Claude Code 的安装，并配置 GLM 5.1 和 DeepSeek V4 两个模型源，使用智谱官方 **Coding Tool Helper** 自动化工具简化配置流程。

---

## 前置要求

- **Node.js 18+**（建议 20+）
- **Git**（Windows 用户需安装 Git for Windows）
- **macOS / Linux / WSL / Windows** 均可

验证 Node.js 版本：

```bash
node -v
```

---

## 步骤 1：安装 Claude Code

### macOS / Linux / WSL（推荐）

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows PowerShell

```powershell
irm https://claude.ai/install.ps1 | iex
```

### 验证安装

```bash
claude --version
```

---

## 步骤 2：使用 Coding Tool Helper 配置 GLM 5.1

**Coding Tool Helper（`@z_ai/coding-helper`）** 是智谱官方提供的 CLI 工具，可自动完成：

- Claude Code 检测与配置
- GLM Coding Plan 套餐加载
- API Key 设置
- MCP 服务器管理

### 运行 Coding Tool Helper

```bash
npx @z_ai/coding-helper
```

按界面提示操作：

1. **选择语言** → 中文 / English
2. **选择 Coding Plan** → Global Plan 或 China Plan
3. **输入 API Key** → 从 [智谱开放平台](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 获取
4. **选择工具** → 勾选 **Claude Code**
5. **加载套餐** → 自动将 GLM 5.1 模型配置写入 Claude Code

配置完成后，Claude Code 默认使用 GLM 模型：

| Claude Code 模型角色 | GLM 映射模型 |
|---------------------|-------------|
| Opus                | `glm-5.1`   |
| Sonnet              | `glm-5.1`   |
| Haiku               | `glm-4.5-air` |

---

## 步骤 3：配置 DeepSeek V4

DeepSeek V4 通过 **Anthropic API 兼容协议** 接入 Claude Code。

### 获取 DeepSeek API Key

访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并创建 API Key。

### 配置环境变量

#### macOS / Linux / WSL

```bash
export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
export ANTHROPIC_MODEL="deepseek-v4-pro"
export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro"
export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
export CLAUDE_CODE_EFFORT_LEVEL="max"
```

#### Windows PowerShell

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

### 持久化配置（推荐）

将上述 `export` 命令写入 shell 配置文件：

```bash
# macOS / Linux (zsh)
echo 'export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"' >> ~/.zshrc
# ... 其他变量同理

source ~/.zshrc
```

---

## 步骤 4：验证配置

进入任意项目目录，启动 Claude Code：

```bash
cd /path/to/your-project
claude
```

在 Claude Code 交互界面中输入：

```
/showdoc
```

或查看当前模型配置：

```
/model
```

如果显示 `deepseek-v4-pro` 或 `glm-5.1`，则配置成功。

---

## 一次性安装脚本（macOS / Linux）

以下脚本可一次性完成 Claude Code 安装 + GLM 5.1 / DeepSeek V4 配置：

```bash
#!/bin/bash
set -e

echo "🚀 开始安装 Claude Code + GLM 5.1 + DeepSeek V4..."

# 1. 安装 Claude Code
if ! command -v claude &> /dev/null; then
  echo "📦 安装 Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
else
  echo "✅ Claude Code 已安装"
fi

# 2. 配置 GLM 5.1（交互式，需手动输入 API Key）
echo ""
echo "🧠 启动 Coding Tool Helper 配置 GLM 5.1..."
echo "   请按提示选择语言、Plan 套餐、输入 API Key 并勾选 Claude Code"
npx @z_ai/coding-helper

# 3. 配置 DeepSeek V4（需替换 <YOUR_DEEPSEEK_API_KEY>）
echo ""
echo "⚙️  配置 DeepSeek V4 环境变量..."

deepseek_key="<YOUR_DEEPSEEK_API_KEY>"

if [ "$deepseek_key" = "<YOUR_DEEPSEEK_API_KEY>" ]; then
  echo "⚠️  请编辑脚本，将 <YOUR_DEEPSEEK_API_KEY> 替换为你的真实 DeepSeek API Key"
  exit 1
fi

# 写入 ~/.zshrc（如使用 bash 请改为 ~/.bashrc）
shell_rc="$HOME/.zshrc"

append_env() {
  local key="$1"
  local val="$2"
  if ! grep -q "^export $key=" "$shell_rc" 2>/dev/null; then
    echo "export $key=\"$val\"" >> "$shell_rc"
  fi
}

append_env "ANTHROPIC_BASE_URL" "https://api.deepseek.com/anthropic"
append_env "ANTHROPIC_AUTH_TOKEN" "$deepseek_key"
append_env "ANTHROPIC_MODEL" "deepseek-v4-pro"
append_env "ANTHROPIC_DEFAULT_OPUS_MODEL" "deepseek-v4-pro"
append_env "ANTHROPIC_DEFAULT_SONNET_MODEL" "deepseek-v4-pro"
append_env "ANTHROPIC_DEFAULT_HAIKU_MODEL" "deepseek-v4-flash"
append_env "CLAUDE_CODE_SUBAGENT_MODEL" "deepseek-v4-flash"
append_env "CLAUDE_CODE_EFFORT_LEVEL" "max"

source "$shell_rc"

echo ""
echo "✅ 安装完成！"
echo ""
echo "📋 验证命令："
echo "   claude --version"
echo "   cd /path/to/project && claude"
echo ""
echo "💡 模型切换提示："
echo "   - GLM 5.1：通过 coding-helper 重新加载套餐"
echo "   - DeepSeek V4：确保环境变量已设置，直接启动 claude"
echo ""
```

**使用方法**：

1. 复制脚本保存为 `install-cc-glm-ds.sh`
2. 将 `<YOUR_DEEPSEEK_API_KEY>` 替换为你的真实 Key
3. 执行：

```bash
chmod +x install-cc-glm-ds.sh
./install-cc-glm-ds.sh
```

---

## 模型切换速查表

| 场景 | 操作 |
|------|------|
| 切换到 GLM 5.1 | `npx @z_ai/coding-helper` → 重新加载套餐 |
| 切换到 DeepSeek V4 | 确保 DeepSeek 环境变量生效，重启 `claude` |
| 查看当前模型 | 在 Claude Code 中输入 `/model` |
| 查看配置 | `cat ~/.claude/settings.json` |

---

## 常见问题

### Q1: Claude Code 无法识别 `claude` 命令？

确保 Node.js 全局 bin 目录在 PATH 中：

```bash
export PATH="$PATH:$(npm config get prefix)/bin"
```

### Q2: GLM 配置后 Claude Code 仍使用官方模型？

检查 `~/.claude/settings.json` 中的 `env` 配置是否被覆盖，或重新运行 `coding-helper` 加载套餐。

### Q3: DeepSeek V4 返回 400 错误？

DeepSeek V4 默认启用思考模式，需确保对话历史完整。建议：

- 不要在同一会话中混用不同厂商模型
- 遇到错误时重启 Claude Code 开启新会话
- 确保 API 网关/代理完整透传 `reasoning_content` 字段

### Q4: 如何同时管理 GLM 和 DeepSeek？

Claude Code 同一时间只能使用一个 API 后端。推荐方案：

- **方式一**：使用 `coding-helper` 快速切换 GLM 套餐
- **方式二**：使用 `cc-switch` 桌面 GUI 工具（支持一键切换 API 配置）
- **方式三**：准备两组 shell alias，分别设置对应的环境变量后启动 `claude`

---

## 相关链接

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [智谱 Coding Tool Helper 文档](https://docs.bigmodel.cn/cn/guide/develop/crush)
- [DeepSeek API 文档](https://api-docs.deepseek.com/)
- [GLM 编码套餐](https://www.bigmodel.cn/glm-coding)

---

*本教程为一次性安装指南，配置完成后即可在任意项目目录使用 `claude` 命令启动 AI 编程助手。*
