# GLM API 配置指南

智谱 AI GLM 模型在 AI 编程工具中的配置说明，支持 Claude Code、OpenClaw、Cline 等主流工具。

## 模型对照表

| 模型 | 适用场景 | 上下文窗口 | 最大输出 |
|------|----------|------------|----------|
| GLM-5.1 | 复杂推理任务（推荐） | 204K | 131K |
| GLM-4.7 | 通用任务 | 204K | 131K |
| GLM-4.5-Air | 快速响应任务 | 128K | 4K |

## Claude Code 配置

### 默认模型映射

Claude Code 内部模型环境变量与 GLM 模型默认对应关系：

| Claude Code 变量 | 默认 GLM 模型 |
|------------------|---------------|
| ANTHROPIC_DEFAULT_OPUS_MODEL | glm-4.7 |
| ANTHROPIC_DEFAULT_SONNET_MODEL | glm-4.7 |
| ANTHROPIC_DEFAULT_HAIKU_MODEL | glm-4.5-air |

### 切换到 GLM-5.1

编辑配置文件 `~/.claude/settings.json`：

**macOS 方法一**：终端执行 `vim ~/.claude/settings.json`

**macOS 方法二**：访达 → 前往文件夹 → 输入 `~/.claude/`

**Windows**：编辑 `C:\Users\<用户名>\.claude\settings.json`

添加或修改以下内容：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-api-key-here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/coding/paas/v4",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  }
}
```

> **重要**: 
> - 将 `your-glm-api-key-here` 替换为您从智谱开放平台获取的实际 API Key
> - 模型名称必须使用**小写**格式（如 `glm-5.1`，而非 `GLM-5.1`）

### 验证配置

启动新的命令行窗口，运行 Claude Code，输入 `/status` 确认模型状态。

---

## OpenClaw 配置

### 添加 GLM-5.1 模型

编辑 `~/.openclaw/openclaw.json`，在 `models.providers.zai.models` 数组中添加：

```json
{
  "id": "GLM-5.1",
  "name": "GLM-5.1",
  "reasoning": true,
  "input": ["text"],
  "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
  "contextWindow": 204800,
  "maxTokens": 131072
}
```

### 设置默认模型

修改 `agents.defaults.model.primary`：

```json
"model": {
  "primary": "zai/GLM-5.1",
  "fallbacks": ["zai/GLM-4.7"]
}
```

在 `agents.defaults.models` 中添加：

```json
"models": {
  "zai/GLM-5": {"alias": "GLM"},
  "zai/GLM-4.7": {},
  "zai/GLM-5.1": {}
}
```

### 重启网关

```bash
openclaw gateway restart
```

---

## Cline 配置

| 配置项 | 值 |
|--------|-----|
| API Provider | OpenAI Compatible |
| Base URL | `https://open.bigmodel.cn/api/coding/paas/v4` |
| API Key | 您的智谱 API Key |
| 模型 | 自定义：`glm-5.1`（小写） |
| Context Window | 200000 |
| Support Images | 取消勾选 |

---

## 一键配置脚本

运行配置脚本快速设置 GLM API Key：

```bash
./setup-glm.sh
```

或手动设置环境变量：

```bash
export ZHIPU_API_KEY='your-api-key-here'
```

## 获取 API Key

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 API Key 管理页面创建 Key
