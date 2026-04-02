# Terminal工具安装使用说明

## 概述

本指南帮助初学者快速安装和配置Terminal工具，为AI开发环境做准备。支持Mac和Windows两大平台。

---

## 快速开始

### Mac用户

#### 方式1: 一键安装 (推荐)
```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/selfhost-agent/main/scripts/install/install-terminal-tools-mac.sh | bash
```

#### 方式2: 手动安装
```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/selfhost-agent.git
cd selfhost-agent

# 2. 给脚本执行权限
chmod +x scripts/install/install-terminal-tools-mac.sh

# 3. 运行安装脚本
./scripts/install/install-terminal-tools-mac.sh
```

#### 详细指南
查看 [Mac Terminal安装指南](terminal-setup-mac.md)

---

### Windows用户

#### 方式1: 一键安装 (推荐)
```powershell
# 以管理员身份运行PowerShell，执行以下命令
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/your-repo/selfhost-agent/main/scripts/install/install-terminal-tools-windows.ps1'))
```

#### 方式2: 手动安装
```powershell
# 1. 克隆仓库
git clone https://github.com/your-repo/selfhost-agent.git
cd selfhost-agent

# 2. 允许脚本执行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. 运行安装脚本
.\scripts\install\install-terminal-tools-windows.ps1
```

#### 详细指南
查看 [Windows Terminal安装指南](terminal-setup-windows.md)

---

## 安装选项

### Mac脚本选项
```bash
./install-terminal-tools-mac.sh
```

脚本会自动安装:
- ✅ Homebrew (包管理器)
- ✅ iTerm2, Warp, Alacritty (Terminal工具)
- ✅ Zsh + Oh My Zsh
- ✅ tmux, autojump, tree, htop, fzf, bat, ripgrep

### Windows脚本选项
```powershell
# 标准安装 (交互式)
.\install-terminal-tools-windows.ps1

# 安装所有工具 (无交互)
.\install-terminal-tools-windows.ps1 -InstallAll

# 跳过winget安装
.\install-terminal-tools-windows.ps1 -SkipWinget
```

脚本会自动安装:
- ✅ Windows Terminal, WezTerm
- ✅ PowerShell 7 + Oh My Posh
- ✅ Nu Shell
- ✅ Git, fzf, bat, ripgrep, zoxide
- ✅ Terminal-Icons PowerShell模块

---

## 安装后配置

### Mac配置

1. **重启终端或重新加载配置**
```bash
source ~/.zshrc
```

2. **选择默认Shell**
```bash
chsh -s $(which zsh)
```

3. **配置iTerm2主题**
   - 打开 iTerm2
   - Preferences → Profiles → Colors
   - 选择喜欢的配色方案

### Windows配置

1. **重启PowerShell**
```powershell
. $PROFILE
```

2. **设置Windows Terminal默认配置**
   - 打开Windows Terminal
   - Ctrl+, 打开设置
   - 设置PowerShell 7为默认配置文件

3. **安装Nerd Font字体** (解决图标显示)
```powershell
oh-my-posh font install
```
然后在Windows Terminal设置中选择安装的字体

---

## 验证安装

### Mac验证
```bash
# 运行验证命令
echo "=== 验证工具安装 ==="
brew --version
zsh --version
tmux -V
which autojump
fzf --version
```

### Windows验证
```powershell
# 运行验证命令
Write-Host "=== 验证工具安装 ==="
winget --version
pwsh --version
git --version
zoxide --version
bat --version
```

---

## 常用命令速查

### Mac (Zsh)

| 功能 | 命令 |
|------|------|
| 目录快速跳转 | `j <目录名>` |
| 搜索命令历史 | `Ctrl+R` |
| 查看文件内容 | `bat <文件名>` |
| 搜索文件内容 | `rg <关键词>` |
| 系统监控 | `htop` |
| 目录树 | `tree -L 2` |

### tmux常用快捷键

| 功能 | 快捷键 |
|------|--------|
| 创建新会话 | `tmux new -s name` |
| 分离会话 | `Ctrl+b d` |
| 列出会话 | `tmux ls` |
| 连接会话 | `tmux attach -t name` |
| 垂直分屏 | `Ctrl+b %` |
| 水平分屏 | `Ctrl+b "` |

### Windows (PowerShell)

| 功能 | 命令 |
|------|------|
| 目录快速跳转 | `z <目录名>` |
| 搜索命令历史 | `Ctrl+R` |
| 查看文件内容 | `bat <文件名>` |
| 搜索文件内容 | `rg <关键词>` |
| 启动Nu Shell | `nu` |

---

## 故障排查

### Mac常见问题

**问题: Homebrew安装很慢**
```bash
# 使用国内镜像
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.ustc.edu.cn/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.ustc.edu.cn/homebrew-core.git"
```

**问题: zsh启动慢**
- 减少插件数量
- 使用更轻量的主题

**问题: 权限错误**
```bash
sudo chown -R $(whoami) ~/.oh-my-zsh
```

### Windows常见问题

**问题: 脚本执行策略错误**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**问题: Oh My Posh显示乱码**
- 安装Nerd Font字体
- 在终端设置中选择该字体

**问题: winget命令找不到**
- 更新Windows
- 安装 [App Installer](https://www.microsoft.com/p/app-installer/9nblggh4nns1)

---

## 卸载说明

### Mac卸载

```bash
# 卸载Oh My Zsh
uninstall_oh_my_zsh

# 卸载Homebrew包
brew uninstall tmux autojump tree htop fzf bat ripgrep

# 卸载应用
brew uninstall --cask iterm2 warp alacritty
```

### Windows卸载

```powershell
# 使用winget卸载
winget uninstall Microsoft.WindowsTerminal
winget uninstall Microsoft.PowerShell
winget uninstall wez.wezterm

# 删除PowerShell配置
Remove-Item $PROFILE
```

---

## 进阶配置

### 自定义Zsh配置
编辑 `~/.zshrc`:
```bash
# 更改主题
ZSH_THEME="powerlevel10k/powerlevel10k"

# 添加更多插件
plugins=(git docker kubectl python npm node fzf)

# 自定义别名
alias ll='ls -lah'
alias gs='git status'
alias dc='docker-compose'
```

### 自定义PowerShell配置
编辑 `$PROFILE`:
```powershell
# 自定义别名
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name grep -Value Select-String

# 自定义函数
function .. { Set-Location .. }
function ... { Set-Location ..\.. }
```

---

## 相关文档

- [Mac详细安装指南](terminal-setup-mac.md)
- [Windows详细安装指南](terminal-setup-windows.md)
- [Python环境配置](python-setup.md)
- [Git配置指南](git-setup.md)

---

## 获取帮助

- 查看项目 [GitHub Issues](https://github.com/your-repo/selfhost-agent/issues)
- 阅读各工具的官方文档
- 在社区讨论区提问

---

## 贡献

欢迎提交问题和改进建议！请查看 [贡献指南](../../CONTRIBUTING.md)
