# Executable Tutorial - 产品需求文档 (PRD)

> 版本：v1.0  
> 创建时间：2026-04-08  
> 产品名称：Executable Tutorial Desktop App

---

## 1. 产品概述

### 1.1 产品背景

Executable Tutorial 是一款面向初学者的桌面应用，旨在通过交互式教程帮助用户学习开发工具和环境配置。与传统静态教程不同，本应用的教程包含可执行的代码块，用户可以直接在应用内运行命令，实时看到执行结果。

### 1.2 产品定位

| 维度 | 描述 |
|-----|------|
| **目标用户** | 零基础或初级开发者 |
| **核心价值** | 边学边做，理论与实践结合 |
| **使用场景** | 本地环境搭建、工具学习、技能训练 |
| **产品形态** | 桌面应用（Tauri + Next.js） |

### 1.3 产品愿景

> 让学习技术像玩游戏一样简单有趣，每个教程都是可执行的，每个概念都能立即实践。

---

## 2. 用户故事

### 2.1 主要用户画像

#### 用户一：小明（零基础小白）
- **背景**：大学生，对编程感兴趣但毫无基础
- **痛点**：不知道怎么开始，网上教程太零散
- **需求**：
  - 清晰的学习路径
  - 一步到位的环境配置
  - 能看到实际效果

#### 用户二：小红（初级开发者）
- **背景**：会一些基础，想学习新工具
- **痛点**：工具配置麻烦，版本冲突多
- **需求**：
  - 快速配置开发环境
  - 可靠的安装脚本
  - 遇到问题能快速解决

### 2.2 用户故事列表

| ID | 作为 | 我想要 | 以便于 | 优先级 |
|----|-----|--------|--------|--------|
| US-001 | 小白用户 | 看到清晰的学习路径 | 知道从哪开始学 | P0 |
| US-002 | 小白用户 | 一键执行安装命令 | 不用手动复制粘贴 | P0 |
| US-003 | 小白用户 | 实时看到命令输出 | 了解发生了什么 | P0 |
| US-004 | 初级用户 | 导入外部教程 | 学习更多内容 | P1 |
| US-005 | 初级用户 | 追踪学习进度 | 知道学了哪些 | P1 |
| US-006 | 高级用户 | 编写自己的教程 | 分享知识给他人 | P2 |

---

## 3. 功能需求

### 3.1 功能架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Executable Tutorial                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browse    │  │   Learn     │  │     Execute         │  │
│  │   浏览      │  │   学习      │  │     执行            │  │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤  │
│  │ • 教程列表  │  │ • 教程阅读  │  │ • 命令执行          │  │
│  │ • 系列展示  │  │ • 代码高亮  │  │ • 实时输出          │  │
│  │ • 搜索筛选  │  │ • 进度追踪  │  │ • 结果验证          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Import    │  │   Manage    │  │     Settings        │  │
│  │   导入      │  │   管理      │  │     设置            │  │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤  │
│  │ • 文件导入  │  │ • 本地目录  │  │ • 终端配置          │  │
│  │ • URL导入   │  │ • 进度重置  │  │ • 外观主题          │  │
│  │ • 拖拽添加  │  │ • 删除教程  │  │ • 快捷键            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 功能详细说明

#### F1. 首页（总体展示页面）

**功能描述**：应用启动后的主页面，展示教程和系列概览。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F1.1 系列卡片展示 | 以卡片形式展示系列，每个卡片显示标题、描述、教程数量 | P0 |
| F1.2 最近教程 | 展示最近添加或更新的教程 | P0 |
| F1.3 搜索栏 | 支持按关键词搜索教程 | P0 |
| F1.4 筛选器 | 按分类、难度、标签筛选 | P1 |
| F1.5 快捷操作 | 底部显示"添加本地目录"和"导入教程"按钮 | P1 |

**交互流程**：

```
用户打开应用
    ↓
展示首页
    ↓
┌─────────────────┬─────────────────┐
↓                 ↓                 ↓
点击系列卡片    点击教程         使用搜索/筛选
    ↓                 ↓                 ↓
进入系列详情    进入教程详情      更新列表
```

#### F2. 导航栏

