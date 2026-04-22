---
title: 龙虾大学：写在开头
---

龙虾大学是给"已经把龙虾养起来的人"开的夜校。

装上几个 Skills 之后，大家通常会碰到同一个问题：
能装，会跑命令，但总觉得"还没真正帮我多做几件事"。
技能市场像一个巨大的超市，货架很多，很容易逛到脚软，却不知道该先拿哪几样回家。

龙虾大学就负责一件事：挑几个典型场景，把"这几样先一起用起来"写清楚。
每篇文章都是一条具体的线：从需求、到要装哪些 Skills、到怎么串成一个可复用的小工作流。

要找技能，可以直接去 [ClawHub 原版](https://clawhub.ai/) 或 [中文 ClawHub（腾讯 SkillHub）](https://skillhub.tencent.com/#categories)。

整栏的总结只有一句话：
少装一点，认真跑通几个真实场景，让龙虾变得"靠谱又好使"。

## 技能实战：场景清单与选型原则

本栏目收录按场景整理的技能组合与落地流程，目标是用尽量少的技能，跑通可复用的自动化闭环。

技能来自两个入口：**ClawHub 原版** 与 **中文 ClawHub（腾讯 SkillHub）**。

[进入 ClawHub 原版](https://clawhub.ai/) | [进入中文 ClawHub（腾讯 SkillHub）](https://skillhub.tencent.com/#categories)

技能数量不宜过多。装太多会挤占上下文，导致响应变慢、判断变弱、排障成本升高。
目标只有一个：按场景精选，先保证稳定与可维护。

## 1. 第一推荐：先学会用 ClawHub

如果你只记住一个方法，就记这个：

1. 去 [ClawHub 原版](https://clawhub.ai/) 或 [中文 ClawHub（腾讯 SkillHub）](https://skillhub.tencent.com/#categories) 按分类搜技能
2. 用 `clawhub install <skill-slug>` 安装
3. 装完立刻做一个真实任务测试

```bash
clawhub install <skill-slug>
```

ClawHub 是 OpenClaw 技能的"技能码头"：上传、版本化、检索、安装都围绕它。你可以按需使用原版入口或中文入口。
想看更系统的分类清单与示例，直接看社区整理库：

- [awesome-openclaw-skills（5,000+ 分类技能清单）](https://github.com/VoltAgent/awesome-openclaw-skills)
- [ClawHub 原版](https://clawhub.ai/)
- [中文 ClawHub（腾讯 SkillHub）](https://skillhub.tencent.com/#categories)

如果你不想全局安装 CLI，也可以直接用一次性命令安装：

```bash
npx clawhub@latest install <skill-slug>
```

你也可以直接在网上搜这些关键词快速入门：

- `clawhub install`
- `clawhub skills`
- `clawhub openclaw`

## 2. 选课原则：龙虾变强的最短路径

- 新手建议常驻 **5~10 个**高频技能
- 先装"底盘技能"：搜索、浏览器、代码仓库、知识库、日历/邮件
- 每新增 1 个技能，都要用真实任务跑一遍
- 一周清理一次不常用技能，避免上下文污染

## 3. 技能菜单（按类别点菜）

下面是按 `list.md` 的类别思路整理的"菜单式缩略版"。
每类先给你几个上手快、复用高的代表技能，详细列表去 Awesome 清单或 ClawHub 看完整版本。

| 类别（list.md） | 推荐缩略 skills（示例） | 适合场景 |
|---|---|---|
| Coding Agents & IDEs（1222） | `github`、`code-reviewer`、`git-ops` | 日常开发、PR 审查、仓库协作 |
| Browser & Automation（335） | `agent-browser`、`playwright`、`summarize` | 网页抓取、表单自动化、信息提炼 |
| Productivity & Tasks（206） | `todoist`、`notion`、`obsidian` | 任务管理、知识沉淀、个人工作流 |
| Communication（149） | `slack`、`agentmail`、`gog` | 消息收发、邮件处理、团队协同 |
| Search & Research（350） | `tavily-search`、`hackernews`、`summarize` | 联网检索、资讯跟踪、快速调研 |
| DevOps & Cloud（409） | `devops`、`aws-infra`、`azure-devops` | 部署运维、云资源管理、流水线 |
| Web & Frontend Development（938） | `agent-browser`、`playwright`、`github` | 前端联调、UI 测试、自动回归 |
| Calendar & Scheduling（65） | `caldav-calendar`、`gog`、`todoist` | 日程安排、冲突检测、提醒 |
| Notes & PKM（71） | `obsidian`、`notion`、`summarize` | 笔记归档、知识链接、长期记忆 |
| Security & Passwords（53） | `skill-vetter`、`1password`、`amai-id` | 技能安全检查、风险预警 |
| PDF & Documents（111） | `summarize`、`add-watermark-to-pdf`、`agentmail` | 文档摘要、报告处理、附件工作流 |
| Smart Home & IoT（43） | `home-assistant`、`weather`、`gog` | 家居自动化、生活助手联动 |

## 4. 建议课表（直接抄作业）

### 4.1 新手 5 件套

```bash
clawhub install skill-vetter
clawhub install tavily-search
clawhub install agent-browser
clawhub install github
clawhub install gog
```

### 4.2 进阶加装（按需二选一或三选一）

- 内容创作：`x-api`、`linkedin`、`blogburst`
- 运维工程：`devops`、`aws-infra`、`azure-devops`
- 个人助理：`weather`、`caldav-calendar`、`agentmail`

## 5. 深入学习入口

- 全量分类与海量技能库：
  [awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- 技能发布、版本与安装入口：
  [ClawHub 原版](https://clawhub.ai/) ｜ [中文 ClawHub（腾讯 SkillHub）](https://skillhub.tencent.com/#categories)
- 本教程 Tools 章节（工具集、定时任务、Web 搜索）：
  [第七章 工具与定时任务](/cn/adopt/chapter7/)
- 技能开发与发布流程：
  [附录 D 技能开发与发布指南](/cn/appendix/appendix-d)

**一句话毕业要求**：让龙虾"好用"的关键，不是装最多，而是装最合适。
从这份菜单里先挑 5 个，跑通你自己的第一个自动化闭环，再继续加课。

## 6. awesome-openclaw-skills 示例补充（放在后面）

下面这组是从 [awesome-openclaw-skills（5,000+ 分类技能清单）](https://github.com/VoltAgent/awesome-openclaw-skills) 里挑的"可直接照抄"的示例组合，按场景给到你第一批候选。

### 6.1 开发协作（Coding + PR）

- [`github`](https://clawhub.ai/steipete/github)：仓库、Issue、PR、Release 查询与操作
- [`code-reviewer`](https://clawhub.ai/skills?nonSuspicious=true&q=code-reviewer)：变更审查与风险提示
- [`git-ops`](https://clawhub.ai/skills?nonSuspicious=true&q=git-ops)：常见 Git 流程自动化
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize)：PR / 文档快速摘要

示例任务：

```text
帮我检查这个仓库最近 7 天的高优先级 Issue，给出修复优先级，并生成一个 PR 审查清单。
```

### 6.2 调研检索（Search + Browser）

- [`tavily-search`](https://clawhub.ai/bert-builder/tavily)：联网检索最新信息
- [`hackernews`](https://clawhub.ai/skills?nonSuspicious=true&q=hackernews)：技术资讯聚合
- [`agent-browser`](https://clawhub.ai/thesethrose/agent-browser)：网页步骤执行与结构化提取
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize)：长文压缩与要点抽取

示例任务：

```text
帮我调研"OpenClaw 多智能体编排"近三个月的实践文章，整理成对比表并给出落地建议。
```

### 6.3 个人效率（日历 + 邮件 + 任务）

- [`caldav-calendar`](https://clawhub.ai/asleep123/caldav-calendar)：日程查询与冲突检测
- [`agentmail`](https://clawhub.ai/adboio/agentmail)：邮件收发流程
- [`todoist`](https://clawhub.ai/skills?nonSuspicious=true&q=todoist)：任务拆分与跟踪
- [`gog`](https://clawhub.ai/skills?nonSuspicious=true&q=gog)：Google 生态协同（Gmail/Calendar/Drive）

示例任务：

```text
每天早上 9 点给我发"今日简报"：日程冲突、待办 Top 3、昨晚未读重点邮件。
```

### 6.4 运维自动化（DevOps + Cloud）

- [`devops`](https://clawhub.ai/tkuehnl/agentic-devops)：常见运维动作脚本化
- [`aws-infra`](https://clawhub.ai/skills?nonSuspicious=true&q=aws-infra)：AWS 资源巡检
- [`azure-devops`](https://clawhub.ai/pals-software/azure-devops)：流水线与项目管理联动
- [`playwright`](https://clawhub.ai/skills?nonSuspicious=true&q=playwright)：Web 控制台回归检查

示例任务：

```text
每周一做一次线上环境巡检：证书到期、实例健康、失败流水线，并生成修复建议。
```

### 6.5 安全与风控（Security）

- [`skill-vetter`](https://clawhub.ai/spclaudehome/skill-vetter)：安装前技能安全体检
- [`1password`](https://clawhub.ai/skills?nonSuspicious=true&q=1password)：凭证托管与调用
- [`amai-id`](https://clawhub.ai/skills?nonSuspicious=true&q=amai-id)：身份与风险校验
- [`summarize`](https://clawhub.ai/skills?nonSuspicious=true&q=summarize)：安全公告与漏洞通告摘要

示例任务：

```text
在安装任何新技能前先跑一次风险扫描，输出"可安装 / 需人工复核 / 禁止安装"三档结果。
```

### 6.6 文档处理（PDF + Knowledge）

- [`add-watermark-to-pdf`](https://clawhub.ai/skills?nonSuspicious=true&q=add-watermark-to-pdf)：PDF 批处理
- [`agentmail`](https://clawhub.ai/adboio/agentmail)：附件流转
- [`obsidian`](https://clawhub.ai/skills?nonSuspicious=true&q=obsidian)：笔记沉淀
- [`notion`](https://clawhub.ai/tyler6204/better-notion)：团队知识库同步

示例任务：

```text
把本周收到的 PDF 报告统一加水印并摘要，然后同步到 Notion 与 Obsidian 的"周报资料"目录。
```
