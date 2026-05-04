# Tracing: Fix: First Run button click does not execute command in terminal

## Task Entry (2026-05-02 18:39:40)

- **Issue**: #5
- **Title**: Fix: First Run button click does not execute command in terminal
- **Started At**: 2026-05-02 18:39:40
- **Status**: completed

### Original Task Description

```markdown
## Bug Description
第一次执行教程内容的时候不会在terminal中执行命令

## Requirements
1. 第一次执行教程内容的时候必须在terminal中执行命令
2. 每次点击Run按钮都必须执行命令
3. 增加验证机制，确保命令能够正常执行

## Affected Files
- playground/apps/desktop/src/store/useAppStore.ts
- playground/apps/desktop/src/components/terminal-panel.tsx
- playground/apps/desktop/src/components/tutorial/run-button.tsx
- playground/apps/desktop/src/components/tutorial/runnable-code-block.tsx

## Task Reference
- tasks/issues/2-start-cc.md Task 10
```
- **Completed At**: 2026-05-02 18:43:57

### Implementation Summary

## 完成总结

### 修复内容

**根因分析**: 第一次点击 Run 按钮时，终端尚未初始化完成，命令被加入队列。但之前的实现存在以下问题：
1.  每次调用都动态 import Tauri API，首次调用有延迟
2.  + 命令使用嵌套 setTimeout，时序不可靠
3.  立即同步执行，可能与终端初始化竞争

### 修复方案

1. **预缓存 Tauri invoke** — 模块加载时即预热 ，避免首次调用延迟
2. **终端初始化后延迟** — xterm.js 初始化后等待 100ms 再标记 ready 并 flush 命令
3. **可靠的命令发送** —  + 命令改用  +  替代嵌套 
4. **交错刷新** — 队列命令以 200ms 间隔逐个发送，避免竞争条件
5. **重入保护** — flush 时若 terminal 不 ready，重新入队
6. **视觉反馈** — Run 按钮增加 发送中/已发送 状态提示

### 修改文件
- `useAppStore.ts` — 预缓存 invoke、改进 flush 和 command 发送逻辑
- `terminal-panel.tsx` — 初始化后增加 100ms 安定延迟
- `run-button.tsx` — 增加 sending/sent 视觉反馈
- `runnable-code-block.tsx` — 增加 sending/sent 视觉反馈

