# Task 1 详细分析

> 分析文档：Executable Tutorial 页面功能实现
> 创建时间：2026-04-08
> 相关任务：tasks/mindstorm/executable-tutorial.md

---

## 一、需求理解

### 1.1 原始需求

根据 `tasks/mindstorm/executable-tutorial.md` 中的 Task 1 描述：

> 目前先不去考虑教程的事情，先实现页面的事情，一个总体展示的页面，一个可以上传文件的页面，或者可以添加本地目录到这个desktop中
> 1. 目前先不去考虑教程的事情，先实现页面的事情，一个总体展示的页面，一个可以上传文件的页面，或者可以添加本地目录到这个desktop中
> 2. 这个页面需要有一个导航栏，可以展示所有的教程，也可以展示所有的系列
> 3. 主要内容区域就是展示，系列里面的三个教程，如果有更多的，就有一个更多按钮
> 4. 点击每个教程，会展示这个教程的内容，点击教程里面的运行，terminal就出现，然后可以执行教程的内容

### 1.2 需求拆解

| 功能模块 | 具体需求 | 优先级 |
|---------|---------|--------|
| **总体展示页面** | 首页展示所有教程和系列 | P0 |
| **导航栏** | 展示所有教程、所有系列 | P0 |
| **系列展示** | 每个系列展示3个教程，更多按钮 | P0 |
| **教程详情** | 点击展示教程内容 | P0 |
| **终端功能** | 点击运行显示终端，执行命令 | P0 |
| **文件上传** | 上传文件或添加本地目录 | P1 |

---

## 二、技术架构分析

### 2.1 技术选型

基于项目整体方向（Tauri + Next.js + shadcn/ui）：

| 层级 | 技术 | 说明 |
|-----|------|------|
| 桌面容器 | Tauri v2 | 轻量级，支持系统命令执行 |
| 前端框架 | Next.js 15 + React 19 | App Router，SSR支持 |
| UI组件 | shadcn/ui | 已有基础，组件丰富 |
| 终端模拟 | xterm.js | 业界标准，功能完善 |
| 状态管理 | Zustand | 轻量，适合本项目 |
| 后端通信 | Tauri IPC | Command + Events |

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Window                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │   │
│  │  │   Header   │  │  Sidebar   │  │   Terminal   │   │   │
│  │  │  (导航栏)   │  │  (导航)    │  │   (xterm)    │   │   │
│  │  └────────────┘  └────────────┘  └──────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │              Main Content                     │   │   │
│  │  │  ┌────────────────────────────────────────┐  │   │   │
│  │  │  │           Tutorial List / Grid          │  │   │   │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐      │  │   │   │
│  │  │  │  │ Series │ │ Series │ │ Series │ ...  │  │   │   │
│  │  │  │  │ Card   │ │ Card   │ │ Card   │      │  │   │   │
│  │  │  │  └────────┘ └────────┘ └────────┘      │  │   │   │
│  │  │  └────────────────────────────────────────┘  │   │   │
│  │  │  ┌────────────────────────────────────────┐  │   │   │
│  │  │  │         Tutorial Detail View            │  │   │   │
│  │  │  │  - Markdown渲染                        │  │   │   │
│  │  │  │  - 可执行代码块                         │  │   │   │
│  │  │  │  - 运行按钮                             │  │   │   │
│  │  │  └────────────────────────────────────────┘  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │ Tauri IPC                        │
│  ┌──────────────────────┼──────────────────────────────┐  │
│  │              Rust Backend                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │   Shell    │  │    File    │  │    Config    │  │  │
│  │  │  Executor  │  │   System   │  │    Store     │  │  │
│  │  └────────────┘  └────────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、页面设计分析

### 3.1 页面结构

