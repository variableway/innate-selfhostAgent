# 系列教程制作方法与 Python/Notebook 集成方案

## 1. 制作方法

### 教程格式规范

所有教程使用 **MDX 格式**（Markdown + JSX 组件），存放在 `playground/apps/desktop/public/skills/` 目录。

#### Frontmatter 元数据

```yaml
---
title: "教程标题"
description: "一句话描述"
difficulty: beginner | intermediate
duration: 预计学习时间（分钟）
category: 教程分类
tags: ["标签1", "标签2"]
---
```

#### 核心组件

| 组件 | 用途 | 示例 |
|------|------|------|
| `<RunnableCodeBlock>` | 可执行的代码块 | `code="python3 -c 'print(...)'"` |
| `<PlatformTabs>` | 平台切换标签页 | `unix={...} windows={...}` |

#### 教程结构模板

```markdown
# 标题

> 一句话引入

---

## 前置要求

## 步骤 1: xxx

## 步骤 2: xxx

...

## 关键概念速查

| 概念 | 解释 |

## 小测验（可选）

## 你已经学会了什么

## 下一步

---
*结束语*
```

### 制作流程

```
1. 确定主题和难度等级
2. 编写大纲（参考 tasks/research/tutorial-outlines.md）
3. 填充内容（参考 references/ 目录的源材料）
4. 添加可执行代码块（<RunnableCodeBlock>）
5. 添加平台切换（<PlatformTabs>）
6. 校对和测试
7. 放入 public/skills/ 目录
```

### 难度分级标准

| 等级 | 目标用户 | 内容特点 |
|------|---------|---------|
| beginner | 完全小白 | 无编程基础要求，用生活类比解释概念，步骤详细 |
| intermediate | 有点基础 | 需要基础命令行知识，概念更深入，有代码练习 |
| advanced | 非目标用户 | 不制作（当前阶段） |

### 已创建教程清单

#### Hello-Claw 系列（A系列，共7个）

| 编号 | 文件名 | 标题 | 难度 |
|------|--------|------|------|
| A1-1 | openclaw-5min-experience.mdx | OpenClaw 5分钟体验 | beginner |
| A1-2 | openclaw-search-summarize.mdx | 搜索和总结 | beginner |
| A1-3 | openclaw-email-calendar.mdx | 邮件和日程 | beginner |
| A1-4 | (待创建) | 连接聊天平台 | beginner |
| A2-1 | openclaw-custom-skills.mdx | 自定义技能 | intermediate |
| A2-2 | (待创建) | 多智能体协作 | intermediate |
| A2-3 | (待创建) | 安全与运维 | intermediate |

#### Path2AGI 系列（B系列，共9个）

| 编号 | 文件名 | 标题 | 难度 |
|------|--------|------|------|
| B1-1 | ai-interdisciplinary-journey.mdx | AI 跨学科之旅 | beginner |
| B1-2 | ai-math-basics-part1.mdx | 数学基础（上） | beginner |
| B1-3 | ai-math-basics-part2.mdx | 数学基础（下） | beginner |
| B1-4 | ai-cognitive-science.mdx | 认知科学入门 | beginner |
| B1-5 | (待创建) | 伦理与治理 | beginner |
| B2-1 | ai-causal-inference.mdx | 因果推断与优化 | intermediate |
| B2-2 | ai-cybernetics-complexity.mdx | 控制论与复杂系统 | intermediate |
| B2-3 | (待创建) | 语言学到 LLM | intermediate |
| B2-4 | (待创建) | 博弈论与多智能体 | intermediate |

---

## 2. Python / Jupyter Notebook 集成方案

### 方案概述

教程中的 Python 代码目前通过 `<RunnableCodeBlock>` 在终端执行。要支持 Jupyter Notebook 交互，有以下方案：

### 方案 A：嵌入式 Notebook（推荐）

使用 Jupyter 的 `voila` 或 `jupyterlite` 在浏览器中运行 Notebook：

```
教程页面
├── 文字说明（MDX）
├── 可执行代码块（现有 RunnableCodeBlock）
└── 嵌入式 Notebook（iframe 或组件）
    ├── 代码单元格
    ├── 输出展示
    └── 交互式控件
```

**实现步骤**：
1. 安装 `jupyterlite` 作为静态 Notebook 运行环境
2. 创建自定义 `<NotebookBlock>` 组件
3. 将教程中的 Python 练习转化为 Notebook 格式

### 方案 B：Notebook 导出

将教程导出为 `.ipynb` 文件，用户可以下载后在本地 Jupyter 中运行：

```
MDX 教程 → 转化脚本 → .ipynb 文件 → 用户下载 → Jupyter 打开
```

**实现步骤**：
1. 编写 MDX → ipynb 转化器
2. 在教程页面添加"下载为 Notebook"按钮
3. 自动将 RunnableCodeBlock 转化为 Notebook 代码单元格

### 方案 C：在线代码执行

使用 WebAssembly 在浏览器中直接运行 Python：

```
教程页面
├── MDX 内容
└── <PyodideBlock> 组件
    └── 浏览器内 Python 运行时（Pyodide）
```

**优势**：无需安装 Python，直接在浏览器中体验
**劣势**：首次加载较慢，不支持所有 Python 库

### 推荐实施路径

```
Phase 1（当前）：RunnableCodeBlock 在终端执行 Python
Phase 2：添加"下载为 Notebook"功能（方案 B）
Phase 3：嵌入 JupyterLite 在线运行（方案 A）
```

### Notebook 教程示例

Path2AGI 系列教程特别适合 Notebook 格式，因为它们包含大量数学概念的可视化：

```python
# ai-math-basics-notebook.ipynb 示例
import numpy as np
import matplotlib.pyplot as plt

# 梯度下降可视化
x = np.linspace(-5, 5, 100)
y = x ** 2

plt.figure(figsize=(8, 4))
plt.plot(x, y, label='f(x) = x²')

# 画出梯度下降路径
px = 4.0
path_x, path_y = [px], [px**2]
lr = 0.3
for _ in range(8):
    px = px - lr * 2 * px
    path_x.append(px)
    path_y.append(px**2)

plt.plot(path_x, path_y, 'ro-', label='梯度下降路径')
plt.legend()
plt.title('梯度下降演示')
plt.show()
```

---

## 3. 总结

- 已创建 **10 个系列教程**（3 P0 + 4 P1 + 3 P2），覆盖 Hello-Claw 和 Path2AGI 两大系列
- 教程遵循统一的 MDX 格式，支持可执行代码和平台切换
- Python 集成推荐分三阶段实施：终端执行 → Notebook 导出 → 在线运行
