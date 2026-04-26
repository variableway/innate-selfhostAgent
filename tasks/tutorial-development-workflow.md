# Tutorial 开发编排步骤

> 基于当前项目结构（docs/guides/ + scripts/install/ + apps/desktop/ + skills/）的教程开发标准流程

---

## 步骤 1：需求分析与选题

**目标**：确定教程要解决什么问题，面向谁。

| 检查项 | 说明 |
|--------|------|
| 目标用户 | beginner / intermediate / advanced |
| 支持平台 | macOS / Windows / WSL / Linux |
| 核心工具 | 要安装的软件或配置的环境 |
| 预计耗时 | 建议 5-30 分钟 |
| 前置依赖 | 是否需要先完成其他教程 |

**产出**：`tasks/plan/<tutorial-id>.md` — 简单的需求说明。

---

## 步骤 2：脚本开发（Scripts）

**目标**：编写可执行、幂等、跨平台的安装/配置脚本。

**目录**：`scripts/install/` 或 `scripts/configure/`

**规范**：
- Mac 脚本：`*.sh`，使用 `set -e`，彩色输出（`print_info` / `print_success` / `print_error`）
- Windows 脚本：`*.ps1`，管理员权限检查
- 所有脚本必须**幂等**（重复运行不会出错）
- 脚本末尾包含**验证步骤**（检查版本号或运行状态）

**示例**：
```bash
# scripts/install/install-<tool>-mac.sh
#!/bin/bash
set -e
print_info "正在安装 <Tool> ..."
# 安装逻辑
print_success "<Tool> 安装完成"
<Tool> --version
```

---

## 步骤 3：文档编写（Guides）

**目标**：编写用户可读、步骤清晰的 Markdown 教程。

**目录**：`docs/guides/<category>/<tutorial-name>.md`

**规范**：
- 使用中文编写（面向中文初学者）
- 每个教程包含：目标 → 前置条件 → 步骤 → 验证 → 常见问题
- 步骤中引用对应脚本的路径，方便用户一键复制
- 难度标识：`beginner` / `intermediate` / `advanced`

**模板结构**：
```markdown
# 教程标题

## 🎯 目标
一句话说明学完能做什么。

## 📋 前置条件
- 已完成 xxx 教程
- macOS / Windows

## 📝 步骤

### 步骤 1：xxx
说明文字...

```bash
./scripts/install/install-xxx-mac.sh
```

### 步骤 2：xxx
...

## ✅ 验证
运行以下命令检查：
```bash
xxx --version
```

## ❓ 常见问题
...
```

---

## 步骤 4：Skill 定义（JSON）

**目标**：将教程结构化，供桌面应用读取和自动化执行。

**目录**：`skills/<level>/<tutorial-id>.json`

**Schema 要点**：
```json
{
  "id": "nodejs-setup",
  "name": "Node.js 环境配置",
  "level": "beginner",
  "platform": ["macos", "windows"],
  "estimatedTime": 10,
  "prerequisites": [],
  "steps": [
    {
      "id": "install-fnm",
      "type": "script",
      "title": "安装 fnm",
      "command": "./scripts/install/install-nodejs-mac.sh",
      "platform": "macos",
      "verify": "fnm --version"
    },
    {
      "id": "verify-node",
      "type": "verification",
      "title": "验证 Node.js",
      "command": "node -v",
      "expectedOutput": "v24."
    }
  ]
}
```

---

## 步骤 5：桌面应用集成（App Integration）

**目标**：让教程在桌面应用中可见、可搜索、可执行。

**操作**：
1. 在 `apps/desktop/src/store/useAppStore.ts` 的 `mockTutorials` 和 `mockSeries` 中注册教程数据
2. 如有需要，创建或更新组件：
   - `apps/desktop/src/components/tutorial/TutorialCard.tsx` — 卡片展示
   - `apps/desktop/src/components/TutorialDetail.tsx` — 详情页
3. 确保教程中的可执行代码块能被 `Terminal` 组件识别并运行

**数据注册示例**：
```typescript
const mockTutorials: Tutorial[] = [
  {
    id: 'tutorial-xxx',
    title: '教程标题',
    description: '简短描述',
    category: 'dev-tools',
    difficulty: 'beginner',
    duration: 10,
    tags: ['nodejs', 'fnm'],
    series: 'series-xxx',
    order: 1,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
];
```

---

## 步骤 6：测试验证（Testing）

**目标**：确保教程在目标平台上能正常运行。

| 测试类型 | 方法 |
|----------|------|
| 脚本测试 | 在干净的虚拟机或 Docker 中运行脚本 |
| 文档测试 | 按文档步骤手动走一遍，检查是否有遗漏 |
| 应用测试 | 在桌面应用中打开教程，点击执行按钮，观察终端输出 |
| 跨平台测试 | macOS 和 Windows 各测一遍 |

**产出**：在 `tasks/tests/<tutorial-id>/` 下记录测试结果。

---

## 步骤 7：发布与迭代（Release）

**目标**：将教程发布给用户，并根据反馈持续改进。

- 更新 `README.md` 中的学习路径（如新增核心教程）
- 更新 `docs/GETTING-STARTED.md`（如影响新手流程）
- 收集用户 Issue 和反馈
- 定期检查脚本是否因软件版本更新而失效

---

## 快速检查清单

```
□ 需求分析完成
□ 脚本开发完成（Mac + Windows）
□ 文档编写完成（中文 + 符合模板）
□ Skill JSON 定义完成
□ 桌面应用数据注册完成
□ 测试通过（脚本 + 应用 + 跨平台）
□ README / GETTING-STARTED 已更新
```
