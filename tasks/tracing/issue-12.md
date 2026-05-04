# Tracing: Feat: RunnableBlock redesign — Markdown-native code blocks

## Task Entry (2026-05-04 09:26:32)

- **Issue**: #12
- **Title**: Feat: RunnableBlock redesign — Markdown-native code blocks
- **Started At**: 2026-05-04 09:26:32
- **Status**: completed

### Original Task Description

```markdown
## Task 16: RunnableBlock Redesign

Current: RunnableCodeBlock uses verbose JSX props like code={...}
Goal: Standard fenced code blocks with auto-Run button

Changes:
1. Auto-detect runnable code blocks from language (bash, python, etc)
2. Add Run button to standard Markdown code blocks
3. Support Python execution via temp file
4. Keep existing RunnableCodeBlock for backward compat
```
- **Completed At**: 2026-05-04 09:29:04

### Implementation Summary

完成 - RunnableBlock 重新设计。

核心改动:
1. 新增 AutoRunnablePre 组件 — 标准 fenced code block 自动获得 Run 按钮
2. 支持 bash/shell、python、powershell 语言自动执行
3. Python 通过 heredoc 执行（支持多行、函数、import）
4. Shell 多行代码通过临时脚本执行
5. RunnableCodeBlock 保持向后兼容
6. 行内 code 仍使用简单等宽字体渲染

现在教程中可以直接用标准 Markdown 写代码块:
  ```python
  print('hello')
  ```
无需再用 <RunnableCodeBlock code={...} /> 的 JSX 语法。

构建验证通过，14 个教程全部正常。

