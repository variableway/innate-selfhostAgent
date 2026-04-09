# Skill Generation

这个是创建skill的任务，主要来源是发现AI 出现错误之后，把他出现的错误变成一个skill沉淀

## Task 1: 创建Frontend validate SKill

1. 常见一个frontend-validate skill只要用来记录常见的frontend 验证的skill
2. 根据AI 修复的内容把修复内容加入到frontend validate skill中
3. 比如当前这个问题没有 index.css 倒入，那么就把检查是否css已经成功导入加入到这个skill
4. 这个新的skill应该支持所有常见的claude code，codex，kimi cli，opencode 等等

## Task 2: 检查Features 是否已经实现

1. 请检查 [F1.1-init](F1.1-init-tauri-nextjs.md)是否完成
2. 请检查 [F1.2-monorepo](F1.2-monorepo-integration.md)是否完成
3. 当前页面和UI基本上满意，因此不需要完全确认全部和这两个任务描述的一致，只需要确认没有重大的事项遗漏就可以
4. 不修改任何当前代码，把未完成的事项写入到 backlog.md 文件中就可以
5. 如果任务发现全部完成了，就按照目前代码结构更新两个新的文档到[docs/features](docs/features)目录下