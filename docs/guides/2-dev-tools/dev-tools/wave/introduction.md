# Wave Terminal

Wave Terminal 是一个现代化的、开源、跨平台的终端模拟器，内置 AI 支持。

## 安装

| 平台 | 命令 |
|--------|---------|
| Windows | `winget install Wave.Wave` |
| macOS | `brew install --cask wave` |

## Wave AI 配置

配置文件：`~/.config/waveterm/waveai.json`

```bash
wsh editconfig waveai.json          # 打开配置
wsh setconfig waveai:defaultmode="kimi"  # 设置默认
```

---

## AI Provider 完整对照表

### 国际云服务

| Provider | 类型 | API URL | 模型示例 | Secret Name |
|----------|------|---------|----------|-------------|
| OpenAI | 内置 | `api.openai.com` | gpt-4o, gpt-4-turbo | `openai-api-key` |
| OpenRouter | 内置 | `openrouter.ai` | anthropic/claude-3.5-sonnet, openai/gpt-4o | `openrouter-api-key` |
| Groq | 内置 | `api.groq.com` | llama-3.3-70b-versatile, mixtral-8x7b | `groq-api-key` |
| Google Gemini | 内置 | `generativelanguage.googleapis.com` | gemini-2.0-flash, gemini-1.5-pro | `google-api-key` |
| NanoGPT | 内置 | `nano-gpt.com` | 多种模型 | `nanogpt-api-key` |

### 国内云服务
| 服务 | 类型 | API URL | 最新模型 | Secret Name |
|------|------|---------|----------|-------------|
| Kimi (月之暗面) | 自定义 | `api.moonshot.cn` | **kimi-k2.5** (最新), kimi-k2, moonshot-v1-128k | `kimi-api-key` |
| GLM (智谱) | 自定义 | `open.bigmodel.cn` | **glm-4.1** (最新), glm-4-flash, glm-4-plus | `glm-api-key` |
| 通义千问 (阿里) | 自定义 | `dashscope.aliyuncs.com` | **qwen-3** (最新), qwen-max, qwen-plus, qwen-turbo | `qwen-api-key` |
| DeepSeek | 自定义 | `api.deepseek.com` | **DeepSeek-V3** (最新), deepseek-chat, deepseek-coder | `deepseek-api-key` |
| 百度文心 | 自定义 | `aip.baidubce.com` | ernie-4.0, ernie-3.5-turbo | `ernie-api-key` |
| MiniMax | 自定义 | `api.minimax.chat` | **MiniMax-01** (最新), abab6.5s-chat, abab5.5-chat | `minimax-api-key` |

### 本地模型

| 工具 | 默认端口 | API URL | 模型示例 |
|------|----------|---------|----------|
| Ollama | 11434 | `localhost:11434/v1/chat/completions` | llama3.2, qwen2.5, mistral |
| LM Studio | 1234 | `localhost:1234/v1/chat/completions` | 用户下载的模型 |
| vLLM | 8000 | `localhost:8000/v1/chat/completions` | 用户加载的模型 |

### 获取 API Key 链接

| 服务 | 获取地址 |
|------|----------|
| OpenAI | https://platform.openai.com/api-keys |
| OpenRouter | https://openrouter.ai/keys |
| Groq | https://console.groq.com/keys |
| Google Gemini | https://aistudio.google.com/apikey |
| Kimi | https://platform.moonshot.cn/ |
| GLM | https://open.bigmodel.cn/ |
| 通义千问 | https://dashscope.console.aliyun.com/ |
| DeepSeek | https://platform.deepseek.com/ |
| MiniMax | https://www.minimaxi.com/ |

---

## 配置示例

### 内置 Provider（自动配置 endpoint）

```json
{
  "gpt4": {
    "display:name": "GPT-4o",
    "ai:provider": "openai",
    "ai:model": "gpt-4o"
  },
  "claude": {
    "display:name": "Claude 3.5 Sonnet",
    "ai:provider": "openrouter",
    "ai:model": "anthropic/claude-3.5-sonnet"
  },
  "groq": {
    "display:name": "Groq",
    "ai:provider": "groq",
    "ai:model": "llama-3.3-70b-versatile"
  },
  "gemini": {
    "display:name": "Gemini Flash",
    "ai:provider": "google",
    "ai:model": "gemini-2.0-flash"
  }
}
```

### 自定义 Provider（国内 AI）