#### 首页（总体展示页面）

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home    📚 Tutorials    📂 Series    ⚙️ Settings        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Search tutorials...                         [Filter ▼] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📁 Featured Series                                  │   │
│  │                                                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ 🖥️ Terminal │  │ 🐍 Python  │  │ ⚛️ React   │    │   │
│  │  │   Basics   │  │  101       │  │  Basics    │    │   │
│  │  │            │  │            │  │            │    │   │
│  │  │ [3 tutorials] [5 tutorials] [4 tutorials]  │    │   │
│  │  │ [View →]    [View →]    [View →]          │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📖 Recent Tutorials                                 │   │
│  │                                                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ Install    │  │ Git        │  │ Node.js    │    │   │
│  │  │ Warp       │  │ Basics     │  │ Setup      │    │   │
│  │  │ ⏱️ 5 min   │  │ ⏱️ 10 min  │  │ ⏱️ 10 min  │    │   │
│  │  │ Beginner   │  │ Beginner   │  │ Beginner   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📁 Add Local Directory    📤 Import Tutorial              │
└─────────────────────────────────────────────────────────────┘
```

#### 系列详情页

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home    📚 Tutorials    📂 Series    ⚙️ Settings        │
├─────────────────────────────────────────────────────────────┤
│  ← Back to Series                                          │
│                                                             │
│  🖥️ Terminal Basics                                         │
│  =================                                          │
│  Learn the fundamentals of command line interface           │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ 1. ls      │  │ 2. cd      │  │ 3. mkdir   │  [More →] │
│  │ Command    │  │ Command    │  │ Command    │            │
│  │ ⏱️ 2 min   │  │ ⏱️ 2 min   │  │ ⏱️ 3 min   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                             │
│  Progress: [████████░░] 60% (3/5 completed)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 教程详情页（含终端）

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home    📚 Tutorials    📂 Series    ⚙️ Settings        │
├──────┬──────────────────────────────────────────┬───────────┤
│      │                                          │           │
│  📑  │  📖 ls Command Tutorial                  │  ┌─────┐  │
│      │  =====================                   │  │ ☐   │  │
│  📑  │                                          │  │ ☐   │  │
│      │  ## What is `ls`?                        │  │ ☐   │  │
│  📑  │                                          │  │ ☐   │  │
│      │  The `ls` command lists directory        │  │     │  │
│  📑  │  contents...                             │  │     │  │
│      │                                          │  │     │  │
│  📑  │  ## Try it yourself                      │  └─────┘  │
│      │                                          │   Terminal │
│  📑  │  ```bash                                 │   (hidden) │
│  📑  │  ls -la                                  │            │
│      │  ```                                     │            │
│  📑  │                                          │            │
│      │  [▶️ Run in Terminal]                    │            │
│      │                                          │            │
│      │  ## Output Explanation                   │            │
│      │  ...                                     │            │
│      │                                          │            │
└──────┴──────────────────────────────────────────┴───────────┘
```

#### 终端展开状态

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home    📚 Tutorials    📂 Series    ⚙️ Settings        │
├──────┬──────────────────────────────┬───────────────────────┤
│      │                              │                       │
│  📑  │  📖 ls Command Tutorial      │  ┌─────────────────┐  │
│      │                              │  │ $ ls -la        │  │
│  📑  │  ## Try it yourself          │  │ total 128       │  │
│      │                              │  │ drwxr-xr-x  5   │  │
│  📑  │  ```bash                     │  │ drwxr-xr-x  28  │  │
│      │  ls -la                      │  │ -rw-r--r--  1   │  │
│  📑  │  ```                         │  │ ...             │  │
│      │                              │  │                 │  │
│  📑  │  [✅ Completed]              │  │ $ █             │  │
│      │                              │  └─────────────────┘  │
│      │                              │   [Minimize] [Dock →] │
└──────┴──────────────────────────────┴───────────────────────┘
```

### 3.2 终端位置切换

终端支持三种显示模式：

1. **隐藏模式（默认）**：不显示终端，点击运行后展开
2. **右侧边栏模式**：占据右侧30%宽度
3. **底部面板模式**：占据底部40%高度

```
右侧模式：                          底部模式：
┌────────────┬──────────┐          ┌────────────┐
│            │          │          │            │
│  Content   │ Terminal │          │  Content   │
│            │          │          │            │
│            │          │          ├────────────┤
│            │          │          │  Terminal  │
└────────────┴──────────┘          └────────────┘
```

---

## 四、数据模型分析

### 4.1 Tutorial（教程）模型

```typescript
interface Tutorial {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  description: string;           // 描述
  category: string;              // 分类
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;              // 预计完成时间（分钟）
  tags: string[];                // 标签
  series?: string;               // 所属系列ID
  order?: number;                // 在系列中的顺序
  
