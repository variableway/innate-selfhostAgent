# 龙虾大学：智能日程管理（冲突检测 + 预约协同 + 会议纪要）

> **适用场景**：你每天都在“约时间、改时间、补纪要、追行动项”里来回切换。真正的痛点不是不会记日程，而是**日程变化太快，协同成本太高**。这个按钮型场景的目标是：把日程管理从“记事情”升级为“推进事情”。

这篇文章聚焦一个可落地的闭环：会前自动准备、会中记录结构化要点、会后自动追踪行动项，并把日程冲突前置到当天就能处理。

## 1. 这篇能帮你什么

跑通后，你会得到一套“日程驱动执行”的工作流：

- 每天自动识别冲突会议与高风险时段
- 会前自动生成准备清单（目标、背景、待确认问题）
- 会后自动输出纪要并分发行动项（负责人 + 截止时间）

常见收获：

- 临时改期和撞会明显减少
- 会议质量提高，不再“开完就散”
- 跟进更可追踪，谁做、何时做、做到哪

## 2. 先复制这一句给龙虾

```text
请帮我搭一个“智能日程管理”流程：
1) 每天巡检今天和未来 3 天的日程
2) 自动识别冲突会议、超长会议（>90 分钟）和无议程会议
3) 重点会议会前自动生成准备清单：目标、决策点、必备资料、待确认问题
4) 会后自动输出纪要，必须包含：结论、决策、风险、行动项、负责人、截止时间
5) 每天把逾期未完成行动项提醒一次，并把结果推送到飞书
6) 所有输出都用中文，先给摘要版，再给详细版本
```

需要外部客户会议时，再补一句：

```text
外部会议改期时，先生成邮件草稿给我确认，再发送。
```

## 3. 需要哪些 Skills

先看每个 Skill 是做什么的：

- `skill-vetter`
  链接：<https://llmbase.ai/openclaw/skill-vetter/>
  作用：安装前安全扫描，避免把高风险 skill 放进工作流。
- `caldav-calendar`
  链接：<https://playbooks.com/skills/openclaw/skills/caldav-calendar>
  作用：读取日程、检测冲突、创建日程。
- `feishu-send-message`
  链接：<https://playbooks.com/skills/openclaw/skills/feishu-send-message>
  作用：发送提醒、纪要和巡检结果。
- `agentmail`
  链接：<https://docs.agentmail.to/integrations/openclaw>
  作用：处理外部预约邮件和确认邮件。
- `todoist`
  链接：<https://playbooks.com/skills/openclaw/skills/todoist>
  作用：把会后行动项落到待办系统里。

安装命令如下：

```bash
clawhub install skill-vetter
clawhub install caldav-calendar
clawhub install feishu-send-message
clawhub install agentmail
clawhub install todoist
```

| 技能 | 作用 | 不装会怎样 |
| --- | --- | --- |
| `skill-vetter` | 安装前安全扫描 | 难以及时识别高风险技能 |
| `caldav-calendar` | 空闲时间查询、冲突检测、创建日程 | 会议预约核心能力 |
| `feishu-send-message` | 推送提醒与纪要文件 | 信息停留在本地，协同断裂 |
| `agentmail` | 对外预约邮件与确认 | 跨组织沟通仍需手工处理 |
| `todoist` | 行动项写入任务系统 | 会后事项缺少持续追踪 |

`feishu-cron-reminder` 目前没有稳定 slug，建议用 `openclaw cron + feishu-send-message` 组合替代。

## 4. 跑通后你会看到什么

```text
【今日日程巡检】
冲突：14:00 客户沟通 与 14:00 交付同步会重叠 30 分钟
建议：保留客户沟通，交付同步会顺延到 15:00

【会前准备】
09:30 产品评审
- 目标：确认首页改版范围
- 必备资料：需求文档 v2、上次纪要
- 讨论问题：排期、上线窗口

【会后纪要】
结论：本周只交付首页 Hero 区域
行动项：
- 李四：周四前补 UI 定稿
- 王五：周五前补前端工时评估
```

## 5. 怎么一步步配出来

### Step 1：抓冲突检测

先让龙虾扫当天与未来 3 天日程，确认能识别重叠事件，并输出冲突区间与建议处理方案。

### Step 2：固定会前准备模板

设定每个重点会议的准备清单（目标、必备资料、待确认问题、必须决策），并让龙虾持续填充。

### Step 3：设置会后输出与行动项

让龙虾在会议结束后 5 分钟生成纪要，包括结论、决策、风险、行动项（owner + ddl），再写入 Todoist。

### Step 4：加 `cron` 每日巡检

```
openclaw cron add \
  --name "calendar-health-check" \
  --cron "0 8 * * 1-5" \
  --message "请巡检今天和未来3天日程，输出冲突、超长会议（>90分钟）、无议程会议，并给出处理建议。"
```

### Step 5：验证闭环

按照下面指标模拟一次流程：

1. 冲突被提示并有处理建议
2. 会后纪要在 15 分钟内送达
3. 行动项都有 owner、ddl 并写入 Todoist
4. 逾期行动项收到每日提醒

## 6. 如果没有现成 Skill，就让 Claw 帮你造

当 `feishu-cron-reminder` 没有稳定 slug 时，可以让 Claw 用 `openclaw cron` + `feishu-send-message` 拼出提醒动作：

```text
如果提醒失败，请直接返回“当前通知通道异常”，我会手动发布。
```

## 7. 再往下优化

- 把每周复盘的会议质量指标自动写入 Notion 便于长期观察。
- 如果要覆盖不同时区，给 `cron` 逻辑加上时区判断与可选时段。
- 要让每次提醒更短小，把输出限制在 3 行以内，并在“建议”中提醒下一步行动。

## 8. 常见问题

**Q1：冲突太多，提醒噪音大怎么办？**  
A：把阈值改成“重叠超过 30 分钟才提醒”，并只提醒高优先级会议。

**Q2：纪要经常缺 owner？**  
A：在提示词里把 owner 设为必填字段，缺失时要求返回“待补充”而不是省略。

**Q3：外部会议改期风险高，怕发错邮件？**  
A：对外邮件默认“草稿模式 + 人工确认后发送”，不要直接自动外发。

**Q4：任务写入待办后没人跟？**  
A：给 P1 任务加每日提醒，并在周会前自动汇总“未完成行动项”。

## 9. 相关阅读

- [邮箱助手实战（163）](/cn/university/email-assistant/)
- [自动化科研实战](/cn/university/vibe-research/)
- [Vibe Coding 实战](/cn/university/vibe-coding/)
- [第七章 工具与定时任务](/cn/adopt/chapter7/)