**功能描述**：顶部导航栏，提供全局导航功能。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F2.1 Logo/首页 | 点击返回首页 | P0 |
| F2.2 教程导航 | 展示所有教程的列表 | P0 |
| F2.3 系列导航 | 展示所有系列 | P0 |
| F2.4 设置入口 | 进入设置页面 | P1 |
| F2.5 面包屑 | 显示当前位置 | P1 |

#### F3. 系列详情页

**功能描述**：展示系列内的教程列表和进度。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F3.1 系列信息 | 显示系列标题、描述、总进度 | P0 |
| F3.2 教程列表 | 以卡片或列表形式展示教程 | P0 |
| F3.3 更多按钮 | 超过3个教程时显示"查看更多" | P0 |
| F3.4 进度追踪 | 显示每个教程的完成状态 | P1 |
| F3.5 开始学习 | 从未完成的教程开始 | P1 |

#### F4. 教程详情页

**功能描述**：展示教程内容，支持可执行代码块。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F4.1 Markdown渲染 | 渲染教程内容 | P0 |
| F4.2 代码高亮 | 语法高亮显示 | P0 |
| F4.3 可执行代码块 | 标识可执行的代码 | P0 |
| F4.4 运行按钮 | 点击执行代码 | P0 |
| F4.5 终端展示 | 执行时显示终端 | P0 |
| F4.6 进度保存 | 记录阅读进度 | P1 |
| F4.7 完成标记 | 手动标记教程完成 | P1 |

#### F5. 终端功能

**功能描述**：内置终端，用于执行教程中的命令。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F5.1 终端显示 | 首次点击运行时展开终端 | P0 |
| F5.2 位置切换 | 支持右侧/底部位置切换 | P0 |
| F5.3 实时输出 | 命令执行时实时显示输出 | P0 |
| F5.4 滚动跟随 | 输出自动滚动到底部 | P0 |
| F5.5 手动输入 | 支持在终端中手动输入命令 | P1 |
| F5.6 历史记录 | 保存命令历史 | P2 |

**终端状态流转**：

```
隐藏状态
    ↓ 点击运行
展开状态（默认位置：右侧）
    ↓ 点击切换位置
切换为底部/右侧
    ↓ 点击最小化
隐藏状态
```

#### F6. 文件导入

**功能描述**：支持导入外部教程内容。

**功能点**：

| 功能点 | 描述 | 优先级 |
|-------|------|--------|
| F6.1 本地文件导入 | 选择本地 Markdown 文件 | P1 |
| F6.2 本地目录添加 | 添加整个教程目录 | P1 |
| F6.3 URL导入 | 从 URL 导入教程（调研功能） | P2 |
| F6.4 拖拽导入 | 拖拽文件到应用窗口 | P2 |

---

## 4. 非功能需求

### 4.1 性能需求

| 指标 | 目标值 | 说明 |
|-----|--------|------|
| 启动时间 | < 3秒 | 应用冷启动时间 |
| 页面切换 | < 300ms | 页面间切换延迟 |
| 终端响应 | < 100ms | 命令输入到显示的延迟 |
| 内存占用 | < 300MB | 运行时内存使用 |
| 安装包大小 | < 50MB | 最终安装包体积 |

### 4.2 兼容性需求

| 平台 | 支持版本 | 说明 |
|-----|---------|------|
| macOS | 11+ (Big Sur) | Intel & Apple Silicon |
| Windows | 10/11 | 64位 |
| Linux | Ubuntu 20.04+ | 实验性支持 |

### 4.3 安全需求

| 需求 | 说明 |
|-----|------|
| 命令白名单 | 只允许执行预定义的命令 |
| 用户确认 | 危险操作前需要用户确认 |
| 沙箱执行 | 限制命令的执行范围 |
| 路径验证 | 验证工作目录合法性 |

### 4.4 用户体验需求

| 需求 | 说明 |
|-----|------|
| 离线可用 | 内置教程无需网络 |
| 深色/浅色主题 | 支持主题切换 |
| 字体可调 | 终端和内容字体大小可调 |
| 快捷键支持 | 常用操作支持快捷键 |

---

