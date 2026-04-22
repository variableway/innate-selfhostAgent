# 更多场景实战：智能家居控制助手

> **适用场景**：家庭设备越来越多，灯光、空调、门锁、摄像头分散在不同 App；你希望通过一个入口完成自动化控制，同时确保安全可控。本文对应 README 场景“智能家居控制”。

智能家居自动化最怕的就是“联动失控”，本篇重点把安全边界和透明反馈放在第一位，把回家/离家/睡眠三个场景变成可复用的安全链路。

## 1. 这篇能帮你什么

- 语音或文本一句话就能触发回家 / 离家 / 睡眠三种模式
- 天气与时间驱动的低风险任务（例如下雨自动关窗、夜间自动关灯）直接上线
- 高风险设备（门锁、摄像头、门禁）会先请求确认再动手
- 失败重试 + 飞书告警一起上，确保无人值守下也有人知晓

## 2. 先复制这一句给龙虾

```text
请帮我搭一个“智能家居控制助手”流程：
1) 支持回家、离家、睡眠三种场景
2) 低风险设备可自动执行，高风险设备（门锁/摄像头）必须先确认
3) 天气和时间触发低风险动作，例如下雨关窗、夜间关灯
4) 每次执行后返回“执行动作 / 当前状态 / 下一步建议”的结构化结果
5) 如果执行失败，先重试一次，再发送告警
6) 所有输出都用中文
```

## 3. 需要哪些 Skills

先看每个 Skill 是做什么的：

- `skill-vetter`
  链接：<https://llmbase.ai/openclaw/skill-vetter/>
  作用：安装前安全检查。
- `home-assistant`
  链接：<https://playbooks.com/skills/openclaw/skills/home-assistant>
  作用：作为家居设备统一控制入口。
- `weather`
  链接：<https://playbooks.com/skills/openclaw/openclaw/weather>
  作用：做天气条件触发，例如下雨关窗。
- `feishu-send-message`
  链接：<https://playbooks.com/skills/openclaw/skills/feishu-send-message>
  作用：发送执行结果和异常告警。

安装命令如下：

```bash
clawhub install skill-vetter
clawhub install home-assistant
clawhub install weather
clawhub install feishu-send-message
```

`feishu-send-message` 安全分析页：<https://vett.sh/skills/clawhub.ai/lycohana/feishu-send-message>

定时策略部分建议先用 `openclaw cron`，再根据团队习惯让飞书提醒；`feishu-cron-reminder` 目前还没完全确认公开 slug。

## 4. 跑通后你会看到什么

```text
【回家模式】
动作：开灯、调空调（低风险设备已执行）、高风险设备等待“确认执行”
建议：需要再开氛围灯就回“回家模式＋柔光”

【离家模式】
动作：关闭灯光、电源插座
状态：门锁/摄像头保持待确认，异常告警已推送
```

## 5. 怎么一步步配出来

1. 做设备风险分级（低：灯光/窗帘，中：空调/加湿器，高：门锁/摄像头）
2. 固化三套基本场景（回家/离家/睡眠），定义每个场景要执行的动作 + 告警条件
3. 设置高风险设备的二次确认逻辑：先推送确认消息，只有收到“确认执行”才行动
4. 定义失败重试与回退动作：失败 → 重试 → 仍失败则执行安全动作并发送告警
5. 用 `openclaw cron` 安排夜间在线率检查与周末耗电异常报告

## 6. 如果没有现成 Skill，就让 Claw 帮你造

还没有稳定的“飞书定时提醒”技能也没关系，先直接把这句话发给龙虾：

```text
请帮我生成一个最小可用的家居提醒 skill，负责执行结果通知、失败告警和每日巡检汇总，第一版只要能发消息和输出状态就行。
```

如果你想继续往下做，再把它落成一个最小 `home-ops-reminder`：

```text
home-ops-reminder/
├── SKILL.md
└── scripts/
    └── notify.py
```

在 `SKILL.md` 里写明：该技能负责结果通知、失败告警、定期巡检；`notify.py` 里先实现三个模式（`result` / `alert` / `daily-check`），然后用 `openclaw cron` 调用它。

## 7. 再往下优化

- 把“有人在家”变量接入，让离家模式只有在无人时才关空调。
- 给每个场景配默认设备组（例如“回家模式”默认只开客厅灯/电视）。
- 按设备能耗加入自动化提醒，当某个设备耗电飙高则先通知替换。

## 8. 常见问题

**Q1：设备品牌太杂，联动经常失败怎么办？**
A：先把高频设备统一接入 Home Assistant，再逐步扩展。

**Q2：家人不懂命令，使用门槛高怎么办？**
A：把指令改成场景词，如“开启回家模式”，不要暴露技术命令。

**Q3：担心误操作导致安全问题怎么办？**
A：高风险动作强制二次确认，同时保留人工紧急停用开关。
