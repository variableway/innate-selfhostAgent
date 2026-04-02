# fnm 故障排除指南

## 问题 1: `fnm use` 报错 "Can't find version in dotfiles"

### 错误信息

```
error: Can't find version in dotfiles. Please provide a version manually to the command.
zsh: command not found: node
```

### 原因分析

`fnm use` 命令需要以下之一来确定使用哪个版本：
1. `.node-version` 文件
2. `.nvmrc` 文件
3. 明确指定的版本号

如果项目中没有这些文件，`fnm use` 就会报错。

### 解决方案

#### 方案 1: 指定版本号（推荐）

```bash
# 查看已安装的版本
fnm ls

# 使用指定版本
fnm use v24.14.1

# 设为默认版本
fnm default v24.14.1
```

#### 方案 2: 创建 .node-version 文件

```bash
# 在项目目录下创建
echo "24" > .node-version

# 或指定完整版本
echo "24.14.1" > .node-version

# 然后 fnm use 就能自动识别
fnm use
```

#### 方案 3: 使用别名

```bash
# 安装时创建别名
fnm install 24 --alias=default

# 使用别名
fnm use default
```

---

## 问题 2: `node: command not found`

### 原因分析

fnm 安装了 Node.js，但没有正确配置到 Shell 环境中。

### 解决方案

#### 步骤 1: 检查 fnm 是否正确配置

```bash
# 检查 fnm 命令
fnm --version

# 查看 fnm env 输出
fnm env
```

#### 步骤 2: 配置 Shell

**Zsh (~/.zshrc):**

```bash
# 编辑配置文件
nano ~/.zshrc

# 添加以下内容（在文件末尾）
eval "$(fnm env --use-on-cd)"

# 保存后重新加载
source ~/.zshrc
```

**Bash (~/.bashrc):**

```bash
echo 'eval "$(fnm env)"' >> ~/.bashrc
source ~/.bashrc
```

**Fish (~/.config/fish/config.fish):**

```fish
fnm env --use-on-cd | source
```

#### 步骤 3: 验证

```bash
# 重新打开终端后
node -v
# 输出: v24.x.x

npm -v
# 输出: 10.x.x
```

---

## 问题 3: `fnm install --lts` 后无法使用

### 完整解决流程

```bash
# 1. 安装 LTS 版本
fnm install --lts

# 2. 查看已安装的版本
fnm ls
# 输出类似:
# * v24.14.1
#   system

# 3. 使用刚安装的版本（注意要指定版本号）
fnm use v24.14.1

# 4. 设为默认版本
fnm default v24.14.1

# 5. 验证
node -v
```

---

## 问题 4: 版本号自动获取技巧

### 在脚本中自动获取并使用最新安装的版本

```bash
# 方法 1: 获取第一个已安装版本
LTS_VERSION=$(fnm ls | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
fnm use "$LTS_VERSION"
fnm default "$LTS_VERSION"

# 方法 2: 使用 fnm current（需要先有激活版本）
fnm use $(fnm ls-remote --lts | head -1 | awk '{print $1}')
```

### PowerShell 版本

```powershell
$ltsVersion = (fnm ls | Select-String -Pattern 'v[\d.]+' | Select-Object -First 1).Matches.Value
fnm use $ltsVersion
fnm default $ltsVersion
```

---

## 问题 5: 多版本切换问题

### 查看所有已安装版本

```bash
fnm ls
# 输出:
#   v18.20.0
# * v20.11.0    # * 表示当前使用的版本
#   v24.14.1
#   system
```

### 切换版本

```bash
# 临时切换（仅当前 Shell）
fnm use 18

# 设置默认版本（新终端使用）
fnm default 20

# 项目级版本（在项目目录创建 .node-version）
cd my-project
echo "18" > .node-version
# 进入目录自动切换（需要 --use-on-cd 配置）
```

---

## fnm 配置文件位置

| 配置项 | 位置 |
|--------|------|
| Node.js 版本 | `~/.local/share/fnm/node-versions/` |
| 别名 | `~/.local/share/fnm/aliases/` |
| Shell 配置 | `~/.zshrc` / `~/.bashrc` |

---

## 常用命令速查

```bash
fnm install --lts          # 安装最新 LTS
fnm install 20             # 安装 Node.js 20
fnm ls                     # 列出已安装版本
fnm ls-remote              # 列出可安装版本
fnm use v20.11.0           # 使用指定版本
fnm default v20.11.0       # 设为默认
fnm current                # 显示当前版本
fnm exec --using=18 -- node app.js  # 使用指定版本执行命令
fnm uninstall 18           # 卸载版本
```

---

## 相关链接

- [fnm GitHub](https://github.com/Schniz/fnm)
- [fnm 文档](https://github.com/Schniz/fnm#readme)