## 5. 界面设计规范

### 5.1 设计原则

- **简洁清晰**：减少视觉干扰，聚焦内容
- **一致性**：保持交互和视觉的一致性
- **反馈及时**：操作后立即给出反馈
- **容错友好**：错误提示清晰，提供解决方案

### 5.2 色彩规范

```css
/* 主色调 */
--primary: #3b82f6;        /* 蓝色 - 主要操作 */
--primary-hover: #2563eb;

/* 成功/警告/错误 */
--success: #22c55e;        /* 绿色 */
--warning: #f59e0b;        /* 黄色 */
--error: #ef4444;          /* 红色 */

/* 背景色（深色主题） */
--bg-primary: #0f172a;     /* 主背景 */
--bg-secondary: #1e293b;   /* 卡片背景 */
--bg-tertiary: #334155;    /* 悬停背景 */

/* 文字色 */
--text-primary: #f8fafc;   /* 主要文字 */
--text-secondary: #94a3b8; /* 次要文字 */
--text-muted: #64748b;     /* 辅助文字 */
```

### 5.3 字体规范

| 用途 | 字体 | 大小 |
|-----|------|------|
| 标题 | Inter / system-ui | 24px / 20px / 18px |
| 正文 | Inter / system-ui | 14px |
| 代码 | JetBrains Mono | 13px |
| 终端 | JetBrains Mono | 14px |

### 5.4 布局规范

**窗口尺寸**：
- 最小宽度：1024px
- 最小高度：768px
- 默认尺寸：1280x800

**间距系统**：
```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
```

---

## 6. 数据规范

### 6.1 Tutorial 数据格式

```yaml
# Tutorial Frontmatter
---
id: "tutorial-001"
title: "安装 Node.js"
description: "使用 fnm 安装和管理 Node.js 版本"
category: "dev-tools"
difficulty: "beginner"
duration: 10
tags: ["nodejs", "fnm", "javascript"]
series: "nodejs-fundamentals"
order: 1
---

# Tutorial Content
## 什么是 Node.js？

Node.js 是一个 JavaScript 运行时...

## 安装 fnm

首先安装 fnm（Fast Node Manager）：

```bash
brew install fnm
```

## 配置 Shell

将 fnm 添加到你的 shell 配置：

```bash:executable
eval "$(fnm env --use-on-cd)"
```

## 安装 Node.js

```bash:executable
fnm install --lts
fnm use --lts
fnm default --lts
```

## 验证安装

```bash:executable
node -v
npm -v
```
```

### 6.2 Series 数据格式

```yaml
---
id: "nodejs-fundamentals"
title: "Node.js 基础"
description: "从零开始学习 Node.js 开发环境配置"
category: "dev-tools"
difficulty: "beginner"
tutorials:
  - "tutorial-001"
  - "tutorial-002"
  - "tutorial-003"
color: "#339933"
icon: "nodejs"
---
```

### 6.3 存储结构

```
App Data/
├── tutorials/
│   ├── builtin/           # 内置教程（只读）
│   ├── local/             # 本地导入的教程
│   └── cache/             # 缓存的在线教程
├── series/
│   └── index.json         # 系列索引
├── progress/
│   └── {user_id}.json     # 用户学习进度
├── settings/
│   └── preferences.json   # 用户偏好设置
└── logs/
    └── app.log            # 应用日志
```

---

## 7. API 接口规范

### 7.1 Tauri Commands

```typescript
// 教程相关
interface TutorialCommands {
  // 获取所有教程
  getTutorials(): Promise<Tutorial[]>;
  
  // 获取单个教程
  getTutorial(id: string): Promise<Tutorial>;
  
  // 导入教程
  importTutorial(source: string, type: 'file' | 'url'): Promise<Tutorial>;
  
  // 删除本地教程
  deleteTutorial(id: string): Promise<void>;
}

// 系列相关
interface SeriesCommands {
  // 获取所有系列
  getSeries(): Promise<Series[]>;
  
  // 获取单个系列
  getSeriesById(id: string): Promise<Series>;
}

// 执行相关
interface ExecuteCommands {
  // 执行命令
  executeCommand(
    command: string,
    args: string[],
    options?: ExecuteOptions
  ): Promise<ExecuteResult>;
  
  // 流式执行
  executeCommandStream(
    command: string,
    args: string[],
    callback: (output: string) => void
  ): Promise<void>;
  
  // 终止进程
  killProcess(pid: number): Promise<void>;
}

// 进度相关
interface ProgressCommands {
  // 保存进度
  saveProgress(tutorialId: string, progress: Progress): Promise<void>;
  
  // 获取进度
  getProgress(tutorialId: string): Promise<Progress>;
  
  // 获取所有进度
  getAllProgress(): Promise<Record<string, Progress>>;
}
```

