"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Square,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  Terminal,
  Settings,
  PanelLeft,
  PanelRight,
  Clock,
  Cpu,
  Plus,
  MoreVertical,
  Layout,
} from "lucide-react";
import { Button } from "@innate/ui";

interface Step {
  id: string;
  title: string;
  content: string;
  command?: string;
  status: "pending" | "running" | "success" | "error";
}

interface TutorialItem {
  id: string;
  title: string;
  type: "series" | "tutorial";
  children?: TutorialItem[];
}

const mockDirectory: TutorialItem[] = [
  {
    id: "series-1",
    title: "Node.js 基础",
    type: "series",
    children: [
      { id: "t-1", title: "安装 fnm", type: "tutorial" },
      { id: "t-2", title: "安装 Node.js", type: "tutorial" },
      { id: "t-3", title: "npm 基础", type: "tutorial" },
    ],
  },
  {
    id: "series-2",
    title: "终端基础",
    type: "series",
    children: [
      { id: "t-4", title: "ls 命令详解", type: "tutorial" },
      { id: "t-5", title: "cd 和 pwd", type: "tutorial" },
    ],
  },
  {
    id: "series-3",
    title: "Python 基础",
    type: "series",
    children: [
      { id: "t-6", title: "安装 uv", type: "tutorial" },
      { id: "t-7", title: "Python 虚拟环境", type: "tutorial" },
    ],
  },
];

const mockSteps: Step[] = [
  {
    id: "s1",
    title: "步骤 1：安装 fnm",
    content: "fnm (Fast Node Manager) 是一个快速、简单的 Node.js 版本管理工具。",
    command: "curl -fsSL https://fnm.vercel.app/install | bash",
    status: "success",
  },
  {
    id: "s2",
    title: "步骤 2：安装 Node.js LTS",
    content: "使用 fnm 安装最新的长期支持版 Node.js。",
    command: "fnm install 24 && fnm use 24",
    status: "running",
  },
  {
    id: "s3",
    title: "步骤 3：验证安装",
    content: "检查 Node.js 和 npm 是否正确安装。",
    command: "node -v && npm -v",
    status: "pending",
  },
];

const mockTerminalOutput = [
  "$ curl -fsSL https://fnm.vercel.app/install | bash",
  "Checking dependencies...",
  "✓ curl found",
  "✓ unzip found",
  "Installing fnm...",
  "✓ fnm installed successfully",
  "",
  "$ fnm install 24 && fnm use 24",
  "Installing Node.js v24.2.0...",
  "████████████████████ 100%",
  "✓ Node.js v24.2.0 installed",
  "Using Node.js v24.2.0",
  "",
  "$ node -v",
];

export function TutorialWorkspaceSketch() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set(["series-1"]));
  const [selectedTutorial, setSelectedTutorial] = useState("t-2");
  const [activeStep] = useState("s2");

  const toggleSeries = (id: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedSteps = mockSteps.filter((s) => s.status === "success").length;
  const progress = Math.round((completedSteps / mockSteps.length) * 100);

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── 顶部工具栏 ─── */}
      <div className="h-12 flex items-center gap-3 px-4 border-b bg-card/50 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className={sidebarVisible ? "text-primary bg-primary/10" : "text-muted-foreground"}
          title="切换侧边栏"
        >
          <PanelLeft size={18} />
        </Button>

        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索教程、命令..."
            className="w-full h-8 pl-8 pr-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5">
            <Play size={14} />
            <span>运行全部</span>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
            <Square size={14} />
            <span>停止</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-background border border-border rounded-lg">
          <span className="text-xs text-muted-foreground">进度</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">{progress}%</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className={rightPanelVisible ? "text-primary bg-primary/10" : "text-muted-foreground"}
            title="切换右侧面板"
          >
            <PanelRight size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* ─── 主布局区 ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        {sidebarVisible && (
          <div className="w-64 flex flex-col border-r bg-muted/20 shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-semibold">目录</span>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              {mockDirectory.map((series) => (
                <div key={series.id}>
                  <button
                    onClick={() => toggleSeries(series.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    {expandedSeries.has(series.id) ? (
                      <ChevronDown size={14} className="text-muted-foreground" />
                    ) : (
                      <ChevronRight size={14} className="text-muted-foreground" />
                    )}
                    <FolderOpen size={14} className="text-amber-500" />
                    <span className="text-foreground font-medium">{series.title}</span>
                  </button>
                  {expandedSeries.has(series.id) && series.children && (
                    <div className="ml-4">
                      {series.children.map((tutorial) => (
                        <button
                          key={tutorial.id}
                          onClick={() => setSelectedTutorial(tutorial.id)}
                          className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg mx-1 transition-colors ${
                            selectedTutorial === tutorial.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          <FileText size={14} />
                          <span>{tutorial.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-8 py-6">
            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span>Node.js 基础</span>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium">安装 Node.js</span>
            </div>

            {/* 标题区 */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-4">
                <Cpu size={12} />
                <span>开发工具 · 初学者 · 10 分钟</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">安装 Node.js</h1>
              <p className="text-muted-foreground leading-relaxed">
                使用 fnm 安装和管理 Node.js 版本。本教程将引导你完成 fnm 安装、Node.js LTS 安装以及环境验证。
              </p>
            </div>

            {/* 步骤列表 */}
            <div className="space-y-4 max-w-3xl">
              {mockSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative p-5 rounded-xl border transition-all ${
                    activeStep === step.id
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/20"
                  }`}
                >
                  {/* 步骤头部 */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        step.status === "success"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : step.status === "running"
                          ? "bg-primary/20 text-primary animate-pulse"
                          : step.status === "error"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-background border border-border text-muted-foreground"
                      }`}
                    >
                      {step.status === "success" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                      <MoreVertical size={14} />
                    </Button>
                  </div>

                  {/* 步骤内容 */}
                  <p className="text-sm text-muted-foreground mb-3 ml-10">{step.content}</p>

                  {/* 命令块 */}
                  {step.command && (
                    <div className="ml-10 bg-background border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <span className="text-xs text-muted-foreground font-mono">bash</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                            复制
                          </Button>
                          <Button
                            size="sm"
                            className={`h-6 text-xs gap-1 ${
                              step.status === "running"
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            {step.status === "running" ? (
                              <>
                                <Square size={10} /> 停止
                              </>
                            ) : (
                              <>
                                <Play size={10} /> 执行
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <pre className="px-3 py-2 text-sm font-mono text-foreground overflow-x-auto">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        {rightPanelVisible && (
          <div className="w-96 flex flex-col border-l bg-muted/20 shrink-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Terminal size={14} className="text-primary" />
              <span className="text-sm font-semibold">终端</span>
              <span className="ml-auto text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                running
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {mockTerminalOutput.map((line, i) => (
                <div
                  key={i}
                  className={`py-0.5 ${
                    line.startsWith("$") ? "text-primary mt-2" : "text-muted-foreground"
                  }`}
                >
                  {line}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 text-primary animate-pulse">
                <span>$</span>
                <span className="w-2 h-4 bg-primary inline-block" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t">
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                📋 复制全部
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                🧹 清除
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 底部状态栏 ─── */}
      <div className="h-7 flex items-center gap-4 px-4 border-t bg-card/50 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5">
          <FileText size={12} />
          <span>当前教程: 安装 Node.js</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu size={12} />
          <span>平台: macOS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>耗时: 5 分钟</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <CheckCircle size={12} className="text-emerald-500" />
          <span>
            步骤 {completedSteps}/{mockSteps.length} 已完成
          </span>
        </div>
      </div>
    </div>
  );
}
