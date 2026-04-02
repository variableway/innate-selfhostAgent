# 阿里云 Coding Plan 配置

本教程将一步一步指导您完成阿里云 Coding Plan 的配置，实现多种 AI 编程工具的集成。

## 目录

1. [前置准备：开通阿里云百炼 Coding Plan](#1-前置准备开通阿里云百炼-coding-plan)
2. [Claude Code CLI 配置阿里云 Coding Plan](#2-claude-code-cli-配置阿里云-coding-plan)
3. [Qwen Code CLI 配置](#3-qwen-code-cli-配置)
4. [IDE 配置](#4-ide-配置)
   - [OpenCode](#41-opencode)
   - [Codex CLI](#42-codex-cli)
   - [OpenClaw](#43-openclaw)
   - [Claude Code IDE 插件](#44-claude-code-ide-插件)

---

## 1. 前置准备：开通阿里云百炼 Coding Plan

### 1.1 登录阿里云百炼平台

1. 访问 [阿里云百炼大模型服务平台](https://www.aliyun.com/product/bailian)
2. 登录您的阿里云账号
3. 进入控制台

### 1.2 开通 Coding Plan 订阅

1. 在页面中找到 Coding Plan 订阅入口
2. 选择适合您的套餐（**新客首月低至 0.3 元/天**）
3. 完成支付订阅

### 1.3 获取 API Key

1. 在左侧导航栏选择 **密钥管理**
2. 点击 **创建 API Key**
3. 复制并保存好 API Key（格式为 `sk-xxx`）

> **注意**：如果使用 Coding Plan，需要使用专属的 API Key，其调用地址与普通百炼 API 不同。

### 1.4 阿里云百炼支持的编程模型

Coding Plan 已支持以下主流编程模型：

| 模型名称 | 模型代码 | 特点 |
|---------|---------|------|
| 通义千问 Max Thinking | qwen3-max-2026-01-23 | 旗舰推理模型，适合复杂任务 |
| 通义千问 Plus | qwen-plus | 效果与速度均衡，推荐日常使用 |
| Qwen3-Coder-Next | qwen3-coder-next | 专注于代码生成 |
| GLM-4.7 | glm-4-7 | 智谱AI模型，支持中文 |
| Kimi-K2.5 | kimi-k2.5 | 月之暗面模型，长文本理解强 |

---

## 2. Claude Code CLI 配置阿里云 Coding Plan

Claude Code CLI 可以通过配置使用阿里云百炼的模型。

### 2.1 安装 Claude Code CLI

```bash
# 使用 npm 全局安装
npm install -g @anthropic/claude-code-cli

# 或使用 npx 直接运行
npx @anthropic/claude-code-cli
```

### 2.2 配置阿里云 API

Claude Code CLI 默认使用 Anthropic 的 Claude 模型，要使用阿里云模型，需要通过 OpenAI 兼容接口配置。

#### 方法一：环境变量配置

```bash
# 设置阿里云百炼 API Key
# Coding Plan 用户使用以下地址
export DASHSCOPE_API_KEY="您的Coding Plan API Key"

# 或者使用普通百炼 API
export DASHSCOPE_API_KEY="您的百炼 API Key"
```

#### 方法二：配置文件配置

创建或编辑配置文件 `~/.claude-code-cli/config.json`：

```json
{
  "model": {
    "provider": "openai",
    "name": "qwen-plus",
    "config": {
      "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
      "apiKey": "${DASHSCOPE_API_KEY}",
      "model": "qwen-plus"
    }
  }
}
```

### 2.3 验证配置

```bash
# 查看配置
claude-code-cli config show

# 测试模型调用
claude-code-cli "你好，请介绍一下自己"
```

---

## 3. Qwen Code CLI 配置

Qwen Code CLI 是阿里巴巴官方推出的命令行 AI 编程工具，专为 Qwen3-Coder 模型优化。

### 3.1 安装 Qwen Code CLI

```bash
# 全局安装
npm install -g @qwen-code/qwen-code

# 验证安装
qwen --version
```

### 3.2 配置阿里云 API Key

```bash
# 设置环境变量
export OPENAI_API_KEY="您的阿里云百炼 API Key"

# 如果在中国大陆，设置对应的 base_url
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
```

### 3.3 初始化配置

```bash
# 初始化 qwen
qwen init

# 按照提示完成配置
# 模型选择：qwen3-coder-plus 或 qwen-plus
```

### 3.4 使用示例

```bash
# 生成代码
qwen generate "创建一个 Python 函数计算斐波那契数列"

# 解释代码
qwen explain <文件路径>

# 代码补全
qwen complete <文件路径>
```

### 3.5 支持的模型列表

通过 Qwen Code CLI 可使用的模型：

| 模型 | 使用方式 |
|-----|---------|
| qwen3-coder-plus | 代码生成首选 |
| qwen3-coder-next | 下一代coder模型 |
| qwen-plus | 通用对话与代码 |
| qwen3-max-2026-01-23 | 复杂推理任务 |

---

## 4. IDE 配置

### 4.1 OpenCode

OpenCode 是一款专为终端打造的 AI 编程助手。

#### 4.1.1 安装

```bash
# macOS / Linux
curl -fsSL https://opencode.ai/install.sh | bash

# Windows (PowerShell)
iwr -useb https://opencode.ai/install.ps1 | iex
```

#### 4.1.2 配置阿里云模型

```bash
# 初始化配置
opencode configure
```

在配置过程中选择：

1. **Model Provider**: 选择 "OpenAI Compatible"
2. **API Key**: 输入您的阿里云百炼 API Key
3. **Base URL**: 
   - Coding Plan 用户：`https://coding.dashscope.aliyuncs.com/v1`
   - 普通用户：`https://dashscope.aliyuncs.com/compatible-mode/v1`
4. **Model Name**: 选择 `qwen-plus` 或 `qwen3-coder-plus`

#### 4.1.3 环境变量配置

```bash
# 持久化配置
echo 'export DASHSCOPE_API_KEY="您的API Key"' >> ~/.bashrc
source ~/.bashrc
```

---

### 4.2 Codex CLI

Codex CLI 是 OpenAI 提供的命令行工具。

#### 4.2.1 安装

```bash
# 全局安装
npm install -g @openai/codex-cli

# 验证安装
codex-cli --version
```

#### 4.2.2 配置阿里云模型

Codex CLI 支持 OpenAI 兼容接口，可以通过环境变量配置使用阿里云模型：

```bash
# 设置阿里云 API
export OPENAI_API_KEY="您的阿里云百炼 API Key"
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"

# 运行时指定模型
codex-cli --model qwen-plus "您的代码请求"
```

#### 4.2.3 配置文件方式

创建 `~/.codex-cli/config.json`：

```json
{
  "model": "qwen-plus",
  "api_key": "${OPENAI_API_KEY}",
  "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1"
}
```

---

### 4.3 OpenClaw

OpenClaw（原名 Clawdbot/Moltbot）是一款开源的 AI 个人助手，支持本地部署。

#### 4.3.1 安装

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash

# Windows (推荐使用 WSL2)
# 或者 npm 全局安装
npm install -g openclaw@latest
```

#### 4.3.2 初始配置

```bash
# 启动 onboarding
openclaw onboard
```

按照提示选择：
- Onboarding mode: `QuickStart`
- Model/auth provider: `Skip for now`（后续手动配置）

#### 4.3.3 配置阿里云百炼 API

**第一步：设置环境变量**

```bash
# 添加 API Key 到环境变量
echo 'export DASHSCOPE_API_KEY="您的Coding Plan API Key"' >> ~/.zshrc
source ~/.zshrc
```

**第二步：修改配置文件**

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "bailian/qwen-plus" },
      "models": {
        "bailian/qwen-plus": { "alias": "通义千问 Plus" }
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
          }
        ]
      }
    }
  }
}
```

> **注意**：如果是普通百炼 API（非 Coding Plan），将 `baseUrl` 改为 `https://dashscope.aliyuncs.com/compatible-mode/v1`

#### 4.3.4 支持的模型配置

| 模型 | model id | 配置要点 |
|-----|----------|---------|
| qwen-plus | qwen-plus | 通用场景 |
| qwen3-max-2026-01-23 | qwen3-max-2026-01-23 | 复杂推理 |
| glm-4-7 | glm-4-7 | 中文优化 |
| kimi-k2.5 | kimi-k2.5 | 长文本 |

#### 4.3.5 验证配置

```bash
# 重启服务
openclaw gateway restart

# 查看模型列表
openclaw models list

# 测试模型
openclaw agent --agent main --message "你好"
```

---

### 4.4 Claude Code IDE 插件

在 VSCode 或其他 IDE 中使用 Claude Code 插件连接阿里云模型。

#### 4.4.1 安装插件

1. 打开 VSCode
2. 搜索 "Claude Code" 扩展
3. 点击安装

#### 4.4.2 配置阿里云 API

在 VSCode 设置中添加：

```json
{
  "claudeCode.apiKey": "${DASHSCOPE_API_KEY}",
  "claudeCode.endpoint": "https://coding.dashscope.aliyuncs.com/v1",
  "claudeCode.model": "qwen-plus"
}
```

或者通过环境变量：

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export DASHSCOPE_API_KEY="您的API Key"
```

#### 4.4.3 使用模型切换

在插件设置中可以指定使用的模型：

- `qwen-plus` - 均衡选择
- `qwen3-coder-plus` - 代码专用
- `glm-4-7` - 中文优化
- `kimi-k2.5` - 长文本理解

---

## 常见问题

### Q1: Coding Plan API Key 和普通百炼 API Key 有什么区别？

Coding Plan 是订阅制，API Key 有专属的调用地址：
- **Coding Plan**: `https://coding.dashscope.aliyuncs.com/v1`
- **普通百炼**: `https://dashscope.aliyuncs.com/compatible-mode/v1`

### Q2: 模型调用速度慢怎么办？

1. 选择距离您最近的地域（北京/新加坡/弗吉尼亚）
2. Coding Plan 用户确保使用 Coding Plan 专属 API Key

### Q3: 如何查看 API 使用量？

登录阿里云百炼控制台，在"用量统计"中查看。

### Q4: 支持哪些模型切换？

在阿里云百炼控制台可以一键切换以下模型，无需更改任何配置：
- qwen-plus
- qwen3-max-2026-01-23
- glm-4-7
- kimi-k2.5

---

## 相关链接

- [阿里云百炼控制台](https://dashscope.console.aliyun.com/)
- [Coding Plan 订阅](https://www.aliyun.com/product/bailian)
- [OpenClaw 官方文档](https://openclaw.ai/)
- [Qwen Code CLI GitHub](https://github.com/Qwen/qwen-code)
