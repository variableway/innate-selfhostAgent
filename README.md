# Innate Executable

> 可执行、可交互的技术学习平台 — 边做边学，所见即所得。

## 概述

Innate Playground 是一个基于 **Next.js 16 + Tauri v2** 构建的桌面端交互式学习平台。它将教程内容与实时终端执行无缝结合，让学习者能够阅读教程、复制命令、一键运行，并立即在嵌入式终端中看到结果。

### 核心特性

- **可执行教程** — 教程内嵌可运行的代码块，点击即可在终端执行
- **系列化管理** — 将教程组织为结构化学习路径（系列）
- **实时终端** — 基于 xterm.js 的内嵌终端，支持 PTY 连接和 Web 模拟两种模式
- **进度追踪** — 自动记录教程和系列的学习完成状态
- **双端支持** — 桌面端（Tauri）提供完整 Shell 体验，Web 端提供命令模拟
- **响应式布局** — 适配桌面与移动设备的现代化 UI
- **可调整终端** — 支持右侧/底部切换、可拖拽调整尺寸的终端面板

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | Next.js 16 (App Router) |
| 渲染引擎 | React 19 + TypeScript |
| 样式方案 | Tailwind CSS 4 + shadcn/ui |
| 组件库 | Radix UI primitives (via @innate/ui) |
| 图标 | Lucide React |
| 终端 | xterm.js + @xterm/addon-fit |
| 桌面框架 | Tauri v2 (Rust) |
| 状态管理 | Zustand |
| 内容渲染 | MDX (next-mdx-remote) + Shiki 代码高亮 |
| 字体 | Geist Sans + Geist Mono |

## 项目结构

```
innate-executable/
├── README.md                          # 本文件
├── package.json                       # 集成入口脚本
├── INTEGRATION.md                     # 集成策略文档
├── APPSHELL_COMPARISON.md             # AppShell 对比分析
├── docs/
│   └── cargo-target-sharing.md        # Cargo 目标共享架构
├── playground/                        # 原始项目（完整独立 monorepo）
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   ├── apps/
│   │   └── desktop/                   # Next.js + Tauri 桌面应用
│   │       ├── package.json
│   │       ├── Taskfile.yml           # 任务运行器配置
│   │       ├── src/                   # Next.js 前端源码
│   │       │   ├── app/               # App Router 路由
│   │       │   │   ├── page.tsx              # 首页（推荐系列 + 最近教程）
│   │       │   │   ├── layout.tsx            # 根布局（字体 + 主题）
│   │       │   │   ├── tutorials/     # 教程中心页
│   │       │   │   ├── series/         # 系列中心页
│   │       │   │   ├── tutorial/[id]/  # 教程详情页（MDX 渲染）
│   │       │   │   ├── learn/          # 学习工作台（步骤式 UI）
│   │       │   │   ├── settings/       # 设置页
│   │       │   │   └── admin/          # 管理后台
│   │       │   ├── components/        # 共享组件
│   │       │   │   ├── layout/         # 布局组件
│   │       │   │   │   ├── app-shell.tsx      # 应用外壳（侧边栏 + 内容 + 终端）
│   │       │   │   │   ├── app-sidebar.tsx    # 可折叠导航侧边栏
│   │       │   │   │   ├── menu-bar.tsx       # 顶部菜单栏（标签 + 搜索 + 主题）
│   │       │   │   │   └── status-bar.tsx     # 底部状态栏
│   │       │   │   ├── tutorial/         # 教程相关组件
│   │       │   │   │   ├── runnable-code-block.tsx   # 可执行代码块
│   │       │   │   │   ├── shiki-code-block.tsx        # 语法高亮代码块
│   │       │   │   │   ├── run-button.tsx              # 运行按钮
│   │       │   │   │   └── platform-tabs.tsx           # 平台标签页
│   │       │   │   ├── workspace/        # 工作台组件
│   │       │   │   └── terminal-panel.tsx           # 可调整终端面板
│   │       │   ├── store/               # Zustand 状态管理
│   │       │   ├── lib/                 # 工具函数与教程扫描器
│   │       │   └── styles/              # 全局样式
│   │       └── src-tauri/             # Rust 后端（Tauri）
│   │           ├── src/
│   │           │   └── lib.rs           # 主入口（PTY、平台检测、命令执行）
│   │           ├── Cargo.toml
│   │           └── tauri.conf.json
│   └── packages/
│       ├── ui/                        # 共享 UI 组件（基于 Radix + Tailwind）
│       ├── utils/                       # 工具函数
│       └── tsconfig/                    # 共享 TypeScript 配置
```

