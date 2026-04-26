# Git Command Basics

请制作一个10-15分钟阅读的文档，完成一下内容：
1. git的基本操作
2. git和github的结合使用
3. 使用github cli： gh的基本使用
4. git worktree使用介绍

## 1. Git 基本操作 (Basic Git Operations)

Git 是目前最流行的分布式版本控制系统。以下是日常开发中最常用的命令：

### 配置 Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 初始化与克隆
- `git init`: 在当前目录初始化一个新的 Git 仓库。
- `git clone <url>`: 克隆远程仓库。

### 暂存与提交
- `git status`: 查看当前工作区状态。
- `git add <file>`: 将文件添加到暂存区。`git add .` 添加所有更改。
- `git commit -m "message"`: 提交暂存区的更改到本地仓库。

### 分支管理
- `git branch`: 查看分支。
- `git checkout -b <branch-name>`: 创建并切换到新分支。
- `git checkout <branch-name>`: 切换分支。
- `git merge <branch-name>`: 合并指定分支到当前分支。

### 查看历史
- `git log`: 查看提交历史。
- `git diff`: 查看工作区与暂存区的差异。

---

## 2. Git 与 GitHub 结合使用 (Git & GitHub Integration)

GitHub 是基于 Git 的代码托管平台。

### 远程仓库管理
- `git remote add origin <url>`: 关联远程仓库。
- `git remote -v`: 查看关联的远程仓库。

### 推送与拉取
- `git push -u origin <branch-name>`: 首次推送并建立追踪。
- `git push`: 推送更改。
- `git pull`: 从远程拉取并合并更改。
- `git fetch`: 从远程拉取但不合并。

### SSH 配置 (推荐)
使用 SSH 密钥可以免去频繁输入密码的烦恼。
1. 生成密钥: `ssh-keygen -t ed25519 -C "your.email@example.com"`
2. 将公钥 (`~/.ssh/id_ed25519.pub`) 添加到 GitHub Settings -> SSH and GPG keys。

---

## 3. GitHub CLI: `gh` 的基本使用 (Using GitHub CLI)

`gh` 是 GitHub 官方提供的命令行工具，可以让你在终端完成大多数 GitHub 网页端的操作。

### 身份验证
```bash
gh auth login
```

### 仓库操作
- `gh repo clone <owner/repo>`: 克隆仓库。
- `gh repo create`: 交互式创建新仓库。
- `gh repo view --web`: 在浏览器中打开当前仓库。

### Pull Request (PR) 管理
- `gh pr list`: 查看当前仓库的 PR 列表。
- `gh pr create`: 创建一个新的 PR。
- `gh pr checkout <number>`: 检出特定 PR 到本地。
- `gh pr merge <number>`: 合并 PR。

### Issue 管理
- `gh issue list`: 查看 Issue。
- `gh issue create`: 创建 Issue。

---

## 4. Git Worktree 使用介绍 (Introduction to Git Worktree)

Git Worktree 允许你在同一个仓库中同时检出多个分支到不同的目录。这在需要同时处理多个紧急任务（例如修复 Bug 的同时开发新功能）时非常有用。

### 基本命令
- `git worktree add <path> <branch>`: 在指定路径创建一个新的工作树，并关联到指定分支。
  ```bash
  git worktree add ../fix-bug-branch fix-bug
  ```
- `git worktree list`: 列出所有关联的工作树。
- `git worktree remove <path>`: 删除指定的工作树（注意：这不会删除分支）。
- `git worktree prune`: 清理不再存在的工作树记录。

### 优势
- **并行工作**: 无需 `git stash` 即可切换上下文。
- **独立环境**: 每个工作树都有独立的构建产物，互不干扰。