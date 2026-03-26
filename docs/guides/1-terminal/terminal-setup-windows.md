# Windows Terminal工具安装指南

> 适用人群: 初级用户 - 零基础或刚接触AI开发

## 前置要求

### 安装 wget (Windows下载工具)

**方法1: 使用PowerShell (推荐)**
Windows 10/11已内置 curl，可作为wget替代:
```powershell
curl -o filename.zip https://example.com/file.zip
```

**方法2: 安装wget**
1. 访问 https://eternallybored.org/misc/wget/
2. 下载最新版 wget.exe
3. 将其放入 `C:\Windows\System32\`

**验证**:
```powershell
curl --version
# 或
wget --version
```

---

### 安装 winget (Windows包管理器)

Windows 10/11已内置winget。如果没有，请安装 [App Installer](https://www.microsoft.com/p/app-installer/9nblggh4nns1)

**验证**:
```powershell
winget --version
```

**或安装 Chocolatey**:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

---

## 推荐的三个Terminal工具

### 1. Windows Terminal (推荐指数: ⭐⭐⭐⭐⭐)

**简介**: 微软官方现代化终端，支持多标签和分屏

**GitHub**: https://github.com/microsoft/terminal

**安装**:
```powershell
winget install Microsoft.WindowsTerminal
```

**或从Microsoft Store安装**:
- 打开Microsoft Store
- 搜索 "Windows Terminal"
- 点击"获取"

**启动验证**:
- Win键，输入 "wt"
- 或从开始菜单找到Windows Terminal

**常用快捷键**:
- `Ctrl+Shift+T`: 新建标签页
- `Ctrl+Shift+D`: 复制标签页
- `Alt+Shift++`: 垂直分屏
- `Alt+Shift+-`: 水平分屏
- `Ctrl+Shift+W`: 关闭标签页

---

### 2. WezTerm (推荐指数: ⭐⭐⭐⭐⭐)

**简介**: 高性能跨平台终端，支持多路复用

**官网**: https://wezfurlong.org/wezterm/  
**GitHub**: https://github.com/wez/wezterm

**安装**:
```powershell
winget install wez.wezterm
```

**启动验证**:
- Win键，输入 "WezTerm"

**特点**:
- 内置tmux-like多路复用
- Lua配置
- GPU加速渲染

**常用快捷键**:
- `Ctrl+Shift+%`: 垂直分屏
- `Ctrl+Shift+"`: 水平分屏
- `Ctrl+Shift+ArrowKey`: 调整窗格大小

---

### 3. Fluent Terminal (推荐指数: ⭐⭐⭐⭐)

**简介**: UWP应用，支持SSH和WSL

**GitHub**: https://github.com/felixse/FluentTerminal

**安装**:
从Microsoft Store搜索 "Fluent Terminal" 安装

**特点**:
- UWP应用
- 支持SSH连接
- 集成WSL

---

## Shell增强工具

### PowerShell 7 + Oh My Posh

#### 1. 安装 PowerShell 7
```powershell
winget install Microsoft.PowerShell
```

**验证**:
```powershell
pwsh --version
```

#### 2. 安装 Oh My Posh

**GitHub**: https://github.com/JanDeDobbeleer/oh-my-posh

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

**配置** (编辑 $PROFILE):
```powershell
notepad $PROFILE
```

添加以下内容:
```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\paradox.omp.json" | Invoke-Expression
```

**安装字体** (推荐):
```powershell
oh-my-posh font install
```

选择 "FiraCode Nerd Font" 或 "CascadiaCode Nerd Font"

**重新打开终端验证**

---

### Nu Shell (推荐指数: ⭐⭐⭐⭐)

**简介**: 现代化数据驱动的Shell

**官网**: https://www.nushell.sh/  
**GitHub**: https://github.com/nushell/nushell

**安装**:
```powershell
winget install Nushell.Nushell
```

**验证**:
```powershell
nu --version
```

**启动**:
```powershell
nu
```

**特点**:
- 数据管道处理
- 结构化输出
- 内置表格支持

**常用命令**:
```nu
ls | where size > 1mb           # 查找大于1MB的文件
ps | where cpu > 5              # 查找CPU使用>5%的进程
open data.json | get items      # 处理JSON数据
```

