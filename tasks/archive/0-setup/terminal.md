# Terminal Tasks

## Task 1: 安装必要的Terminal工具 ✅

**状态**: 已完成

### 实现内容

#### 🔧 安装脚本
- [Mac一键安装脚本](../../scripts/install/install-terminal-tools-mac.sh)
- [Windows一键安装脚本](../../scripts/install/install-terminal-tools-windows.ps1)

#### 📦 Skill定义
- [Mac Terminal配置Skill](../../skills/beginner/terminal-setup-mac.json)
- [Windows Terminal配置Skill](../../skills/beginner/terminal-setup-windows.json)

### 快速使用

#### Mac用户
```bash
chmod +x scripts/install/install-terminal-tools-mac.sh
./scripts/install/install-terminal-tools-mac.sh
```

#### Windows用户
```powershell
# 以管理员身份运行PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install\install-terminal-tools-windows.ps1
```

### 已包含的工具

#### Mac工具列表
- Terminal: iTerm2, Warp, Alacritty
- Shell: Zsh, Oh My Zsh
- 实用工具: tmux, autojump, tree, htop, fzf, bat, ripgrep

#### Windows工具列表
- Terminal: Windows Terminal, WezTerm
- Shell: PowerShell 7, Nu Shell, Oh My Posh
- 实用工具: Git, fzf, bat, ripgrep, zoxide, Terminal-Icons

---

## Task 2: cmd使用说明 ✅

**状态**: 已完成

### 实现内容

#### 📚 文档
- [命令行 5 分钟入门](../../docs/guides/1-terminal/cmd-basics.md)

### 包含内容
1. ✅ 基本概念和 7 个必学命令 (ls, rm, cd, cp, mv, cat, echo)
2. ✅ 环境变量配置说明 (Mac/Linux + Windows)
3. ✅ 实用示例场景
4. ✅ 管道概念和 Linux "一切皆文件" 理念
5. ✅ 故障排除指南 (命令找不到、权限不足、终端卡住等)
