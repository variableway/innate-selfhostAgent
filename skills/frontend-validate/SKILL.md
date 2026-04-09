# Frontend Validate Skill

> 前端项目验证 Skill - 用于检查常见的前端项目问题和最佳实践
> 版本: 1.0.0
> 支持工具: Claude Code, Codex CLI, Kimi CLI, OpenCode, Cursor

---

## 用途

本 Skill 用于在创建或维护前端项目时，自动检查常见的配置问题和最佳实践，避免常见错误。

## 使用场景

1. 初始化新的前端项目时
2. 修复样式不生效问题时
3. 检查项目配置完整性时
4. Code Review 时作为检查清单

---

## 验证规则

### V1. CSS/Tailwind 配置检查

#### V1.1 CSS 文件导入检查
- [ ] `main.tsx` 或 `main.js` 是否导入了 CSS 文件
- [ ] `import "./index.css"` 或 `import "./styles.css"` 是否存在
- [ ] CSS 文件路径是否正确

**常见错误:**
```typescript
// ❌ 错误：没有导入 CSS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ 正确：导入了 CSS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
```

#### V1.2 Tailwind CSS 配置检查
- [ ] `tailwind.config.js` 是否存在且配置正确
- [ ] `postcss.config.js` 是否存在且配置正确
- [ ] `content` 配置是否包含所有模板文件路径
- [ ] `@tailwind` 指令是否在 CSS 文件中

**标准配置:**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### V1.3 Tailwind 版本兼容性检查
- [ ] Tailwind CSS v4 与 v3 的配置方式不同
- [ ] v3 使用 `tailwind.config.js`
- [ ] v4 使用 CSS 配置 `@config`

**版本检测:**
```bash
# 检查 package.json 中的 tailwindcss 版本
# v3.x: 使用传统配置方式
# v4.x: 使用新的 CSS-based 配置
```

---

### V2. 构建工具配置检查

#### V2.1 Vite 项目检查
- [ ] `vite.config.ts` 是否存在
- [ ] `index.html` 入口文件是否正确配置
- [ ] 开发服务器端口是否配置

#### V2.2 路径别名检查
- [ ] `tsconfig.json` 中是否配置 `paths`
- [ ] `vite.config.ts` 中是否配置 `resolve.alias`

**标准配置:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

### V3. React 项目检查

#### V3.1 入口文件检查
- [ ] `main.tsx` 是否存在且配置正确
- [ ] `App.tsx` 是否存在
- [ ] React 18 的 `createRoot` API 是否正确使用

**标准配置:**
```typescript
// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";  // 确保导入 CSS

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### V3.2 TypeScript 配置检查
- [ ] `tsconfig.json` 是否存在
- [ ] 严格的类型检查是否启用
- [ ] `vite-env.d.ts` 是否存在

---

### V4. Tauri 桌面应用特定检查

#### V4.1 Tauri 配置文件检查
- [ ] `tauri.conf.json` 是否存在
- [ ] `src-tauri/Cargo.toml` 是否存在
- [ ] `devUrl` 是否指向正确的开发服务器

#### V4.2 Shell 插件配置
- [ ] `capabilities/default.json` 是否配置 shell 权限
- [ ] `@tauri-apps/plugin-shell` 是否安装

---

### V5. Monorepo 配置检查

#### V5.1 Workspace 检查
- [ ] `pnpm-workspace.yaml` 或 `package.json` workspaces 是否配置
- [ ] 子包是否正确引用 workspace 包

#### V5.2 共享包引用检查
- [ ] `@innate/ui` 等 workspace 包是否正确引用
- [ ] TypeScript 配置是否正确继承

---

## 快速修复命令

### 修复 CSS 导入问题
```bash
# 检查 main.tsx 是否有 CSS 导入
grep -n "import.*\\.css" src/main.tsx || echo "❌ 缺少 CSS 导入"

# 添加 CSS 导入（如果不存在）
sed -i '/import App/a import "./index.css";' src/main.tsx
```

### 修复 Tailwind 配置
```bash
# 检查 Tailwind 配置文件
[ -f tailwind.config.js ] || echo "❌ 缺少 tailwind.config.js"
[ -f postcss.config.js ] || echo "❌ 缺少 postcss.config.js"
```

---

## AI 使用提示

### 当用户说 "样式不生效" 时:
1. 首先检查 `main.tsx` 是否导入 CSS
2. 检查 Tailwind 配置是否正确
3. 检查 CSS 文件是否包含 `@tailwind` 指令
4. 检查构建工具配置

### 当用户创建新项目时:
1. 使用此 Skill 作为检查清单
2. 确保所有配置文件都存在且正确
3. 验证开发服务器能正常启动
4. 验证样式能正确渲染

---

## 示例对话

**用户:** 我的 React 项目样式不生效

**AI:** 让我使用 Frontend Validate Skill 来检查:

1. 检查 CSS 导入... ❌ 发现 `main.tsx` 缺少 `import "./index.css"`
2. 检查 Tailwind 配置... ✅ 正常
3. 检查 PostCSS 配置... ✅ 正常

**修复:** 在 `main.tsx` 中添加 CSS 导入:
```typescript
import "./index.css";
```

---

## 更新日志

### v1.0.0 (2026-04-08)
- 初始版本
- 添加 CSS/Tailwind 检查规则
- 添加 React/Vite 检查规则
- 添加 Tauri 特定检查规则
- 添加 Monorepo 检查规则
