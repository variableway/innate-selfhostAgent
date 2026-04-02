# WSL2 AI 开发环境安装指南

本指南帮助你在 Windows 的 WSL2 中搭建完整的 AI 开发环境。

## 前置要求

- Windows 10 (版本 2004+) 或 Windows 11
- 已启用 WSL2

## 一、启用 WSL2

### 方法 1：一键启用（推荐）

在 **PowerShell (管理员)** 中运行：

```powershell
wsl --install
```

安装完成后重启电脑。

### 方法 2：手动启用

```powershell
# 1. 启用 WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 2. 启用虚拟机平台
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 3. 重启电脑

# 4. 设置 WSL2 为默认版本
wsl --set-default-version 2

# 5. 安装 Ubuntu
wsl --install -d Ubuntu
```

### 验证 WSL2

```powershell
wsl -l -v
```

输出应显示 VERSION 为 2：

```
  NAME      STATE           VERSION
* Ubuntu    Running         2
```

## 二、运行安装脚本

### 快速安装（一键完成）

打开 WSL 终端（在开始菜单搜索 "Ubuntu"），运行：

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/你的仓库路径/scripts/install/install-all-wsl.sh | bash
```

### 或手动下载运行

```bash
# 克隆仓库
git clone https://github.com/你的仓库路径.git
cd selfhost-agent

# 运行安装脚本
chmod +x scripts/install/*.sh
./scripts/install/install-all-wsl.sh
```

### 安装选项

脚本提供以下安装模式：

| 选项 | 说明 |
|------|------|
| 1 | 完整安装（推荐） |
| 2 | 自定义安装 |
| 3 | 仅终端工具 |
| 4 | 仅 Node.js |
| 5 | 仅 Python |

## 三、安装内容详解

### 3.1 终端工具

| 工具 | 说明 |
|------|------|
| Zsh | 更强大的 Shell |
| Oh My Zsh | Zsh 配置框架 |
| zsh-autosuggestions | 命令自动建议 |
| zsh-syntax-highlighting | 语法高亮 |
| tmux | 终端复用 |
| fzf | 模糊搜索 |
| ripgrep (rg) | 快速搜索 |
| bat | 带语法高亮的 cat |
| htop | 系统监控 |
| tree | 目录树 |
| autojump | 快速目录跳转 |

### 3.2 Node.js (fnm)

| 组件 | 说明 |
|------|------|
| fnm | Fast Node Manager，快速 Node.js 版本管理 |
| Node.js LTS | 长期支持版本 |
| pnpm/yarn | 包管理器（可选） |

**fnm 常用命令：**

```bash
fnm install 20        # 安装 Node.js 20
fnm use 20            # 使用 Node.js 20
fnm default 20        # 设为默认版本
fnm list              # 列出已安装版本
fnm current           # 当前版本
```

### 3.3 Python (uv)

| 组件 | 说明 |
|------|------|
| uv | Astral 出品的极速 Python 工具 |
| Python 3.13 | 最新版本 |
| Python 3.12 | 稳定版本 |
| Python 3.11 | 兼容版本 |

**uv 常用命令：**

```bash
uv python install 3.12    # 安装 Python 版本
uv python list            # 列出已安装版本
uv init my-project        # 初始化项目
uv add requests           # 添加依赖
uv remove requests        # 移除依赖
uv run python app.py      # 运行脚本
uv tool install black     # 安装全局工具
```

## 四、WSL2 常用技巧

### 4.1 Windows 互操作

```bash
# 用 Windows 资源管理器打开当前目录
open .

# 用 VS Code 打开当前目录
code .

# 访问 Windows 文件
cd /mnt/c/Users/你的用户名/

# 从 Windows 运行 Linux 命令
wsl ls -la
```

### 4.2 端口转发

WSL2 的端口会自动转发到 Windows：

```bash
# 在 WSL 中启动服务
python -m http.server 8080

# 在 Windows 浏览器访问
# http://localhost:8080
```

### 4.3 常用 WSL 命令

```powershell
# 在 PowerShell 中执行

wsl                     # 进入 WSL
wsl -l -v               # 列出发行版
wsl --shutdown          # 关闭 WSL
wsl --update            # 更新 WSL
wsl --set-default Ubuntu  # 设置默认发行版
```

### 4.4 配置建议

创建 `~/.wslconfig`（在 Windows 用户目录）：

```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
```

## 五、常见问题

### Q1: 命令找不到 (command not found)

运行：
```bash
source ~/.zshrc
# 或
source ~/.bashrc
```

### Q2: node 命令不存在

fnm 需要加载环境：
```bash
eval "$(fnm env)"
```

或确保 `~/.zshrc` 中有：
```bash
eval "$(fnm env --use-on-cd)"
```

### Q3: Python 版本问题

使用 uv 管理的 Python：
```bash
# 查看可用版本
uv python list

# 使用特定版本运行
uv run --python 3.12 python script.py
```

### Q4: WSL2 网络问题

```powershell
# 重置网络
wsl --shutdown
netsh winsock reset
# 重启电脑
```

### Q5: 权限问题

```bash
# 修复文件权限
sudo chown -R $(whoami) ~/.local
```

## 六、下一步

安装完成后，你可以：

1. **安装 AI CLI 工具**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **创建第一个项目**
   ```bash
   uv init my-ai-project
   cd my-ai-project
   uv add openai anthropic
   ```

3. **配置 Git**
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

## 七、脚本文件清单

| 文件 | 说明 |
|------|------|
| [install-all-wsl.sh](scripts/install/install-all-wsl.sh) | 一键安装主脚本 |
| [install-terminal-tools-wsl.sh](scripts/install/install-terminal-tools-wsl.sh) | 终端工具安装 |
| [install-nodejs-wsl.sh](scripts/install/install-nodejs-wsl.sh) | Node.js 安装 |
| [install-python-wsl.sh](scripts/install/install-python-wsl.sh) | Python 安装 |
