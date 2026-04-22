# 内容创作工作室：社媒运营、写作润色与多平台发布

> **适用场景**：你每天要在小红书、公众号、X/LinkedIn 等多个平台发内容，而素材写好后还要手动改语气、调整长度、重新排版。本文把“选题 → 主稿 → 多平台改写 → 审稿”做成一个流水线，先让龙虾给你一个可用稿，再用自动流程生成多个平台版本。

## 1. 这篇能帮你什么

- 统一素材输入后，龙虾帮你生成一套主稿、润色版本和多平台改写。
- 自动记录发布时间与表现指标，方便下周复盘。
- 用固定模板让每次发布都能迅速进入执行，不再反复写内容结构。

## 2. 先复制这一句给龙虾

```text
请帮我搭一个“内容创作工作室”流程：
1) 我给你主题和素材，你先用 summarize 把素材压缩成 3 条要点；
2) 生成一篇稳健版主稿，再改写成小红书、公众号、X/LinkedIn 三个平台版本；
3) 每个平台都按对应语气和长度，输出后附一句 CTA；
4) 写完后给我两版润色建议（稳健/冲击），并记录平台 + 发布时间；
5) 所有结果都要能直接复制到飞书/Notion。
```

## 3. 需要哪些 Skills

- `skill-vetter`
  链接：<https://llmbase.ai/openclaw/skill-vetter/>
  作用：确保任何新装的技能都经过安全扫描。
- `tavily-search`
  链接：<https://termo.ai/skills/liang-tavily-search>
  作用：补充调研内容、确认事实与数据。
- `summarize`
  链接：<https://termo.ai/skills/summarize>
  作用：把长素材压缩成重点提炼版本。
- `notion`
  链接：<https://playbooks.com/skills/openclaw/skills/notion>
  作用：当作内容日历与审稿跟踪的载体。
- `social-content`
  链接：<https://playbooks.com/skills/openclaw/skills/social-content>
  作用：执行平台改写与发布建议。

安装命令如下：

```bash
clawhub install skill-vetter
clawhub install tavily-search
clawhub install summarize
clawhub install notion
clawhub install social-content
```

## 4. 跑通后你会看到什么

```text
【主稿 / 人设】
标题：把 AI Agent 拆成 3 个小步
要点：Vault + Prompt + Tool，在 5 分钟内搭一个小型 agent
CTA：点击「开始实战」，我会给你一个练习题考验你

【平台改写】
小红书：口语化、互动提问、150~250 字
公众号：结构化段落、800 字内、官方语气
X：一句钩子、两段短句、结尾抛问

【润色建议】
1) 稳健：加强逻辑链路、少用流量词
2) 冲击：加一个数据钩子 + 多个动词

【发布记录】
Notion 卡片：主题 / 发布平台 / 3 条数据指标
```

## 5. 怎么一步步配出来

1. 安装技能：`clawhub install skill-vetter tavily-search summarize notion social-content`，并确认 Notion 文档/数据库权限。
2. 建一个内容模板：主题、核心观点、平台语气、CTA、关键指标。
3. 先用 `summarize` 压缩素材，再让 `tavily-search` 补充最新案例，最后交给 `social-content` 产生平台版本。
4. 用 `openclaw cron add` 或定时指令，固定每周二/四生成“内容更新 + 发布计划”，并把结果写入 Notion。
5. 每次发布后，手动填入表现数据（阅读、互动、转化），再让龙虾生成“下周优化建议”。

## 6. 如果没有现成 Skill，就让 Claw 帮你造

若想把“内容改写 + 数据复盘”封成一个自定义 skill（例如 `content-conductor`），但找不到公开 slug，可让 Claw 先生成最小 `SKILL.md`：

```
name: content-conductor
description: 统一输出主稿、多平台版本与复盘建议

能力：
- 接收主题 + 素材 + 表现数据
- 输出稳健版主稿 + 小红书/公众号/X 三个平台稿
- 产生润色建议 + 下周优化措施
- 写入 Notion / 飞书

优先调用：`python scripts/main.py "<主题>|<素材>" --metrics "<数据>"`
```

先实现 4 步：1) 读取输入；2) 调用 summarize + social-content；3) 输出三段内容；4) 写入 Notion。跑通后再扩充 CTA、平台策略、数据看板。

## 7. 再往下优化

- 在 prompt 里加“禁止 口号/AI 语气”，用 `social-content` 输出两个语气版本再选定。
- 加一个“内容复盘”模板：总结今天数据、对比上次、下周动作。
- 用 `tavily-search` 定期更新事实数据库，避免引用过期信息。

## 8. 常见问题

**Q1：每个平台的语气不同，怎么确保质量？**  
A：“先用模板写稳健版主稿，再用 social-content 改写成不同语气，最后人工复核最重要平台。”

**Q2：创作节奏不稳定怎么办？**  
A：用 openclaw cron 固定每周二/四生成内容，发布后让龙虾立即写“复盘 + 下周改进”提醒。