## 页面路由

| 路由 | 描述 | 主要功能 |
|---|---|---|
| `/` | 首页 | 展示推荐系列、最近教程、统计卡片、快捷操作 |
| `/tutorials` | 教程中心 | 所有教程的列表视图，支持搜索和系列筛选 |
| `/series` | 系列中心 | 所有学习系列的网格展示，含进度条 |
| `/series/detail?id=` | 系列详情 | 单个系列下的教程列表和整体进度 |
| `/tutorial/[id]` | 教程详情 | MDX 内容渲染、可执行代码块、完成标记 |
| `/learn` | 学习工作台 | 步骤式教程执行界面（原型阶段） |
| `/settings` | 设置 | 环境信息、API 密钥配置、关于 |
| `/admin/series` | 系列管理 | 创建/编辑系列和教程 |
| `/admin/workspace` | 工作区管理 | 导入本地教程目录 |

## 布局架构

应用采用经典的三栏布局：

```
┌─────────────────────────────────────────────────────┐
│  Menu Bar (顶部导航栏 + 搜索 + 主题切换)           │
├──────────┬────────────────────────────┬──────────┤
│          │                            │          │
│  Sidebar │      Main Content          │ Terminal │
│ (可折叠) │      (路由页面)            │ (可切换) │
│          │                            │          │
├──────────┴────────────────────────────┴──────────┤
│  Status Bar (底部状态栏)                            │
└─────────────────────────────────────────────────────┘
```

### 布局组件

- **AppShell** (`app-shell.tsx`) — 布局 orchestrator，组合 Sidebar + MenuBar + Content + Terminal + StatusBar
- **AppSidebar** (`app-sidebar.tsx`) — 左侧可折叠导航，包含：导航组、系列树（可展开）、管理组
- **MenuBar** (`menu-bar.tsx`) — 顶部水平导航栏，含标签导航、全局搜索、暗/亮主题切换
- **TerminalPanel** (`terminal-panel.tsx`) — 可调整尺寸的终端面板（右侧/底部），基于 xterm.js
- **StatusBar** (`status-bar.tsx`) — 底部信息栏，显示平台信息和版本

## 核心组件

### 教程渲染

- **RunnableCodeBlock** — 识别 `{executable}` 标记的代码块，渲染为带"运行"按钮的交互式组件
- **ShikiCodeBlock** — 使用 Shiki 进行语法高亮的静态代码块
- **PlatformTabs** — 为不同操作系统（macOS/Windows/Linux）显示对应的命令变体
- **TutorialMarkdown** — MDX 渲染器，将 Markdown 映射为自定义 React 组件

### 终端

