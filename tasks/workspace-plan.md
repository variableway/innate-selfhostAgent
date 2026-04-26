# Workspace 功能规划

> 目标：在一个页面内完成教程的浏览、学习、执行、创建和管理所有操作。

---

## 1. 问题分析

当前应用功能分散在多个独立页面：
- **Home** → 浏览推荐系列和教程
- **SeriesDetail** → 查看系列详情
- **TutorialDetail** → 阅读教程并执行命令
- **CreateLessonPage** → 创建新课程
- **LessonListPage** → 查看课程列表
- **LessonPreviewPage** → 预览课程内容
- **Terminal** → 查看命令执行结果（浮动面板）

用户需要在多个页面间来回切换，学习体验不连贯。

---

## 2. 设计方案：All-in-One Workspace

采用类似 VS Code / Obsidian 的**可定制分栏布局**，将核心功能整合到一个页面。

### 2.1 布局草图（ASCII）

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 搜索...      [运行 ▶] [停止 ⏹] [验证 ✓]    进度 3/5 ⚙️ 👤      │  ← 顶部工具栏
├──────────┬──────────────────────────────┬───────────────────────────┤
│          │                              │                           │
│  📂 目录  │                              │  🖥️ 终端                  │
│  ───────  │                              │  ───────                  │
│  ▼ 系列   │                              │  $ node -v                │
│    ├─01  │                              │  v24.2.0                  │
│    ├─02  │    📖 教程内容阅读区          │  $ npm -v                 │
│    └─03  │                              │  10.8.1                   │
│          │    1. 安装 fnm                │  $ _                     │
│  📚 课程  │    2. 安装 Node.js            │                           │
│  ───────  │    3. 验证安装                │  [📋 复制] [🧹 清除]       │
│  + 新建   │                              │                           │
│          │    [ 点击执行 ▶ ]             │                           │
│          │                              │                           │
│          │    ✅ 步骤 1/3 已完成          │                           │
│          │                              │                           │
│          │                              │                           │
├──────────┴──────────────────────────────┴───────────────────────────┤
│  状态栏: 当前教程: Node.js 基础 | 平台: macOS | 耗时: 5min           │  ← 底部状态栏
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 区域说明

| 区域 | 位置 | 功能 | 可折叠 |
|------|------|------|--------|
| **顶部工具栏** | 顶部 | 搜索、全局运行/停止、进度概览、用户设置 | 否 |
| **左侧边栏** | 左 | 系列目录树 + 课程管理列表 | 是 |
| **主内容区** | 中 | Markdown 渲染 + 可执行步骤卡片 + 进度指示 | 否 |
| **右侧面板** | 右 | 终端输出（可切换为验证结果、日志） | 是 |
| **底部状态栏** | 底 | 当前上下文信息（教程名、平台、耗时） | 否 |

### 2.3 交互流程

```
用户打开 Workspace
    │
    ▼
┌─────────────────┐
│ 1. 左侧选择系列/课程 │
│    或创建新课程     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. 主区域加载教程内容 │
│    Markdown + 可执行块 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. 点击步骤的 [执行]   │
│    命令发送到右侧面板   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. 右侧面板实时显示     │
│    终端输出和验证结果    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. 步骤自动标记完成     │
│    进度实时更新        │
└─────────────────┘
```

---

## 3. 组件规划

### 3.1 新组件

```
apps/desktop/src/components/workspace/
├── WorkspacePage.tsx          # 主容器（布局管理）
├── WorkspaceToolbar.tsx       # 顶部工具栏
├── WorkspaceSidebar.tsx       # 左侧边栏（目录树 + 课程列表）
├── WorkspaceContent.tsx       # 主内容区（Markdown + 步骤）
├── WorkspaceTerminal.tsx      # 右侧终端面板
├── WorkspaceStatusBar.tsx     # 底部状态栏
├── StepCard.tsx               # 可执行步骤卡片
└── ProgressIndicator.tsx      # 步骤进度指示器
```

### 3.2 复用现有组件

| 现有组件 | 在 Workspace 中的用途 |
|----------|----------------------|
| `TutorialCard` | 左侧边栏中的教程缩略图 |
| `SeriesCard` | 左侧边栏中的系列卡片 |
| `Terminal` | 右侧面板的核心终端 |
| `CreateLessonPage` | 以弹窗/抽屉形式嵌入，用于新建课程 |
| `LessonPreviewPage` | 主内容区预览模式 |

### 3.3 状态管理扩展

在 `useAppStore` 中新增 Workspace 相关状态：

```typescript
interface AppState {
  // ... 现有状态

  // Workspace 布局状态
  sidebarVisible: boolean;
  sidebarWidth: number;
  rightPanelVisible: boolean;
  rightPanelWidth: number;
  activePanel: 'terminal' | 'preview' | 'logs';

  // Workspace 运行状态
  currentStepIndex: number;
  stepStatuses: Record<string, 'pending' | 'running' | 'success' | 'error'>;
  workspaceMode: 'learn' | 'create' | 'preview';

  // Workspace Actions
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setActivePanel: (panel: 'terminal' | 'preview' | 'logs') => void;
  setStepStatus: (stepId: string, status: 'pending' | 'running' | 'success' | 'error') => void;
  nextStep: () => void;
  prevStep: () => void;
}
```

---

## 4. 核心功能列表

### Phase 1：基础 Workspace（MVP）
- [ ] 三栏布局（左-中-右）可拖拽调整宽度
- [ ] 左侧目录树：系列 → 教程 → 步骤 层级导航
- [ ] 主区域渲染 Markdown + 可执行代码块
- [ ] 点击执行 → 命令发送到右侧终端
- [ ] 步骤自动标记完成（基于终端退出码）
- [ ] 顶部显示整体进度

### Phase 2：增强体验
- [ ] 左侧支持课程管理（新建、删除、重命名）
- [ ] 右侧面板支持标签页切换（终端 / 预览 / 日志）
- [ ] 全局运行模式：一键执行教程所有步骤
- [ ] 步骤间依赖检查（前置步骤未完成时提示）
- [ ] 深色/浅色主题切换

### Phase 3：高级功能
- [ ] 步骤执行历史记录
- [ ] 教程内搜索（高亮关键词）
- [ ] 多终端分屏（同时运行多个命令）
- [ ] 工作区状态持久化（关闭应用后恢复布局）

---

## 5. 技术实现要点

| 要点 | 方案 |
|------|------|
| 拖拽分栏 | 使用 `react-resizable-panels` 或原生鼠标事件 |
| Markdown 渲染 | 复用现有 `lib/markdown.ts`，扩展可执行块解析 |
| 终端通信 | 复用现有 Tauri Command，通过 store 桥接 |
| 布局持久化 | `localStorage` 保存面板宽度和可见性 |
| 键盘快捷键 | `Ctrl/Cmd + B` 切换侧边栏，`Ctrl/Cmd + J` 切换终端 |

---

## 6. 与现有页面的关系

Workspace **不替换**现有页面，而是作为**高级入口**：

```
Home（入口）
  ├── 点击教程 → Workspace（学习模式）
  ├── 点击系列 → Workspace（系列模式）
  └── 快速操作 → Workspace（创建模式）

Workspace 内部可导航：
  ├── 左侧切换教程/系列
  ├── 顶部切换学习/创建/预览模式
  └── 底部回到 Home
```

这样既能保留现有简单流程，又为高级用户提供 All-in-One 体验。
