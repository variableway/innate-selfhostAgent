# Features Backlog

> 记录 F1.1 和 F1.2 中未完成的事项
> 更新日期: 2026-04-09

---

## F1.1 初始化 Tauri v2 + Next.js 桌面应用

### ✅ 已完成

| 检查项 | 状态 | 备注 |
|--------|------|------|
| Tauri v2 项目创建 | ✅ | `apps/desktop/` 已创建 |
| Tauri 配置正确 | ✅ | `tauri.conf.json` 配置正确 |
| 开发服务器运行 | ✅ | `npm run tauri dev` 正常运行 |
| 桌面窗口显示 | ✅ | Tauri 窗口正常显示 |
| React 19 集成 | ✅ | React 19 + TypeScript 正常工作 |
| Vite 构建工具 | ✅ | Vite 7 配置正确 |
| Tailwind CSS 样式 | ✅ | 样式系统正常工作 |
| Rust 后端响应 | ✅ | 基本命令响应正常 |

### ❌ 未完成 / 差异

| 检查项 | 状态 | 差异说明 | 优先级 |
|--------|------|----------|--------|
| Next.js 15 (App Router) | ❌ | 实际使用 React 19 + Vite，**非 Next.js** | P1 |
| pnpm workspace 配置 | ❌ | 使用 npm，未配置 pnpm workspace | P2 |
| Tauri shell 插件安装 | ⚠️ | 需验证 shell 插件是否安装和配置 | P1 |

### 重要说明

**当前技术栈:**
- ✅ Tauri v2
- ✅ React 19
- ✅ Vite 7
- ✅ TypeScript 5.8
- ✅ Tailwind CSS 3.4
- ❌ **Next.js (未使用)**

**差异分析:**

原始需求要求使用 Next.js 15，但实际实现使用了 Vite + React。这是一个**架构偏差**。

原因可能是：
1. `create-tauri-app` 默认推荐 Vite 模板
2. Tauri 桌面应用不需要 Next.js 的 SSR/SSG 特性
3. Vite 启动速度更快，配置更简单

**是否需要迁移到 Next.js？**

当前实现已满足桌面应用需求：
- ✅ 路由管理（使用状态管理）
- ✅ 组件渲染
- ✅ 样式系统
- ✅ 构建打包

Next.js 的以下特性在桌面应用中不必要：
- ❌ SSR（服务器端渲染）
- ❌ SSG（静态站点生成）
- ❌ Image Optimization
- ❌ API Routes

**建议:** 保持当前 Vite + React 架构，如需使用 Next.js 特性再考虑迁移。

---

## F1.2 配置 Monorepo 集成

### ✅ 已完成

| 检查项 | 状态 | 备注 |
|--------|------|------|
| Tailwind CSS 配置 | ✅ | 配置正确，样式正常渲染 |

### ❌ 未完成 / 差异

| 检查项 | 状态 | 差异说明 | 优先级 |
|--------|------|----------|--------|
| 引用 `@innate/ui` | ❌ | 无 monorepo 共享包，使用自定义组件 | P2 |
| 引用 `@innate/utils` | ❌ | 无 monorepo 共享包 | P2 |
| shadcn/ui 集成 | ❌ | 使用自定义组件，未集成 shadcn/ui | P2 |
| TypeScript 配置继承 | ❌ | 独立配置，未继承 `packages/tsconfig` | P3 |
| pnpm build 支持 | ❌ | 未配置根目录构建 | P2 |

### 当前项目结构

```
apps/desktop/          # 独立项目，非 monorepo 集成
├── src/
│   ├── components/    # 自定义组件（非 shadcn/ui）
│   ├── store/         # Zustand 状态管理
│   └── types/         # TypeScript 类型
├── src-tauri/         # Tauri Rust 后端
├── tailwind.config.js # 独立 Tailwind 配置
└── package.json       # 独立依赖管理（npm）
```

---

## 后续行动建议

### 短期（本周）

1. **安装 Tauri Shell 插件** (P1)
   ```bash
   cd apps/desktop
   npm install @tauri-apps/plugin-shell
   ```

2. **配置 Shell 权限** (P1)
   - 更新 `src-tauri/capabilities/default.json`

### 中期（本月）

3. **评估 Next.js 迁移** (P1)
   - 讨论是否需要迁移到 Next.js
   - 评估成本和收益
   - 如不需要，更新任务文档接受当前架构

4. **迁移到 pnpm** (P2)
   - 创建 `pnpm-workspace.yaml`
   - 迁移依赖管理

5. **创建共享包** (P2)
   - 提取通用组件到 `packages/ui`
   - 提取工具函数到 `packages/utils`

### 长期（可选）

6. **集成 shadcn/ui** (P2)
   - 替换自定义组件为 shadcn/ui 组件
   - 统一设计系统

---

## 当前状态总结

**技术栈:**
- ✅ Tauri v2
- ✅ React 19
- ✅ Vite 7
- ✅ TypeScript 5.8
- ✅ Tailwind CSS 3.4
- ❌ Next.js (未使用，与需求有差异)

**已实现:**
- ✅ 基础 Tauri v2 + React 桌面应用
- ✅ 现代 UI 设计（Tailwind CSS）
- ✅ 核心页面功能（Home, Series, Tutorial）
- ✅ 终端组件集成

**待完成:**
- ⏳ Tauri Shell 插件完整配置
- ⏳ 评估 Next.js 迁移需求
- ⏳ Monorepo 架构完善
- ⏳ 共享包提取

**结论:** 当前实现已满足 Task 1（基础页面功能）的需求，但与 F1.1 原始需求（Next.js）有架构差异。建议评估是否必须迁移到 Next.js，或接受当前 Vite + React 架构。
