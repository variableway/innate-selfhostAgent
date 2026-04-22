# 自动化测试与部署：CI/CD 助手实战

> **适用场景**：每次提交都要手动看 Jenkins/GitHub Actions，团队在飞书里问“上线了没”快成常态。本文把“提交 → 验证 → 通知 → 推进”这几个重复动作交给龙虾，先跑通自动反馈，再逐步加自动修复。

## 1. 这篇能帮你什么

- 第一条把“每次上线必须盯的三件事”自动化：构建状态、失败摘要、下一步动作。
- 第二条把“发布前检查清单”固化，遇到未审批的步骤直接阻断。
- 第三条把“发布后巡检”拉成定时任务，正常和异常都有人在飞书里拿到结构化结果。

## 2. 先复制这一句给龙虾

```text
请帮我搭一个 CI/CD 助手：
1) 提交或合并后读取最新流水线状态，失败时列出失败阶段、错误摘要、下步排查指令；
2) 通过后走发布前检查清单（测试、配置、数据库迁移都要确认），任何一项失败都要先停下并提醒我；
3) 生产发布必须等我确认，测试环境可以自动执行；
4) 发布完成后监控 20 分钟健康接口、错误率、响应时间，异常立刻通知飞书；
5) 所有消息按“状态 / 风险 / 下一步动作”格式输出。
```

## 3. 需要哪些 Skills

- `skill-vetter`
  链接：<https://llmbase.ai/openclaw/skill-vetter/>
  作用：安装前做安全检查，避免生产环境被不可信技能占用。
- `github`
  链接：<https://playbooks.com/skills/openclaw/skills/github>
  作用：读取 PR、Action、Release 的状态和日志。
- `devops`
  链接：<https://playbooks.com/skills/openclaw/skills/devops>
  作用：执行发布前检查、部署命令和健康巡检。
- `claude-code`
  链接：<https://playbooks.com/skills/openclaw/skills/claude-code>
  作用：可选，用于生成修复建议或自动补充命令。
- `gog`
  链接：<https://playbooks.com/skills/openclaw/skills/gog>
  作用：保存发布记录、周报与审计追踪。

安装命令如下：

```bash
clawhub install skill-vetter
clawhub install github
clawhub install devops
clawhub install claude-code
clawhub install gog
```

## 4. 跑通后你会看到什么

```text
【状态】
最新 CI：失败
失败阶段：integration-test

【风险】
payment-service 在第 3 个用例出现超时，怀疑依赖服务未准备。

【下一步动作】
1) 检查测试环境 payment mock 是否启动；
2) 若 10 分钟内不能复现，先加 5 秒启动等待；
3) 需要我确认后才执行生产部署。
```

## 5. 怎么一步步配出来

1. 先装技能，并用 `skill-vetter run` 检查安全；`clawhub install github devops`，确认能访问目标仓库和部署环境。
2. 建 `openclaw prompt` 里的发布前检查清单：包含测试通过、数据库迁移、配置是否设置、回滚命令能用。
3. 拼一条 `openclaw cron add`：每天/每次发布后 5 分钟触发一次健康巡检消息。
4. 给失败摘要写固定模板（阶段、错误、建议命令、需要谁）；给通过情况写 “进入发布前清单 → 等我确认 → 继续部署”。
5. 用 `claude-code` 生成 PR 草案需要时再开启，默认先人工确认再自动执行任何动做。

## 6. 如果没有现成 Skill，就让 Claw 帮你造

大多数 CI/CD 节点都能用上面的公共 skill，但如果你要把“发布清单”封成一个独立 skill，比如 `release-checker`，让 Claw 先帮你写一个最小 `SKILL.md` 也是 1 分钟动作：

```
name: release-checker
description: 检查发布清单、决定是否继续部署

主要任务：
- 确认测试、配置、迁移通过
- 输出「状态 / 风险 / 下一步动作」三段回复
- 失败时阻断并说明下一步

优先调用：`python scripts/main.py "<用户输入>"`
```

然后用 `scripts/main.py` 先写 4 步：读流水线、验证清单、输出结构化结果、返回飞书通知。只要能跑通一次，你就有了自定义 skill，其他步骤可以再优化。

## 7. 再往下优化

- 把失败日志用 `claude-code` 摘要，减少飞书里的阅读时间。
- 加一个 `openclaw cron`，每周自动把过去 7 天的发布结果写入 gog。
- 如果团队需要，加入 “发布风险白名单” 让龙虾先查需不需要人工审批。

## 8. 常见问题

**Q1：生产环境能全自动部署吗？**  
A：初期先测试环境自动、生产人工确认；确认稳定后再用 `devops` 执行生产命令，但仍保留“人工确认”开关。

**Q2：CI 失败时我不想看一堆日志，怎么办？**  
A：在提示词里加“只输出失败阶段 + 最快排查命令 + 需要谁介入”，脚本层再对错误做关键词过滤。
