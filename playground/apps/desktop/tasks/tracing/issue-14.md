# Tracing: Task 17: AutoScan tutorials - 替换硬编码为动态扫描

## Task Entry (2026-05-04 09:36:42)

- **Issue**: #14
- **Title**: Task 17: AutoScan tutorials - 替换硬编码为动态扫描
- **Started At**: 2026-05-04 09:36:42
- **Status**: completed

### Original Task Description

```markdown
替换 BUILTIN_SKILL_PATHS 和 BUILTIN_SKILLS 硬编码为动态文件扫描：
1. 创建构建时扫描脚本，扫描 public/skills/ 目录
2. 生成 skills-manifest.json 供客户端使用
3. 支持 GitHub Pages 静态部署
4. 添加新教程只需放入 public/skills/ 目录
```
- **Completed At**: 2026-05-04 09:39:49

### Implementation Summary

✅ Task 17 完成。

## 改动说明

### 1. 新增构建时扫描脚本
- `scripts/generate-skills-manifest.mjs`: 扫描 public/skills/ 目录的所有 .mdx/.md 文件，解析 frontmatter，生成 public/skills-manifest.json

### 2. 重构 tutorial-scanner.ts
- 删除了 ~170 行硬编码的 BUILTIN_SKILL_PATHS 和 BUILTIN_SKILLS
- 新增 `loadManifest()`: 客户端通过 fetch 加载 skills-manifest.json
- 新增 `getBuiltinSkillsSync()`: 服务端(Node.js)构建时直接读取 manifest 文件
- `loadSkillContent()`: 改为从 manifest 查找文件路径
- 保留了所有 workspace 扫描和课程管理功能

### 3. 更新 page.tsx
- `generateStaticParams()` 改用 `getBuiltinSkillsSync()` 代替硬编码数组

### 4. 更新 package.json
- 新增 predev/prebuild 钩子自动生成 manifest
- 新增 `pnpm manifest` 命令手动触发

## 使用方式
1. 将新的 .mdx/.md 文件放入 public/skills/
2. 运行 `pnpm manifest` 或重启 dev server
3. 新教程自动出现在列表中

## GitHub Pages 兼容
- skills-manifest.json 是静态文件，随 build 输出到 out/
- 客户端通过 fetch 加载，无需服务端

