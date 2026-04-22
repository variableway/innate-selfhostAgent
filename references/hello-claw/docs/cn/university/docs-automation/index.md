# 文档自动化：标准化知识沉淀助手

> **适用场景**：手册、周报、配置说明经常靠复制粘贴拼凑，更新一个版本就要跑 3 个文档。本文把“资料 → 模板 → 结构化文档”串成一条流水线，先自动生成可读内容，再按需要分发。

## 1. 这篇能帮你什么

- 一次输入产品/流程更新，就能输出一份“可读的说明稿”。
- 自动把内容押成固定模板（背景、操作步骤、注意事项），方便后续传给客户或内部分享。
- 自动把相关资料写入知识库，用一个 prompt 让龙虾帮你生成多个文档版本。

## 2. 先复制这一句给龙虾

```text
请帮我写一份新的文档：
1) 先读这段素材：<素材链接>，提炼 3 个核心要点；
2) 出一份操作流程，结构是：背景、目标、步骤、验证办法、注意事项；
3) 另起三段，分别输出「培训版」「客户版」「内部周报版」；
4) 每段都要有小标题、要点和可执行行动项；
5) 输出后续可以直接复制到飞书/Notion。
```

## 3. 需要哪些 Skills

- `skill-vetter`
  链接：<https://llmbase.ai/openclaw/skill-vetter/>
  作用：安装前统一做安全扫描。
- `feishu-doc`
  链接：<https://www.tmser.com/2026/03/02/%E6%AF%8F%E5%A4%A9%E4%B8%80%E4%B8%AAopenclaw-skill-feishu-doc/>
  作用：把生成内容写入团队飞书文档或周报模板。
- `notion`
  链接：<https://playbooks.com/skills/openclaw/skills/notion>
  作用：自动保存版本、打标签、关联任务。
- `summarize`
  链接：<https://termo.ai/skills/summarize>
  作用：把冗长素材压缩成关键要点。
- `tavily-search`
  链接：<https://termo.ai/skills/liang-tavily-search>
  作用：补齐事实、引用资料或例子。

安装命令如下：

```bash
clawhub install skill-vetter
clawhub install feishu-doc
clawhub install notion
clawhub install summarize
clawhub install tavily-search
```

## 4. 跑通后你会看到什么

```text
【背景】
上游出一份 2026Q1 新功能说明，提及“自动化调度 + 报表联动”。

【步骤】
1) 提取素材中 3 项关键能力（调度、报表、团队检查点）；
2) 写出“操作流程 + 验收动作”；
3) 配出「客户版」/「培训版」/「周报版」三种视角；
4) 把最终内容写入飞书文档。

【下一步】
1) 把客户版复制到群里征求确认；
2) 把培训版放到 Notion 学习卡片；
3) 设置下一个编辑周期提醒。
```

## 5. 怎么一步步配出来

1. 安装技能：`clawhub install skill-vetter feishu-doc notion summarize tavily-search`，确认飞书文档和 Notion 目录可写。
2. 把素材整理成卡片（例如 OneNote/Google Doc），用 `summarize` 先压缩成 3-5 行关键点。
3. 写一个 prompt 模板：明确输出结构（背景、目标、行动），并标注每个版本的写作语气。
4. 用 `openclaw cron add` 定时跑一次“内容自动复盘”任务：读取最新素材、生成新文档、把结果写入飞书。
5. 利用 Notion 里的任务卡片，把每一步都联动到一条待办：写稿、审稿、发布、复盘。

## 6. 如果没有现成 Skill，就让 Claw 帮你造

假如你想把“文档模板”封一份自定义 skill，但找不到现成 slug，可以让 Claw 先帮你写一个 `doc-assembler`：

```
name: doc-assembler
description: 把素材自动整理成结构化文档并同步到飞书

能力：
- 提炼素材关键词
- 按模板输出背景、步骤、注意事项
- 生成「客户版/内部版/复盘版」
- 写入目标文档或周报
流程：优先用 `python scripts/main.py "<素材>"` 执行
```

先写 4 段伪代码：读素材、调用 `summarize`、组合模板、输出到飞书。确认能跑通，就可以把它当作可复用 skill，后面再加条件判断或多语言支持。

## 7. 再往下优化

- 用 `tavily-search` 补充最新数据，把引用日期和来源同步写在文末。
- 加一段“版本差异”表格，告诉团队每次改动改了哪 3 个关键点。
- 把输出转换成 Markdown + PDF，交给排版工具自动发布。

## 8. 常见问题

**Q1：我只有 10 分钟素材，内容不够怎么办？**  
A：先用 `summarize` 提炼关键词，再让龙虾补齐场景和例子，可以加入“请帮我补 2 个相关案例”。

**Q2：生成的文档总感觉写得太 AI，怎么办？**  
A：在 prompt 里明确“保持 XX 风格、禁止使用 XX 词”，并让龙虾每次输出「原文风格 / 专业风格」两个版本，再人工选定。