---

## 8. 开发规范

### 8.1 代码组织

```
app/
├── (routes)/              # 路由页面
│   ├── page.tsx           # 首页
│   ├── tutorials/
│   ├── series/
│   └── settings/
├── components/            # 共享组件
│   ├── ui/               # shadcn/ui 组件
│   ├── layout/           # 布局组件
│   ├── tutorial/         # 教程相关组件
│   └── terminal/         # 终端相关组件
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具函数
├── store/                # 状态管理
├── types/                # 类型定义
└── styles/               # 样式文件

src-tauri/
├── src/
│   ├── main.rs           # 入口
│   ├── commands/         # 命令处理
│   ├── models/           # 数据模型
│   └── utils/            # 工具函数
├── capabilities/         # 权限配置
└── Cargo.toml
```

### 8.2 命名规范

| 类型 | 命名方式 | 示例 |
|-----|---------|------|
| 组件 | PascalCase | `TutorialCard.tsx` |
| Hooks | camelCase | `useTerminal.ts` |
| 工具函数 | camelCase | `parseTutorial.ts` |
| 常量 | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| 类型 | PascalCase | `TutorialData` |

### 8.3 提交规范

```
type(scope): subject

body

footer
```

**类型**：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**：
```
feat(terminal): add terminal position toggle

- Add right/bottom position options
- Remember user preference
- Animate position change
```

---

## 9. 测试策略

### 9.1 测试分层

```
┌─────────────────────────────┐
│      E2E Tests              │  ← Playwright
│   (用户场景测试)              │
├─────────────────────────────┤
│      Integration Tests      │  ← React Testing Library
│   (组件交互测试)              │
├─────────────────────────────┤
│      Unit Tests             │  ← Jest/Vitest
│   (函数逻辑测试)              │
└─────────────────────────────┘
```

### 9.2 测试覆盖要求

| 模块 | 单元测试 | 集成测试 | E2E测试 |
|-----|---------|---------|--------|
| Tutorial Loader | ✅ | ✅ | - |
| Terminal | ✅ | ✅ | ✅ |
| Commands | ✅ | - | ✅ |
| UI Components | - | ✅ | - |

---

## 10. 发布计划

### 10.1 版本规划

| 版本 | 功能 | 时间 |
|-----|------|------|
| v0.1.0 | 基础布局、教程展示、终端基础 | Week 1-2 |
| v0.2.0 | 可执行代码块、进度追踪 | Week 3-4 |
| v0.3.0 | 文件导入、设置页面 | Week 5-6 |
| v1.0.0 | 完整功能、Bug修复、发布 | Week 7-8 |

### 10.2 发布检查清单

- [ ] 所有 P0 功能完成
- [ ] 测试覆盖率达到 80%
- [ ] 文档完整
- [ ] 安全审计通过
- [ ] 性能测试通过
- [ ] 安装包签名

---

## 11. 附录

### 11.1 术语表

| 术语 | 说明 |
|-----|------|
| Tutorial | 教程，一个可学习的单元 |
| Series | 系列，一组相关的教程 |
| Executable Block | 可执行代码块，可以运行的命令 |
| Terminal | 内置终端，用于执行命令 |
| Worktree | Git工作树，用于并行开发 |

### 11.2 参考链接

- [Tauri Documentation](https://tauri.app/)
- [Next.js Documentation](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [xterm.js](https://xtermjs.org/)

---

*文档版本：v1.0*  
*最后更新：2026-04-08*  
*维护者：AI Agent*
