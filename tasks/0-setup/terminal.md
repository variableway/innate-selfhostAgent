# Terminal Tasks

## Task 1: 安装必要的Terminal工具 ✅

**状态**: 已完成

### 实现内容

#### 📚 文档
- [Mac Terminal安装指南](../../docs/guides/terminal-setup-mac.md) - 包含iTerm2、Warp、Alacritty、Zsh、Oh My Zsh、tmux、autojump等
- [Windows Terminal安装指南](../../docs/guides/terminal-setup-windows.md) - 包含Windows Terminal、WezTerm、PowerShell 7、Nu Shell、Oh My Posh等
- [使用说明文档](../../docs/guides/terminal-setup-usage.md) - 快速开始、验证、故障排查

#### 🔧 安装脚本
- [Mac一键安装脚本](../../scripts/install/install-terminal-tools-mac.sh)
- [Windows一键安装脚本](../../scripts/install/install-terminal-tools-windows.ps1)

#### 📦 Skill定义
- [Mac Terminal配置Skill](../../skills/beginner/terminal-setup-mac.json)
- [Windows Terminal配置Skill](../../skills/beginner/terminal-setup-windows.json)

### 快速使用

#### Mac用户
```bash
# 方式1: 直接运行
curl -fsSL https://raw.githubusercontent.com/your-repo/selfhost-agent/main/scripts/install/install-terminal-tools-mac.sh | bash

# 方式2: 本地运行
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

## 原始需求

首先用户: 初级用户:零基础或刚接触AI开发，用最简短的话描述需要安装的Terminal工具
1. 如何安装
2. 如何启动验证
3. 使用最简单的几个命令说明使用
以上都是guide，使用markdown文档保存。

需要安装的：
1. 最好用的三个terminal工具，Windows/MAC分别需要 ✅
2. terminal工具中如zsh，oh-my-zsh使用 ✅
3. 一些好用的工具如tmux，autojump安装 ✅
4. windows上nu shell，然后其他好用工具安装说明 ✅

用最简单的描述说明就可以，然后生产一件安装脚本，并且有使用说明。 ✅
如果Mac需要装brew，windows需要wget安装，请额外在文档中说明。 ✅

[参考文件](reference.md)


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

---

## 原始需求

1. 命令行工具使用最简单说明5分钟入门基本概念，常用命令主要：ls,rm,cd,cp,mv,cat,echo
2. 如果添加环境变量让命令行可以执行
3. 举例子说明这些工具的使用
4. 管道概念，Linux都是文件的理念
5. 一旦发现问题不能用命令行怎么处理？