---

## 实用工具

### 1. Git for Windows

**安装**:
```powershell
winget install Git.Git
```

**验证**:
```powershell
git --version
```

---

### 2. tmux替代: zoxide + Starship

#### zoxide (智能目录跳转)

**GitHub**: https://github.com/ajeetdsouza/zoxide

```powershell
winget install ajeetdsouza.zoxide
```

**配置** (添加到 $PROFILE):
```powershell
Invoke-Expression (& { (zoxide init powershell | Out-String) })
```

**使用**:
```powershell
z directory_name    # 跳转到目录
zi                   # 交互式选择
```

---

### 3. 其他实用工具

#### fzf (模糊搜索)

**GitHub**: https://github.com/junegunn/fzf

```powershell
winget install junegunn.fzf
```

使用 `Ctrl+R` 搜索命令历史

#### bat (增强的cat)

**GitHub**: https://github.com/sharkdp/bat

```powershell
winget install sharkdp.bat
```

#### ripgrep (快速搜索)
```powershell
winget install BurntSushi.ripgrep.MSVC
```

#### Terminal-Icons (PowerShell图标)

**GitHub**: https://github.com/devblackops/Terminal-Icons

```powershell
Install-Module -Name Terminal-Icons -Repository PSGallery -Force
```

添加到 $PROFILE:
```powershell
Import-Module Terminal-Icons
```

---

## WSL2 (Windows Subsystem for Linux)

### 安装WSL2
```powershell
wsl --install
```

这会自动安装Ubuntu。重启后完成设置。

**安装其他发行版**:
```powershell
wsl --list --online              # 查看可用发行版
wsl --install -d Ubuntu-22.04    # 安装Ubuntu 22.04
```

**WSL2中使用Linux工具**:
- 进入WSL: `wsl`
- 使用apt安装工具: `sudo apt install tmux autojump`

---

## 一键安装脚本

参考 [install-terminal-tools-windows.ps1](../../scripts/install/install-terminal-tools-windows.ps1)

## 快速验证

运行以下PowerShell命令验证安装:
```powershell
Write-Host "=== 验证工具安装 ===" -ForegroundColor Green
Write-Host "winget: $(winget --version)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Git: $(git --version)"
Write-Host "Windows Terminal: $(Get-AppxPackage Microsoft.WindowsTerminal | Select-Object -ExpandProperty Version)"
Write-Host "Nu Shell: $(nu --version 2>$null)"
Write-Host "zoxide: $(zoxide --version 2>$null)"
Write-Host "bat: $(bat --version 2>$null)"
Write-Host "ripgrep: $(rg --version 2>$null | Select-Object -First 1)"
```

## 推荐配置

### Windows Terminal配置

打开设置 (Ctrl+,)，添加以下配置:

```json
{
    "profiles": {
        "defaults": {
            "font": {
                "face": "Cascadia Code PL",
                "size": 11
            },
            "colorScheme": "One Half Dark",
            "opacity": 95
        }
    }
}
```

### PowerShell Profile 完整配置

```powershell
# Oh My Posh
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\paradox.omp.json" | Invoke-Expression

# zoxide
Invoke-Expression (& { (zoxide init powershell | Out-String) })

# Terminal Icons
Import-Module Terminal-Icons

# PSReadLine (命令行编辑增强)
Set-PSReadLineOption -PredictiveViewSource History
Set-PSReadLineOption -EditMode Windows
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
```

## 下一步

- 配置 [WSL2环境](../wsl-setup.md)
- 安装 [Python环境](../python-setup.md)
- 设置 [Git配置](../git-setup.md)

## 常见问题

**Q: winget命令找不到?**
A: 更新Windows或手动安装 [App Installer](https://www.microsoft.com/p/app-installer/9nblggh4nns1)

**Q: Oh My Posh显示乱码?**
A: 安装Nerd Font字体并在终端设置中使用该字体

**Q: PowerShell执行策略错误?**
A: 运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Q: WSL2安装失败?**
A: 确保BIOS中启用了虚拟化，并运行:
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