- 支持 **PTY 模式**（Tauri 桌面端）和 **Web 模拟模式**（浏览器端）
- 可拖拽调整宽度（右侧模式）或高度（底部模式）
- 命令队列：终端未就绪时自动排队，就绪后批量执行
- 多主题配色，匹配应用暗/亮主题

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+（推荐 20+）
- [pnpm](https://pnpm.io/) 8+
- [Rust](https://rustup.rs/) + Cargo（桌面端开发需要）
- [Task](https://taskfile.dev/)（可选，用于任务自动化）

### 安装

```bash
# 克隆后进入项目目录
cd apps/innate-executable/playground

# 安装依赖
pnpm install
```

### 开发模式

#### 前端（Web 模式）

```bash
pnpm dev
# 或
cd apps/desktop && pnpm dev
```

#### 桌面端（Tauri 模式）

```bash
# 使用 Task（推荐）
cd apps/desktop
task dev          # 启动 Next.js + Tauri 开发服务器

# 或使用 pnpm 脚本
pnpm desktop:dev
```

#### 独立运行（嵌套 monorepo）

```bash
cd playground
pnpm install
pnpm dev          # 仅 Next.js
pnpm --filter desktop tauri dev   # 完整桌面端
```

### 构建

```bash
# 完整构建（前端 + Tauri + DMG）
cd apps/desktop
task default

# 仅前端
task build-frontend

# 仅 Tauri（使用共享 target）
task build-tauri

# 清理构建产物
task clean
```

## 集成模式

本项目作为 `innate-desktop-mono`  monorepo 的子项目存在，同时保持完全独立运行能力。

### 共享 Cargo Target

通过根目录 `.cargo/config.toml` 设置统一 `target-dir`，两个 Tauri 项目共享编译产物：

```toml
[build]
target-dir = "target"
```

**空间节省**：约 50-75% 的磁盘占用减少，增量编译缓存共享。

### 运行模式对照

| 模式 | 命令 | 目标目录 | 适用场景 |
|---|---|---|---|
| 独立模式 | `cd playground && pnpm dev` | `playground/apps/desktop/src-tauri/target/` | 独立开发、CI 隔离 |
| 共享模式 | `cd apps/innate-executable && pnpm desktop:dev` | `target/`（仓库根） | 日常开发、节省空间 |
| Monorepo | `pnpm --filter @innate/desktop tauri dev` | `target/` | 跨项目工作流 |

详细架构参见 [docs/cargo-target-sharing.md](docs/cargo-target-sharing.md)。

## 状态管理

使用 Zustand 的 `useAppStore` 管理全局状态：

- `discoveredTutorials` / `discoveredSeries` — 扫描到的教程和系列数据
- `progress` — 用户学习进度（完成状态、时间戳）
- `terminalVisible` / `terminalPosition` — 终端可见性和位置（right/bottom）
- `currentWorkspace` / `workspaces` — 工作区配置
- `isExecuting` — 当前是否有命令在执行

## 主题系统

支持暗/亮主题切换：

- 基于 CSS 变量（`--background`, `--foreground`, `--primary` 等）
- Tailwind CSS `dark:` 变体
- 通过 `next/font/google` 加载 Geist Sans 和 Geist Mono 字体
- 终端主题通过 xterm.js 的 `ITheme` 配置同步

## 自定义代码块

在 Markdown 教程中，使用 `{executable}` 标记创建可执行代码块：

````markdown
```bash {executable}
echo "Hello, Innate!"
```
````

渲染后会显示"复制"和"执行"按钮，点击执行将命令发送到终端面板运行。

## 开发规范

- **样式**：使用 Tailwind CSS 工具类，优先使用 shadcn/ui 和 `@innate/ui` 组件
- **图标**：统一使用 `lucide-react`，尺寸规范 `size={16}` / `size={18}` / `size={20}`
- **组件**：新组件放入 `components/` 对应子目录，遵循现有文件组织
- **状态**：全局状态放入 `store/useAppStore`，局部状态使用 `useState`
- **类型**：所有组件和函数使用 TypeScript 类型，避免 `any`

## 已知限制

- **Web 模式终端**：仅模拟常见命令（`ls`, `cd`, `node -v`, `npm install` 等），不支持实际文件系统操作
- **教程扫描**：依赖运行时文件系统扫描，首次加载可能有短暂延迟
- **学习工作台** (`/learn`)：当前为原型/线框阶段，使用模拟数据
- **移动端**：侧边栏和终端面板在小屏幕下的体验有待优化

## 未来规划

- [ ] 学习工作台完整实现（步骤执行、状态追踪、实时终端输出）
- [ ] 教程内嵌交互式测验/挑战
- [ ] 学习进度导出与云同步
- [ ] 多语言教程支持
- [ ] 插件系统支持自定义教程源

## 贡献

欢迎提交 Issue 和 PR。请确保：

1. 代码通过 `pnpm lint` 检查
2. 遵循现有的组件和样式模式
3. 在桌面端和 Web 端都进行测试

## 许可证

[待定] 请参阅项目根目录 LICENSE 文件。

---

Built with ❤️ using Next.js, Tauri, and shadcn/ui.
