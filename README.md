# Self-host AI 环境搭建指南

> 帮助初学者快速搭建 AI 开发环境

**👉 [新手入门指南](docs/GETTING-STARTED.md)** - 30分钟从零开始

---

## 🚀 5 分钟快速开始

### Mac 用户

```bash
# 第一步：安装终端工具（约 3 分钟）
./scripts/install/install-terminal-tools-mac.sh

# 第二步：安装 Node.js（约 2 分钟）
./scripts/install/install-nodejs-mac.sh

# 第三步：安装 Python（约 2 分钟）
./scripts/install/install-python-mac.sh
```

### Windows 用户

```powershell
# 以管理员身份运行 PowerShell

# 第一步：安装终端工具
.\scripts\install\install-terminal-tools-windows.ps1

# 第二步：安装 Node.js
.\scripts\install\install-nodejs-windows.ps1

# 第三步：安装 Python
.\scripts\install\install-python-windows.ps1
```

---

## 📚 学习路径

```
┌─────────────────────┐
│ 1. 命令行基础       │  ← 从这里开始（5分钟）
│    cmd-basics.md    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 2. Node.js 环境     │  （10分钟）
│    nodejs-setup.md  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 3. Python 环境      │  （10分钟）
│    python-setup.md  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 4. AI CLI 工具      │  （5分钟）
│    ai-cli-tools.md  │
└─────────────────────┘
```

---

## 📖 文档目录

### 入门指南

| 文档 | 内容 | 时间 |
|------|------|------|
| [命令行入门](docs/guides/1-terminal/cmd-basics.md) | 7个必学命令 | 5分钟 |
| [Node.js 安装](docs/guides/2-dev-tools/nodejs-setup.md) | fnm + Node.js | 10分钟 |
| [Python 安装](docs/guides/2-dev-tools/python-setup.md) | uv + Python | 10分钟 |
| [IDE 选择](docs/guides/2-dev-tools/ide-setup.md) | VS Code/Cursor | 5分钟 |
| [AI CLI 工具](docs/guides/2-dev-tools/ai-cli-tools.md) | Claude Code 等 | 5分钟 |

### 故障排除

| 文档 | 内容 |
|------|------|
| [fnm 故障排除](docs/guides/2-dev-tools/fnm-troubleshooting.md) | Node.js 相关问题 |
| [初学者友好度评估](docs/troubleshooting/beginner-friendly-evaluation.md) | 项目改进建议 |

---

## 🛠️ 安装脚本

| 脚本 | 平台 | 用途 |
|------|------|------|
| `install-terminal-tools-mac.sh` | Mac | 终端工具 |
| `install-terminal-tools-windows.ps1` | Windows | 终端工具 |
| `install-nodejs-mac.sh` | Mac | Node.js |
| `install-nodejs-windows.ps1` | Windows | Node.js |
| `install-python-mac.sh` | Mac | Python |
| `install-python-windows.ps1` | Windows | Python |

---

## ✅ 验证安装

```bash
# 检查 Node.js
node -v    # 应输出 v24.x.x
npm -v     # 应输出 10.x.x

# 检查 Python
python --version    # 应输出 Python 3.12.x
pip --version       # 应输出 pip 24.x

# 检查工具
fnm --version       # fnm 版本
uv --version        # uv 版本
```

---

## 📁 项目结构

```
selfhost-agent/
├── README.md                    # 本文件
├── docs/
│   ├── guides/                  # 使用指南
│   │   ├── 1-terminal/          # 终端相关
│   │   └── 2-dev-tools/         # 开发工具
│   └── troubleshooting/         # 故障排除
├── scripts/
│   └── install/                 # 安装脚本
├── config/                      # 配置模板
└── tasks/                       # 开发任务追踪
```

---

## ❓ 常见问题

### Q: 运行脚本时权限错误？

```bash
# Mac/Linux: 添加执行权限
chmod +x scripts/install/*.sh
```

### Q: 命令找不到？

重启终端或运行：
```bash
source ~/.zshrc    # Mac
```

### Q: 安装很慢？

配置国内镜像：
```bash
# npm 淘宝镜像
npm config set registry https://registry.npmmirror.com

# pip 清华镜像
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

## 📄 许可证

MIT License