```json
{
  "kimi": {
    "display:name": "Kimi",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "moonshot-v1-8k",
    "ai:endpoint": "https://api.moonshot.cn/v1/chat/completions",
    "ai:secret:name": "kimi-api-key"
  },
  "glm": {
    "display:name": "GLM-4",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "glm-4",
    "ai:endpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    "ai:secret:name": "glm-api-key"
  },
  "qwen": {
    "display:name": "通义千问",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "qwen-turbo",
    "ai:endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    "ai:secret:name": "qwen-api-key"
  },
  "deepseek": {
    "display:name": "DeepSeek",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "deepseek-chat",
    "ai:endpoint": "https://api.deepseek.com/v1/chat/completions",
    "ai:secret:name": "deepseek-api-key"
  },
  "minimax": {
    "display:name": "MiniMax",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "abab6.5-chat",
    "ai:endpoint": "https://api.minimax.chat/v1/chat/completions",
    "ai:secret:name": "minimax-api-key"
  }
}
```

### 本地模型

```json
{
  "ollama": {
    "display:name": "Ollama",
    "ai:apitype": "openai-chat",
    "ai:model": "llama3.2",
    "ai:endpoint": "http://localhost:11434/v1/chat/completions",
    "ai:apitoken": "ollama"
  },
  "lmstudio": {
    "display:name": "LM Studio",
    "ai:apitype": "openai-chat",
    "ai:model": "local-model",
    "ai:endpoint": "http://localhost:1234/v1/chat/completions",
    "ai:apitoken": "not-needed"
  }
}
```

---

## API Key 设置（Secret）

### 方法 1：使用 wsh secret 命令

```bash
# 国内服务
wsh secret kimi-api-key "sk-xxx"
wsh secret glm-api-key "xxx.xxx"
wsh secret qwen-api-key "sk-xxx"
wsh secret deepseek-api-key "sk-xxx"
wsh secret minimax-api-key "xxx"

# 国际服务
wsh secret openai-api-key "sk-xxx"
wsh secret openrouter-api-key "sk-or-xxx"
wsh secret groq-api-key "gsk_xxx"
wsh secret google-api-key "AIza-xxx"
```

### 方法 2：环境变量（~/.zshrc）

```bash
# 添加到 ~/.zshrc
export OPENAI_API_KEY="sk-xxx"
export OPENROUTER_API_KEY="sk-or-xxx"
export GROQ_API_KEY="gsk_xxx"
export GOOGLE_API_KEY="AIza-xxx"
```

### 方法 3：直接在配置中使用 apitoken

仅适用于本地模型（Ollama、LM Studio 等）：

```json
{
  "ai:apitoken": "ollama"
}
```

---

## 配置字段说明

| 字段 | 必填 | 说明 |
|------|:----:|------|
| `display:name` | ✅ | 显示名称 |
| `ai:provider` | 推荐 | `openai`, `openrouter`, `groq`, `google`, `custom` |
| `ai:apitype` | ✅ | 通常为 `openai-chat` |
| `ai:model` | ✅ | 模型名称 |
| `ai:endpoint` | 自定义必填 | API 端点 URL |
| `ai:secret:name` | 云服务必填 | Secret 名称（通过 wsh secret 设置） |
| `ai:apitoken` | 本地模型 | Token 值（本地模型忽略此值） |

---

## 完整配置示例

保存到 `~/.config/waveterm/waveai.json`：

```json
{
  "kimi": {
    "display:name": "Kimi",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "moonshot-v1-8k",
    "ai:endpoint": "https://api.moonshot.cn/v1/chat/completions",
    "ai:secret:name": "kimi-api-key"
  },
  "deepseek": {
    "display:name": "DeepSeek",
    "ai:provider": "custom",
    "ai:apitype": "openai-chat",
    "ai:model": "deepseek-chat",
    "ai:endpoint": "https://api.deepseek.com/v1/chat/completions",
    "ai:secret:name": "deepseek-api-key"
  },
  "gpt4": {
    "display:name": "GPT-4o",
    "ai:provider": "openai",
    "ai:model": "gpt-4o"
  },
  "claude": {
    "display:name": "Claude 3.5",
    "ai:provider": "openrouter",
    "ai:model": "anthropic/claude-3.5-sonnet"
  },
  "groq": {
    "display:name": "Groq",
    "ai:provider": "groq",
    "ai:model": "llama-3.3-70b-versatile"
  },
  "ollama": {
    "display:name": "Ollama",
    "ai:apitype": "openai-chat",
    "ai:model": "llama3.2",
    "ai:endpoint": "http://localhost:11434/v1/chat/completions",
    "ai:apitoken": "ollama"
  }
}
```

然后设置 API Keys：

```bash
wsh secret kimi-api-key "your-kimi-key"
wsh secret deepseek-api-key "your-deepseek-key"
wsh secret openai-api-key "your-openai-key"
wsh secret openrouter-api-key "your-openrouter-key"
wsh secret groq-api-key "your-groq-key"

wsh setconfig waveai:defaultmode="kimi"
```