  // 内容
  content: TutorialSection[];    // 教程内容段落
  
  // 执行配置
  executableBlocks: ExecutableBlock[];
  
  // 元数据
  author?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'builtin' | 'local' | 'imported';  // 来源
  localPath?: string;            // 本地文件路径
}

interface TutorialSection {
  id: string;
  type: 'text' | 'code' | 'executable' | 'image' | 'video';
  content: string;
  language?: string;             // 代码语言
  executable?: boolean;          // 是否可执行
}

interface ExecutableBlock {
  id: string;
  code: string;                  // 可执行代码
  language: 'bash' | 'powershell' | 'python' | 'javascript';
  platform?: ('macos' | 'windows' | 'linux')[];
  workingDirectory?: string;     // 执行目录
  environment?: Record<string, string>;  // 环境变量
  expectedOutput?: string;       // 期望输出（用于验证）
}
```

### 4.2 Series（系列）模型

```typescript
interface Series {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // 系列封面
  icon?: string;
  color?: string;
  
  // 包含的教程
  tutorials: string[];           // Tutorial ID列表
  
  // 元数据
  author?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 存储方案

| 数据类型 | 存储位置 | 说明 |
|---------|---------|------|
| 内置教程 | `skills/` 目录 | JSON/Markdown格式，随应用分发 |
| 用户教程 | App Data目录 | 用户导入或创建的教程 |
| 学习进度 | SQLite/LocalStorage | 用户完成状态、偏好设置 |
| 配置文件 | `config/` 或 App Data | 应用配置、主题等 |

---

## 五、功能模块设计

### 5.1 模块划分

```
app/
├── layout.tsx                    # 根布局
├── page.tsx                      # 首页
├── globals.css                   # 全局样式
│
├── tutorials/
│   ├── page.tsx                  # 教程列表页
│   ├── [id]/
│   │   └── page.tsx              # 教程详情页
│   └── components/
│       ├── TutorialCard.tsx      # 教程卡片
│       ├── TutorialGrid.tsx      # 教程网格
│       ├── TutorialFilter.tsx    # 筛选组件
│       └── TutorialSearch.tsx    # 搜索组件
│
├── series/
│   ├── page.tsx                  # 系列列表页
│   ├── [id]/
│   │   └── page.tsx              # 系列详情页
│   └── components/
│       ├── SeriesCard.tsx        # 系列卡片
│       └── SeriesProgress.tsx    # 进度显示
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 顶部导航
│   │   ├── Sidebar.tsx           # 侧边栏
│   │   └── MainLayout.tsx        # 主布局
│   │
│   ├── terminal/
│   │   ├── Terminal.tsx          # 终端组件
│   │   ├── TerminalProvider.tsx  # 终端状态管理
│   │   ├── TerminalControls.tsx  # 终端控制按钮
│   │   └── xterm-config.ts       # xterm配置
│   │
│   ├── tutorial/
│   │   ├── MarkdownRenderer.tsx  # Markdown渲染
│   │   ├── ExecutableBlock.tsx   # 可执行代码块
│   │   ├── TutorialViewer.tsx    # 教程查看器
│   │   └── TutorialProgress.tsx  # 教程进度
│   │
│   └── ui/                       # shadcn/ui组件
│
├── hooks/
│   ├── useTerminal.ts            # 终端Hook
│   ├── useTutorials.ts           # 教程数据Hook
│   ├── useSeries.ts              # 系列数据Hook
│   └── useLocalStorage.ts        # 本地存储Hook
│
├── lib/
│   ├── tauri.ts                  # Tauri IPC封装
│   ├── tutorial-loader.ts        # 教程加载器
│   ├── tutorial-parser.ts        # 教程解析器
│   └── utils.ts                  # 工具函数
│
├── store/
│   ├── useAppStore.ts            # 全局状态
│   ├── useTerminalStore.ts       # 终端状态
│   └── useTutorialStore.ts       # 教程状态
│
└── types/
    ├── tutorial.ts               # 教程类型定义
    ├── series.ts                 # 系列类型定义
    └── index.ts                  # 类型导出
```

### 5.2 核心功能实现思路

#### 终端功能

```typescript
// 使用 Zustand 管理终端状态
interface TerminalState {
  // 显示状态
  visible: boolean;
  position: 'hidden' | 'right' | 'bottom';
  
  // 终端实例
  xterm: Terminal | null;
  fitAddon: FitAddon | null;
  
  // 执行状态
  isExecuting: boolean;
  currentProcess: number | null;
  
  // 输出历史
  outputHistory: string[];
  
  // 操作
  show: () => void;
  hide: () => void;
  togglePosition: () => void;
  setPosition: (pos: 'right' | 'bottom') => void;
  execute: (command: string) => Promise<void>;
  clear: () => void;
}
```

#### 教程加载

```typescript
// 教程加载器
class TutorialLoader {
  // 加载内置教程
  async loadBuiltinTutorials(): Promise<Tutorial[]>;
  
  // 加载本地教程
  async loadLocalTutorials(): Promise<Tutorial[]>;
  
  // 从文件导入
  async importFromFile(path: string): Promise<Tutorial>;
  
  // 从URL导入
  async importFromURL(url: string): Promise<Tutorial>;
  
  // 解析Markdown
  parseMarkdown(content: string): Tutorial;
}
```

---

## 六、关键技术点

### 6.1 Tauri Shell 命令执行

```rust
// src-tauri/src/commands/shell.rs
use tauri::command;
use std::process::Command;

#[command]
async fn execute_command(
    command: String,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<String, String> {
    let mut cmd = Command::new(&command);
    cmd.args(&args);
    
    if let Some(cwd) = cwd {
        cmd.current_dir(cwd);
    }
    
    let output = cmd.output().map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// 流式输出
#[command]
async fn execute_command_stream(
    window: tauri::Window,
    command: String,
    args: Vec<String>,
) -> Result<(), String> {
    // 使用 Event 发送流式输出到前端
    // ...
}
```

### 6.2 xterm.js 集成

```typescript
// 终端初始化
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const initTerminal = (container: HTMLElement) => {
  const terminal = new Terminal({
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
    },
    cursorBlink: true,
  });
  
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  
  terminal.open(container);
  fitAddon.fit();
  
  // 监听终端输入
  terminal.onData((data) => {
    // 发送到后端执行
    invoke('terminal_input', { data });
  });
  
  return { terminal, fitAddon };
};
```

---

## 七、风险与挑战

### 7.1 技术风险

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| Tauri Shell 权限 | 高 | 配置 capability，用户确认 |
| xterm.js 性能 | 中 | 限制输出缓冲区大小 |
| 跨平台命令差异 | 高 | 使用平台检测，提供对应命令 |
| 文件系统访问 | 中 | 使用 Tauri FS API |

### 7.2 产品风险

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 教程内容质量 | 高 | 建立审核机制，社区贡献 |
| 用户学习曲线 | 中 | 提供示例教程，引导式体验 |
| 安全风险（执行任意命令）| 高 | 白名单机制，用户确认 |

---

## 八、开发计划

### Phase 1: 基础框架（Week 1）

- [ ] 初始化 Tauri + Next.js 项目
- [ ] 配置 shadcn/ui
- [ ] 实现基础布局（Header, Sidebar）
- [ ] 集成 xterm.js

### Phase 2: 核心功能（Week 2）

- [ ] 实现教程列表页面
- [ ] 实现系列展示功能
- [ ] 实现教程详情页面
- [ ] 实现终端基础功能

### Phase 3: 执行功能（Week 3）

- [ ] 实现可执行代码块
- [ ] 集成 Tauri Shell
- [ ] 实现终端位置切换
- [ ] 添加进度追踪

### Phase 4: 数据管理（Week 4）

- [ ] 实现本地文件导入
- [ ] 实现教程存储
- [ ] 添加学习进度持久化
- [ ] 实现设置页面

---

## 九、下一步行动

1. **创建 Feature Branch**: 使用 git worktree 创建工作分支
2. **初始化项目**: 创建 Tauri + Next.js 项目结构
3. **实现基础布局**: 按照设计实现页面框架
4. **集成终端**: 集成 xterm.js 并实现基础功能

---

*分析完成时间：2026-04-08*  
*分析师：AI Agent*  
*版本：v1.0*
