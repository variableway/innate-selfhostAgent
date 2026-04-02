# Node.js 开发环境安装指南

> 10 分钟完成 Node.js 环境配置

## 什么是 Node.js？

Node.js 是一个 JavaScript 运行环境，让 JS 可以脱离浏览器运行。npm 是 Node 的包管理器，用于安装各种工具和库。

---

## 安装方式对比

| 方式 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **fnm** | 快、跨平台、简单 | 需单独安装 | ⭐⭐⭐ |
| **nvm** | 成熟稳定、社区大 | 慢、仅 Mac/Linux | ⭐⭐ |
| **官网安装包** | 最简单 | 版本切换麻烦 | ⭐ |

**推荐使用 fnm** (Fast Node Manager)

---

## Mac 安装

### 方式一：一键安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/selfhost-agent/main/scripts/install/install-nodejs-mac.sh | bash
```

### 方式二：手动安装

#### 1. 安装 fnm

```bash
brew install fnm
```

#### 2. 配置 Shell

**Zsh (~/.zshrc):**
```bash
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc
source ~/.zshrc
```

**Bash (~/.bashrc):**
```bash
echo 'eval "$(fnm env)"' >> ~/.bashrc
source ~/.bashrc
```

#### 3. 安装 Node.js

```bash
# 安装 LTS 版本（推荐）
fnm install --lts

# 安装最新版
fnm install latest

# 安装指定版本
fnm install 20

# 使用指定版本
fnm use 20

# 设为默认版本
fnm default 20
```

---

## Windows 安装

### 方式一：PowerShell 脚本

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install\install-nodejs-windows.ps1
```

### 方式二：手动安装

#### 1. 安装 fnm

```powershell
winget install Schniz.fnm
```

或使用 Scoop:
```powershell
scoop install fnm
```

#### 2. 配置 PowerShell

```powershell
# 添加到 $PROFILE
Add-Content $PROFILE 'fnm env --use-on-cd | Out-String | Invoke-Expression'

# 重新加载
. $PROFILE
```

#### 3. 安装 Node.js

```powershell
fnm install --lts
fnm use
fnm default $(fnm current)
```

---

## 验证安装

```bash
# 检查 Node.js
node -v
# 输出: v20.x.x

# 检查 npm
npm -v
# 输出: 10.x.x

# 检查 fnm
fnm --version
```

---

## fnm 常用命令

```bash
# 查看已安装版本
fnm list

# 查看可安装版本
fnm ls-remote

# 安装 LTS 版本
fnm install --lts

# 切换版本
fnm use 18

# 设置默认版本
fnm default 20

# 在项目目录自动切换（需 .node-version 或 .nvmrc 文件）
fnm use
```

---

## npm 常用命令

```bash
# 初始化项目
npm init -y

# 安装依赖
npm install package-name
npm i package-name

# 安装开发依赖
npm install -D package-name

# 全局安装
npm install -g package-name

# 运行脚本
npm run dev
npm run build

# 查看全局安装的包
npm list -g --depth=0

# 更新包
npm update package-name

# 删除包
npm uninstall package-name
```

---

## 配置 npm 镜像（国内用户）

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 查看当前镜像
npm config get registry

# 恢复官方镜像
npm config set registry https://registry.npmjs.org
```

---

## 项目级 Node.js 版本管理

在项目根目录创建 `.node-version` 或 `.nvmrc` 文件：

```bash
# .node-version
20

# 或指定具体版本
20.11.0
```

进入项目目录时，fnm 会自动切换到对应版本（需配置 `--use-on-cd`）。

---

## 常见问题

### Q: node 命令找不到？

```bash
# 检查 fnm 是否配置
fnm list

# 查看已安装版本
fnm ls

# 使用指定版本（注意要指定版本号）
fnm use v24.14.1
fnm default v24.14.1
```

**详细故障排除:** 请参考 [fnm 故障排除指南](fnm-troubleshooting.md)

### Q: `fnm use` 报错 "Can't find version in dotfiles"?

需要明确指定版本号：

```bash
# 查看已安装版本
fnm ls

# 指定版本使用
fnm use v24.14.1
```

### Q: npm 安装很慢？

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### Q: 权限错误？

```bash
# Mac/Linux: 修复 npm 权限
sudo chown -R $(whoami) ~/.npm
```

---

## 下一步

- 安装 [Claude Code CLI](#)
- 配置 [Python 环境](python-setup.md)
- 了解 [IDE 选择](ide-setup.md)
