# Python 开发环境安装指南

> 10 分钟完成 Python 环境配置

## 为什么需要版本管理？

Python 版本众多，不同项目可能需要不同版本。使用版本管理工具可以：
- 轻松切换 Python 版本
- 隔离项目依赖
- 避免系统 Python 污染

---

## 安装方式对比

| 方式 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **uv** | 极快、全功能 | 较新 | ⭐⭐⭐ |
| **pyenv** | 成熟稳定 | 慢、编译安装 | ⭐⭐ |
| **Miniconda** | 数据科学友好 | 重 | ⭐⭐ |
| **官网安装包** | 简单 | 版本管理麻烦 | ⭐ |

**推荐使用 uv** (新一代 Python 工具，极速)

---

## Mac 安装

### 方式一：一键安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/selfhost-agent/main/scripts/install/install-python-mac.sh | bash
```

### 方式二：手动安装

#### 1. 安装 uv

```bash
# 使用 Homebrew
brew install uv

# 或使用官方安装脚本
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 2. 安装 Python

```bash
# 安装最新稳定版
uv python install 3.12

# 安装指定版本
uv python install 3.11
uv python install 3.10

# 查看已安装版本
uv python list
```

#### 3. 设置默认版本

```bash
# 全局默认
uv python pin 3.12

# 或添加到 shell 配置
echo 'export UV_PYTHON_PREFERENCE=only-managed' >> ~/.zshrc
```

---

## Windows 安装

### 方式一：PowerShell 脚本

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install\install-python-windows.ps1
```

### 方式二：手动安装

#### 1. 安装 uv

```powershell
# 使用 winget
winget install astral-sh.uv

# 或使用 PowerShell 安装脚本
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### 2. 安装 Python

```powershell
# 安装最新版
uv python install 3.12

# 查看已安装版本
uv python list
```

---

## 验证安装

```bash
# 检查 Python
python --version
# 或
uv python --version

# 检查 pip
pip --version

# 检查 uv
uv --version
```

---

## uv 常用命令

```bash
# Python 版本管理
uv python install 3.12     # 安装 Python
uv python list             # 列出可用版本
uv python find 3.12        # 查找 Python 路径
uv python pin 3.12         # 固定项目 Python 版本

# 项目管理
uv init my-project         # 创建新项目
uv add requests            # 添加依赖
uv remove requests         # 移除依赖
uv sync                    # 同步依赖
uv lock                    # 锁定依赖版本

# 运行命令
uv run python app.py       # 在虚拟环境中运行
uv run pytest              # 运行测试

# 工具安装
uv tool install ruff       # 安装全局工具
uv tool run black .        # 一次性运行工具
```

---

## pip 常用命令

```bash
# 安装包
pip install package_name
pip install package_name==1.0.0

# 安装开发依赖
pip install -e .

# 从 requirements.txt 安装
pip install -r requirements.txt

# 查看已安装的包
pip list

# 查看包详情
pip show package_name

# 导出依赖
pip freeze > requirements.txt

# 升级包
pip install --upgrade package_name

# 卸载包
pip uninstall package_name
```

---

## 虚拟环境管理

### 使用 uv（推荐）

```bash
# 创建虚拟环境
uv venv

# 指定 Python 版本
uv venv --python 3.11

# 激活虚拟环境
source .venv/bin/activate    # Mac/Linux
.venv\Scripts\activate       # Windows

# 退出虚拟环境
deactivate
```

### 使用 venv（内置）

```bash
# 创建虚拟环境
python -m venv .venv

# 激活
source .venv/bin/activate    # Mac/Linux
.venv\Scripts\activate       # Windows
```

---

## 项目依赖管理

### requirements.txt 方式

```bash
# 生成
pip freeze > requirements.txt

# 安装
pip install -r requirements.txt
```

### pyproject.toml 方式（推荐）

```bash
# 初始化项目
uv init

# 会生成 pyproject.toml
[project]
name = "my-project"
version = "0.1.0"
dependencies = [
    "requests>=2.28.0",
]

# 添加依赖
uv add requests
uv add pytest --dev

# 安装所有依赖
uv sync
```

---

## 配置 pip 镜像（国内用户）

```bash
# 临时使用
pip install package_name -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 常用镜像
# 清华: https://pypi.tuna.tsinghua.edu.cn/simple
# 阿里: https://mirrors.aliyun.com/pypi/simple
# 豆瓣: https://pypi.douban.com/simple
```

---

## 安装第三方 CLI 工具示例

### Kimi CLI (Moonshot AI)

```bash
# 安装
pip install kimi-cli

# 或使用 uv
uv tool install kimi-cli

# 配置 API Key
export MOONSHOT_API_KEY="your-api-key"

# 使用
kimi chat
kimi "解释这段代码"
```

### 其他常用工具

```bash
# 代码格式化
pip install black isort

# 代码检查
pip install ruff pylint

# 测试
pip install pytest

# Jupyter
pip install jupyter

# AI/ML
pip install openai anthropic
```

---

## 常见问题

### Q: python 命令找不到？

```bash
# 检查 uv 安装的 Python
uv python find 3.12

# 添加到 PATH（如果需要）
export PATH="$HOME/.local/bin:$PATH"
```

### Q: pip 安装很慢？

```bash
# 使用国内镜像
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q: 权限错误？

```bash
# 使用虚拟环境（推荐）
uv venv && source .venv/bin/activate

# 或用户级安装
pip install --user package_name
```

### Q: 版本冲突？

```bash
# 使用虚拟环境隔离
uv venv
source .venv/bin/activate
pip install package_name
```

---

## 下一步

- [AI CLI 工具安装](ai-cli-tools.md)
- [IDE 选择与配置](ide-setup.md)
