# DEV TOOLS

## Task 1: Install NodeJS ✅

**状态**: 已完成

### 实现内容

#### 📚 文档
- [Node.js 开发环境安装指南](../../docs/guides/2-dev-tools/nodejs-setup.md)
- [AI CLI 工具安装指南](../../docs/guides/2-dev-tools/ai-cli-tools.md) (Claude Code CLI 等)

#### 🔧 安装脚本
- [Mac 安装脚本](../../scripts/install/install-nodejs-mac.sh)
- [Windows 安装脚本](../../scripts/install/install-nodejs-windows.ps1)

### 包含内容
1. ✅ fnm 版本管理器安装
2. ✅ Node.js LTS 安装
3. ✅ npm 镜像配置（国内用户）
4. ✅ Claude Code CLI 安装说明

---

## Task 2: Install Python ✅

**状态**: 已完成

### 实现内容

#### 📚 文档
- [Python 开发环境安装指南](../../docs/guides/2-dev-tools/python-setup.md)

#### 🔧 安装脚本
- [Mac 安装脚本](../../scripts/install/install-python-mac.sh)
- [Windows 安装脚本](../../scripts/install/install-python-windows.ps1)

### 包含内容
1. ✅ uv 版本管理器安装（极速工具）
2. ✅ Python 3.12/3.11 安装
3. ✅ pip 镜像配置（国内用户）
4. ✅ pip 组件安装示例
5. ✅ 项目依赖管理说明（requirements.txt + pyproject.toml）
6. ✅ Kimi CLI 安装说明

---

## Task 3: 常见IDE说明 ✅

**状态**: 已完成

### 实现内容

#### 📚 文档
- [IDE 选择与配置指南](../../docs/guides/2-dev-tools/ide-setup.md)

### 包含内容
1. ✅ VS Code 安装和配置
2. ✅ Cursor AI 编辑器
3. ✅ Zed 编辑器
4. ✅ PyCharm / WebStorm
5. ✅ 推荐插件和配置
6. ✅ 编程字体安装

---

## 快速使用

### Node.js 安装

```bash
# Mac
./scripts/install/install-nodejs-mac.sh

# Windows
.\scripts\install\install-nodejs-windows.ps1
```

### Python 安装

```bash
# Mac
./scripts/install/install-python-mac.sh

# Windows
.\scripts\install\install-python-windows.ps1
```

---

## 文件结构

```
docs/guides/2-dev-tools/
├── nodejs-setup.md      # Node.js 安装指南
├── python-setup.md      # Python 安装指南
├── ai-cli-tools.md      # AI CLI 工具（Claude Code 等）
└── ide-setup.md         # IDE 选择与配置

scripts/install/
├── install-nodejs-mac.sh
├── install-nodejs-windows.ps1
├── install-python-mac.sh
└── install-python-windows.ps1
```
