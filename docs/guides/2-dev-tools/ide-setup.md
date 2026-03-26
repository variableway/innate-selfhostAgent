# IDE 选择与配置指南

> 找到最适合你的代码编辑器

## 快速选择

| IDE | 适合人群 | 特点 | 价格 |
|-----|---------|------|------|
| **VS Code** | 所有人 | 生态丰富、免费 | 免费 |
| **Cursor** | AI 开发者 | AI 原生、Claude 集成 | 免费/付费 |
| **Zed** | 追求速度 | 极速、协作 | 免费 |
| **PyCharm** | Python 开发 | 专业 Python 功能 | 免费/付费 |
| **WebStorm** | 前端开发 | 专业 JS/TS | 付费 |

---

## VS Code

最流行的代码编辑器，插件生态最丰富。

### 安装

**Mac:**
```bash
brew install --cask visual-studio-code
```

**Windows:**
```powershell
winget install Microsoft.VisualStudioCode
```

### 推荐 AI 插件

```
# AI 编程助手
- GitHub Copilot        # GitHub 官方 AI
- Claude Dev           # Claude 助手
- Codeium              # 免费 AI 补全
- Continue             # 开源 AI 助手

# 通用插件
- Python               # Python 支持
- Prettier             # 代码格式化
- ESLint               # JS/TS 检查
- GitLens              # Git 增强
- Error Lens           # 错误提示
- Docker               # Docker 支持
```

### 快捷键速查

| 功能 | Mac | Windows |
|------|-----|---------|
| 命令面板 | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| 快速打开 | `Cmd+P` | `Ctrl+P` |
| 终端 | `` Cmd+` `` | `` Ctrl+` `` |
| 分屏 | `Cmd+\` | `Ctrl+\` |
| 搜索 | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| 多光标 | `Option+Click` | `Alt+Click` |

### 官方链接
- [官网](https://code.visualstudio.com/)
- [插件市场](https://marketplace.visualstudio.com/)

---

## Cursor

AI 原生代码编辑器，基于 VS Code，深度集成 AI。

### 安装

**Mac:**
```bash
brew install --cask cursor
```

**Windows:**
```powershell
winget install CursorAI.Cursor
```

### 核心功能

- **Cmd+K**: AI 代码生成/修改
- **Cmd+L**: AI 对话
- **Tab**: AI 代码补全
- **Cmd+Shift+K**: AI 终端

### AI 模型选择

Cursor 支持多种 AI 模型：
- Claude 4 (推荐)
- GPT-4
- Cursor Small

### 定价
- 免费版: 每月 2000 次 AI 补全
- Pro: $20/月，无限使用

### 官方链接
- [官网](https://cursor.sh/)
- [文档](https://docs.cursor.sh/)

---

## Zed

由 Atom 原创团队开发，追求极致速度。

### 安装

**Mac:**
```bash
brew install --cask zed
```

**Windows/Linux:**
```bash
# 暂不支持，开发中
```

### 特点
- 启动速度极快
- 原生 AI 集成
- 实时协作
- Vim 模式

### 官方链接
- [官网](https://zed.dev/)

---

## PyCharm

专业 Python IDE，JetBrains 出品。

### 安装

**Mac:**
```bash
brew install --cask pycharm-ce  # 社区版（免费）
brew install --cask pycharm     # 专业版（付费）
```

**Windows:**
```powershell
winget install JetBrains.PyCharm.Community
```

### 适合场景
- 数据科学
- Django/Flask 开发
- 大型 Python 项目

### 官方链接
- [官网](https://www.jetbrains.com/pycharm/)

---

## WebStorm

专业前端 IDE，JetBrains 出品。

### 安装

**Mac:**
```bash
brew install --cask webstorm
```

**Windows:**
```powershell
winget install JetBrains.WebStorm
```

### 适合场景
- React/Vue/Angular 开发
- TypeScript 项目
- 大型前端项目

### 官方链接
- [官网](https://www.jetbrains.com/webstorm/)

---

## 配置同步

### VS Code / Cursor

使用 Settings Sync 同步配置：

1. 登录 GitHub/Microsoft 账号
2. 开启 Settings Sync
3. 选择要同步的内容：
   - 设置
   - 快捷键
   - 插件
   - 代码片段

```bash
# 手动同步
Cmd+Shift+P → "Settings Sync: Sync"
```

---

## 推荐配置

### settings.json (VS Code / Cursor)

```json
{
  "editor.fontSize": 14,
  "editor.fontFamily": "JetBrains Mono, Menlo, monospace",
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "editor.lineNumbers": "relative",
  "workbench.colorTheme": "One Dark Pro",
  "terminal.integrated.fontSize": 13,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### 安装字体

推荐等宽编程字体：

```bash
# Mac
brew tap homebrew/cask-fonts
brew install --cask font-jetbrains-mono
brew install --cask font-fira-code
brew install --cask font-meslo-lg

# Windows
winget install JetBrains.JetBrainsMono
```

---

## 故障排除

### Q: VS Code 插件安装失败？

```bash
# 清除缓存
rm -rf ~/.vscode/extensions/.obsolete

# 手动安装
code --install-extension <extension-id>
```

### Q: Cursor 无法登录？

```bash
# 清除认证缓存
rm -rf ~/Library/Application\ Support/Cursor/User/globalStorage
```

### Q: 终端字体乱码？

安装 Nerd Font 字体并在终端设置中选择：
```bash
brew install --cask font-meslo-lg-nerd-font
```

---

## 下一步

- [Node.js 环境配置](nodejs-setup.md)
- [Python 环境配置](python-setup.md)
- [AI CLI 工具](ai-cli-tools.md)
