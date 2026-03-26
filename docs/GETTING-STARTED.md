# 新手入门指南

> 从零开始，30 分钟搭建 AI 开发环境

---

## 你是谁？

| 情况 | 推荐路径 |
|------|----------|
| 完全零基础 | 👇 按顺序完成下方 4 个步骤 |
| 会用命令行 | 跳过步骤 1，从 Node.js 开始 |
| 已有 Node.js/Python | 直接看 [AI CLI 工具](#4-ai-cli-工具-5分钟) |

---

## 学习路径

```
步骤 1          步骤 2          步骤 3          步骤 4
┌──────┐       ┌──────┐       ┌──────┐       ┌──────┐
│ 终端 │  ──▶  │Node.js│  ──▶  │Python│  ──▶  │AI工具│
│ 5min │       │ 10min │       │ 10min │       │ 5min │
└──────┘       └──────┘       └──────┘       └──────┘
```

---

## 步骤 1: 命令行基础 (5分钟)

> ⏱️ 预计时间: 5 分钟  
> 📋 前置条件: 无  
> ✅ 完成标志: 能运行 `ls -la` 并理解输出

### 学什么？

7 个必学命令：`ls`, `cd`, `rm`, `cp`, `mv`, `cat`, `echo`

### 怎么学？

📖 阅读：[命令行 5 分钟入门](guides/1-terminal/cmd-basics.md)

### 快速验证

```bash
# 试试这些命令
ls           # 列出当前目录
ls -la       # 详细列表
cd ~         # 回到主目录
pwd          # 显示当前路径
```

### 安装终端工具（可选但推荐）

```bash
# Mac
./scripts/install/install-terminal-tools-mac.sh

# Windows
.\scripts\install\install-terminal-tools-windows.ps1
```

---

## 步骤 2: Node.js 环境 (10分钟)

> ⏱️ 预计时间: 10 分钟  
> 📋 前置条件: 完成步骤 1  
> ✅ 完成标志: `node -v` 输出版本号

### 什么是 Node.js？

JavaScript 运行环境，很多 AI 工具需要它。

### 一键安装

```bash
# Mac
./scripts/install/install-nodejs-mac.sh

# Windows
.\scripts\install\install-nodejs-windows.ps1
```

### 验证安装

```bash
node -v    # 应输出 v24.x.x
npm -v     # 应输出 10.x.x
```

### 详细文档

📖 阅读：[Node.js 安装指南](guides/2-dev-tools/nodejs-setup.md)

### 遇到问题？

📖 查看：[fnm 故障排除](guides/2-dev-tools/fnm-troubleshooting.md)

---

## 步骤 3: Python 环境 (10分钟)

> ⏱️ 预计时间: 10 分钟  
> 📋 前置条件: 完成步骤 1  
> ✅ 完成标志: `python --version` 输出版本号

### 为什么需要 Python？

AI/ML 开发的主要语言。

### 一键安装

```bash
# Mac
./scripts/install/install-python-mac.sh

# Windows
.\scripts\install\install-python-windows.ps1
```

### 验证安装

```bash
python --version    # 应输出 Python 3.12.x
pip --version       # 应输出 pip 24.x
```

### 详细文档

📖 阅读：[Python 安装指南](guides/2-dev-tools/python-setup.md)

---

## 步骤 4: AI CLI 工具 (5分钟)

> ⏱️ 预计时间: 5 分钟  
> 📋 前置条件: 完成 Node.js 安装  
> ✅ 完成标志: 能运行 `claude` 命令

### 什么是 AI CLI？

在终端中使用 AI 助手，无需打开浏览器。

### 安装 Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code

# 首次使用需要登录
claude
```

### 其他 AI CLI 工具

| 工具 | 安装命令 |
|------|----------|
| Aider | `pip install aider-chat` |
| GitHub Copilot CLI | `npm install -g @githubnext/github-copilot-cli` |

### 详细文档

📖 阅读：[AI CLI 工具指南](guides/2-dev-tools/ai-cli-tools.md)

---

## 完成检查清单

完成以下所有项目，说明环境搭建成功：

- [ ] 能运行 `ls -la` 查看目录
- [ ] `node -v` 输出版本号
- [ ] `npm -v` 输出版本号
- [ ] `python --version` 输出版本号
- [ ] `pip --version` 输出版本号
- [ ] 安装了至少一个 AI CLI 工具

🎉 恭喜！你已经完成了基础环境搭建！

---

## 下一步

### 选择 IDE

📖 阅读：[IDE 选择指南](guides/2-dev-tools/ide-setup.md)

推荐：
- **VS Code** - 免费，插件丰富
- **Cursor** - AI 原生编辑器

### 学习 Git

📖 阅读：[Git 基础](guides/2-git/git-intro.md)

---

## 遇到问题？

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 命令找不到 | 重启终端或 `source ~/.zshrc` |
| 权限错误 | `chmod +x scripts/install/*.sh` |
| 安装很慢 | 配置国内镜像（见 README.md） |

### 获取帮助

1. 查看对应的故障排除文档
2. 在 GitHub 上提交 Issue
