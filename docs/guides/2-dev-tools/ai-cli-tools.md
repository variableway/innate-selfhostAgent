# AI CLI 工具安装指南

> 命令行中的 AI 助手

## 概述

AI CLI 工具让你在终端中直接使用 AI 能力，无需打开浏览器。

---

## Claude Code CLI

Claude Code 是 Anthropic 官方的命令行 AI 编程助手。

### 安装

**前置条件：** 需要先安装 Node.js 18+

```bash
# 全局安装
npm install -g @anthropic-ai/claude-code

# 或使用 npx（无需安装）
npx @anthropic-ai/claude-code
```

### 首次使用

```bash
# 启动 Claude Code
claude

# 首次运行会提示登录
# 按提示完成 Anthropic 账号授权
```

### 常用命令

```bash
# 交互式对话
claude

# 单次提问
claude "解释这段代码的作用"

# 分析文件
claude "review 这个文件" --file app.js

# 执行任务
claude "帮我重构这个函数"

# 查看帮助
claude --help
```

### 配置

```bash
# 设置 API Key（如果有）
export ANTHROPIC_API_KEY="your-api-key"

# 配置文件位置
~/.claude/config.json
```

### 官方链接
- [GitHub](https://github.com/anthropics/claude-code)
- [文档](https://docs.anthropic.com/claude-code)

---

## 其他 AI CLI 工具

### OpenAI Codex CLI

```bash
# 安装
npm install -g @openai/codex-cli

# 使用
codex "创建一个 React 组件"
```

### GitHub Copilot CLI

```bash
# 安装
npm install -g @githubnext/github-copilot-cli

# 使用
github-copilot "解释这个命令的意思"
```

### Aider

Aider 是一个 AI 配对编程工具，支持多种模型。

```bash
# 安装
pip install aider-chat

# 使用（需要 OpenAI API Key）
aider --openai-api-key YOUR_KEY

# 使用 Claude
aider --anthropic-api-key YOUR_KEY
```

### 官方链接
- [Aider](https://github.com/paul-gauthier/aider)

---

## 对比表

| 工具 | 提供商 | 模型 | 特点 |
|------|--------|------|------|
| Claude Code | Anthropic | Claude 4 | 官方、强大 |
| Codex CLI | OpenAI | GPT-4 | OpenAI 生态 |
| Copilot CLI | GitHub | GPT-4 | GitHub 集成 |
| Aider | 开源 | 多模型 | 灵活、支持本地模型 |

---

## 故障排除

### Q: Claude Code 登录失败？

```bash
# 清除缓存重新登录
rm -rf ~/.claude
claude
```

### Q: API Key 无效？

```bash
# 检查环境变量
echo $ANTHROPIC_API_KEY

# 确保格式正确（以 sk-ant- 开头）
```

### Q: 网络问题？

```bash
# 配置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

---

## 下一步

- [Python 环境配置](python-setup.md)
- [IDE 选择与配置](ide-setup.md)
