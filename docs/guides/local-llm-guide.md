# 本地 LLM 使用指南

本指南帮助你在 Windows 上安装和使用本地大语言模型，以及通过 OpenRouter 和 HuggingFace 测试不同模型。

> **最后更新：2026-04-08**

---

## 目录

1. [Windows 本地 LLM 安装](#1-windows-本地-llm-安装)
2. [下载 Qwen 3.5 模型](#2-下载-qwen-35-模型)
3. [下载 Google Gemma 4 模型](#3-下载-google-gemma-4-模型)
4. [使用 OpenRouter 测试模型](#4-使用-openrouter-测试模型)
5. [使用 HuggingFace 测试模型](#5-使用-huggingface-测试模型)

---

## 1. Windows 本地 LLM 安装

### 推荐工具：Ollama（最简单）

Ollama 是目前最简单的本地 LLM 运行工具。

#### 安装步骤

```powershell
# 方法一：直接下载安装包
# 访问 https://ollama.com/download/windows
# 下载 Windows 安装包并运行

# 方法二：使用 winget 安装
winget install Ollama.Ollama
```

#### 验证安装

```powershell
# 检查版本
ollama --version

# 启动服务（通常自动启动）
ollama serve
```

### 替代方案：LM Studio

如果你更喜欢图形界面：

1. 访问 https://lmstudio.ai/
2. 下载 Windows 版本
3. 安装并运行
4. 在应用内搜索和下载模型

### 替代方案：Text Generation WebUI (oobabooga)

适合高级用户：

```powershell
# 需要先安装 Python 和 Git
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
.\start_windows.bat
```

---

## 2. 下载 Qwen 3.5 模型

**Qwen 3.5**（通义千问）是阿里巴巴于 2026 年 2 月发布的最新一代开源模型，主打原生多模态 Agent 能力。

> 官方博客：https://qwen.ai/blog?id=qwen3.5

### 使用 Ollama 下载

```powershell
# Qwen 3.5 最新版（默认 9B，推荐）
ollama pull qwen3.5

# 不同尺寸版本
ollama pull qwen3.5:9b       # 通用推荐 (约 6.6GB，256K 上下文)
ollama pull qwen3.5:27b      # 大型 (推荐 16GB+ 显存)
ollama pull qwen3.5:35b-a3b  # MoE 架构，35B 总参数/3B 激活，高效推理
ollama pull qwen3.5:122b-a10b # MoE 架构，122B 总参数/10B 激活

# Qwen 3.5 编程专用版本
ollama pull qwen3.5-coder
```

### 运行 Qwen 3.5

```powershell
# 交互式对话
ollama run qwen3.5

# 单次提问
ollama run qwen3.5 "解释什么是机器学习"

# 指定尺寸
ollama run qwen3.5:27b "写一个 Python 快速排序"
```

### API 方式调用

```powershell
# REST API
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3.5",
  "prompt": "你好，请介绍一下自己"
}'
```

```python
# Python SDK
# pip install ollama

import ollama

response = ollama.chat(model='qwen3.5', messages=[
  {'role': 'user', 'content': '你好！'}
])
print(response['message']['content'])
```

### Qwen 3.5 模型家族一览

| 模型 | 架构 | 特点 |
|------|------|------|
| qwen3.5:9b | Dense | 通用推荐，性能均衡 |
| qwen3.5:27b | Dense | 大型，综合能力最强 |
| qwen3.5:35b-a3b | MoE | 35B 参数 / 3B 激活，轻量高效 |
| qwen3.5:122b-a10b | MoE | 122B 参数 / 10B 激活，旗舰级 |
| qwen3.5-flash | MoE | 快速推理版 |
| qwen3.5-coder | Dense | 编程专用 |

> **注意**：`ollama pull qwen3.5` 不带后缀默认拉取 9B 模型，这是阿里推荐的全能型选择。

### 查看已安装模型

```powershell
ollama list
```

---

## 3. 下载 Google Gemma 4 模型

**Gemma 4** 是 Google DeepMind 于 2026 年 4 月发布的最新开源模型系列，基于 Gemini 3 构建，支持文本/音频/图像输入，256K 上下文窗口，Apache 2.0 开源协议。

> 官方博客：https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/

### 使用 Ollama 下载

```powershell
# Gemma 4（默认 e4b，推荐）
ollama pull gemma4

# 不同尺寸版本
ollama pull gemma4:e2b    # 2.3B 有效参数 (约 7.2GB)，边缘设备
ollama pull gemma4:e4b    # 约 4B 有效参数 (约 9.6GB)，通用推荐
ollama pull gemma4:26b    # 26B 参数，大型
ollama pull gemma4:31b    # 31B 参数，旗舰级 (89.2% AIME 2026)
```

### 运行 Gemma 4

```powershell
# 交互式对话
ollama run gemma4

# 指定大小
ollama run gemma4:e4b "What is deep learning?"
ollama run gemma4:31b "Explain quantum computing in detail"
```

### 使用 Python 调用

```python
# pip install ollama

import ollama

response = ollama.chat(model='gemma4', messages=[
  {
    'role': 'user',
    'content': 'Hello, how are you?',
  },
])
print(response['message']['content'])
```

### Gemma 4 模型家族一览

| 模型 | 参数量 | 下载大小 | 特点 |
|------|--------|---------|------|
| gemma4:e2b | 2.3B | ~7.2GB | 轻量，适合边缘设备 |
| gemma4:e4b | ~4B | ~9.6GB | 通用推荐，大多数开发者首选 |
| gemma4:26b | 26B | ~17GB | 大型，强大推理能力 |
| gemma4:31b | 31B | ~20GB | 旗舰级，AIME 2026 89.2% |

> **注意**：Gemma 4 使用 `e2b`/`e4b` 标签格式（e = effective），不是传统的 `2b`/`4b`。

---

## 4. 使用 OpenRouter 测试模型

[OpenRouter](https://openrouter.ai/) 是一个统一的 LLM API 平台，可以访问多种模型。

### 注册和获取 API Key

1. 访问 https://openrouter.ai/
2. 点击 "Sign In" 注册账号
3. 进入 https://openrouter.ai/keys
4. 点击 "Create Key" 生成 API Key
5. 充值（按使用付费）

### API 调用方式

OpenRouter 兼容 OpenAI API 格式：

```python
# 安装依赖
# pip install openai

from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="YOUR_OPENROUTER_API_KEY",
)

response = client.chat.completions.create(
    model="qwen/qwen3.5-27b-instruct",  # 可换成其他模型
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### 热门模型列表

```python
# 免费模型
models_free = [
    "qwen/qwen3-14b-instruct:free",
    "qwen/qwen3-8b-instruct:free",
    "google/gemma-4-9b-it:free",
    "meta-llama/llama-4-scout:free",
]

# 付费模型
models_paid = [
    "anthropic/claude-sonnet-4",
    "anthropic/claude-opus-4",
    "openai/gpt-4.1",
    "google/gemini-2.5-pro",
    "qwen/qwen3.5-27b-instruct",
    "qwen/qwen3.5-max",
    "meta-llama/llama-4-maverick",
]
```

### 使用 curl 测试

```powershell
curl https://openrouter.ai/api/v1/chat/completions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_API_KEY" `
  -d '{
    "model": "qwen/qwen3.5-27b-instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 查看模型和价格

访问 https://openrouter.ai/models 查看所有可用模型和价格。

---

## 5. 使用 HuggingFace 测试模型

[HuggingFace](https://huggingface.co/) 是最大的开源模型社区。

### 方法一：使用 transformers 库

```python
# 安装依赖
# pip install transformers torch accelerate

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# 加载模型 (以 Qwen3.5 为例)
model_name = "Qwen/Qwen3.5-7B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

# 生成文本
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "你好！"}
]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt").to(model.device)

outputs = model.generate(
    inputs.input_ids,
    max_new_tokens=512,
    temperature=0.7,
    top_p=0.9
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
```

### 方法二：使用 Inference API（免费）

```python
# 安装依赖
# pip install requests

import requests

API_TOKEN = "YOUR_HUGGINGFACE_TOKEN"  # 从 https://huggingface.co/settings/tokens 获取

model_id = "Qwen/Qwen3.5-7B-Instruct"
api_url = f"https://api-inference.huggingface.co/models/{model_id}"

headers = {"Authorization": f"Bearer {API_TOKEN}"}

payload = {
    "inputs": "Hello, how are you?",
    "parameters": {
        "max_new_tokens": 256,
        "temperature": 0.7
    }
}

response = requests.post(api_url, headers=headers, json=payload)
print(response.json())
```

### 方法三：使用 Inference Endpoints（付费）

适合生产环境部署：

1. 访问 https://ui.endpoints.huggingface.co/
2. 创建新的 Endpoint
3. 选择模型和硬件配置
4. 获取 Endpoint URL

```python
import requests

endpoint_url = "https://your-endpoint.us-east-1.aws.endpoints.huggingface.cloud"
headers = {
    "Authorization": "Bearer YOUR_HUGGINGFACE_TOKEN",
    "Content-Type": "application/json"
}

payload = {
    "inputs": "Hello!",
    "parameters": {"max_new_tokens": 256}
}

response = requests.post(endpoint_url, headers=headers, json=payload)
print(response.json())
```

### 热门中文模型推荐（2026 年最新）

| 模型 | HuggingFace ID | 说明 |
|------|----------------|------|
| Qwen 3.5 | `Qwen/Qwen3.5-7B-Instruct` | 阿里通义千问最新版，原生多模态 Agent |
| Gemma 4 | `google/gemma-4-9b-it` | Google 最新开源，Apache 2.0 协议 |
| DeepSeek V3.2 | `deepseek-ai/DeepSeek-V3.2` | 深度求索最新版 |
| GLM-4 | `THUDM/glm-4-9b-chat` | 智谱清言 |
| Llama 4 | `meta-llama/Llama-4-Scout-17B` | Meta 最新开源模型 |

### 查找模型

1. 访问 https://huggingface.co/models
2. 搜索关键词如 "chinese", "qwen3.5", "gemma4", "chat"
3. 筛选任务类型 "Text Generation"
4. 查看模型下载量和点赞数

---

## Qwen 3.5 vs Gemma 4 快速对比

| 维度 | Qwen 3.5 | Gemma 4 |
|------|-----------|---------|
| 发布时间 | 2026-02 | 2026-04 |
| 开发者 | 阿里巴巴 | Google DeepMind |
| 架构 | Dense + MoE | Dense |
| 最大模型 | 397B-A17B (MoE) | 31B (Dense) |
| 上下文窗口 | 256K | 256K |
| 多模态 | 文本+图像 | 文本+音频+图像 |
| 开源协议 | Apache 2.0 | Apache 2.0 |
| 中文能力 | 极强（原生中文训练） | 强 |
| 编程能力 | 强（有 Coder 版本） | 强 (80.0% LiveCodeBench v6) |
| Ollama 可用 | ✅ | ✅ |

---

## 快速参考

### 显存需求参考

| 模型大小 | 4-bit 量化 | 8-bit 量化 | FP16 |
|---------|-----------|-----------|------|
| 7-9B | ~4-6GB | ~8-10GB | ~14-18GB |
| 14-27B | ~8-16GB | ~16-32GB | ~28-54GB |
| 31B | ~18GB | ~32GB | ~62GB |
| 70B+ | ~40GB+ | ~80GB+ | ~140GB+ |

### 常用命令速查

```powershell
# Ollama 常用命令
ollama pull <model>       # 下载模型
ollama run <model>        # 运行模型
ollama list               # 列出已安装模型
ollama rm <model>         # 删除模型
ollama ps                 # 查看运行中的模型
ollama stop <model>       # 停止模型

# 查看 Ollama 服务状态
curl http://localhost:11434/api/tags
```

---

## 下一步

1. 选择适合你硬件的模型大小
2. 尝试不同模型，对比效果
3. 学习 prompt engineering 技巧
4. 考虑将本地 LLM 集成到你的应用中

## 参考链接

- [Ollama 官网](https://ollama.com/)
- [Ollama 模型库](https://ollama.com/library)
- [Qwen 3.5 官方博客](https://qwen.ai/blog?id=qwen3.5)
- [Gemma 4 官方博客](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [OpenRouter](https://openrouter.ai/)
- [HuggingFace](https://huggingface.co/)
- [LM Studio](https://lmstudio.ai/)
