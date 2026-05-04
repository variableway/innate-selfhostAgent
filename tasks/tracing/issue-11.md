# Tracing: Task 15: 按照 Research 文件制作系列教程

## Task Entry (2026-05-04 08:39:58)

- **Issue**: #11
- **Title**: Task 15: 按照 Research 文件制作系列教程
- **Started At**: 2026-05-04 08:39:58
- **Status**: completed

### Original Task Description

```markdown
按照 tasks/research/ 中的教程大纲，制作完整系列教程：
1. 制作 P0 优先级教程（OpenClaw体验、跨学科之旅、数学基础）
2. 制作 P1 教程（搜索总结、邮件日程、数学下、认知科学）
3. 说明制作方法
4. 检查展示效果，考虑 Python/Notebook 集成
```
- **Completed At**: 2026-05-04 08:45:27

### Implementation Summary

完成 - 修复 MDX acorn 解析错误。

根因: MDX 格式中裸代码块（fenced code block）内的花括号 {} 被 MDX/acorn 当作 JavaScript 表达式解析，导致编译失败。

修复方案:
1. 直接修复: 将 install-kimi-cli.mdx 中的 JSON 裸代码块改为 RunnableCodeBlock 组件
2. 通用防护: 在 MDX 序列化前自动检测包含 {} 的裸代码块，将其转换为 RunnableCodeBlock，防止未来教程出现同样问题

验证: build 通过，dev server 测试通过

