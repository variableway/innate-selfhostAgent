# Local LLM

## Status: ✅ Completed (Updated 2026-04-08)

## Created Files

- **Documentation**: `docs/guides/local-llm-guide.md`
- **Installation Script**: `scripts/install/install-local-llm-windows.ps1`

## Summary

All tasks have been documented with the latest models:

### 1. ✅ Windows 本地 LLM 安装脚本
- 使用 Ollama（推荐，最简单）
- 使用 LM Studio（图形界面）
- 使用 Text Generation WebUI（高级用户）

### 2. ✅ Qwen 3.5 模型下载指南 (2026-02 发布)
- qwen3.5:9b — 通用推荐
- qwen3.5:27b — 大型
- qwen3.5:35b-a3b — MoE 轻量高效
- qwen3.5:122b-a10b — MoE 旗舰级

### 3. ✅ Google Gemma 4 模型下载指南 (2026-04 发布)
- gemma4:e2b — 边缘设备
- gemma4:e4b — 通用推荐
- gemma4:26b — 大型
- gemma4:31b — 旗舰级 (89.2% AIME 2026)

### 4. ✅ OpenRouter 使用指南
- 注册和获取 API Key
- Python / curl 代码示例
- 2026 最新热门模型列表

### 5. ✅ HuggingFace 使用指南
- transformers 库本地加载
- Inference API（免费）
- Inference Endpoints（付费）
- 2026 最新热门中文模型推荐表

## Quick Start

```powershell
# 1. 安装 Ollama
.\scripts\install\install-local-llm-windows.ps1

# 2. 下载 Qwen 3.5
.\scripts\install\install-local-llm-windows.ps1 -Action download -Model qwen3.5

# 3. 下载 Gemma 4
.\scripts\install\install-local-llm-windows.ps1 -Action download -Model gemma4

# 4. 运行
ollama run qwen3.5
ollama run gemma4
```

## References

- [Ollama](https://ollama.com/)
- [Qwen 3.5 Blog](https://qwen.ai/blog?id=qwen3.5)
- [Gemma 4 Blog](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [OpenRouter](https://openrouter.ai/)
- [HuggingFace](https://huggingface.co/)
