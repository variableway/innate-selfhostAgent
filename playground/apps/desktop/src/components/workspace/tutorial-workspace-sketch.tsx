"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@innate/ui";
import { useAppStore } from "@/store/useAppStore";
import { loadTutorialContent, parseFrontmatter } from "@/lib/tutorial-scanner";
import type { TutorialFile, SeriesFile } from "@/lib/tutorial-scanner";
import type { Progress } from "@/types";

// ─── Types ───────────────────────────────────────────────

interface Step {
  id: string;
  title: string;
  content: string;
  command?: string;
  status: "pending" | "running" | "success" | "error";
}

// ─── Step Parser ─────────────────────────────────────────

/**
 * Parse a tutorial Markdown body into steps.
 * - Each `##` / `###` heading starts a new step.
 * - `bash {executable}` code blocks are extracted as the step's command.
 * - Everything between headings (excluding executable blocks) is the step content.
 */
function parseStepsFromMarkdown(body: string): Step[] {
  const lines = body.split("\n");
  const steps: Step[] = [];
  let currentStep: Step | null = null;
  let currentContent: string[] = [];
  let inExecutableBlock = false;
  let executableBuffer: string[] = [];

  const flushStep = () => {
    if (currentStep) {
      currentStep.content = currentContent.join("\n").trim();
      steps.push(currentStep);
    }
    currentContent = [];
    inExecutableBlock = false;
    executableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stepMatch = line.match(/^(#{2,3})\s+(.+)$/);

    if (stepMatch) {
      flushStep();
      currentStep = {
        id: `step-${steps.length}`,
        title: stepMatch[2].trim(),
        content: "",
        status: "pending",
      };
      continue;
    }

    if (currentStep) {
      const execStart = line.match(/^```bash\s*\{executable\}\s*$/);
      if (execStart) {
        inExecutableBlock = true;
        executableBuffer = [];
        continue;
      }

      if (inExecutableBlock && line.trim() === "```") {
        currentStep.command = executableBuffer.join("\n").trim();
        inExecutableBlock = false;
        executableBuffer = [];
        continue;
      }

      if (inExecutableBlock) {
        executableBuffer.push(line);
      } else {
        currentContent.push(line);
      }
    }
  }

  flushStep();

  // Fallback: if no headings found, treat the whole body as one step
  if (steps.length === 0) {
    steps.push({
      id: "step-0",
      title: "教程内容",
      content: body.trim(),
      status: "pending",
    });
  }

  return steps;
}

// ─── Helper: get tutorials for a series ────────────────

function getTutorialsForSeries(
  series: SeriesFile,
  allTutorials: TutorialFile[]
): TutorialFile[] {
  if (!series.tutorials) return [];
  return series.tutorials
    .sort((a, b) => a.order - b.order)
    .map((st) => allTutorials.find((t) => t.slug === st.slug))
    .filter((t): t is TutorialFile => !!t);
}

// ─── Component ─────────────────────────────────────────

export function TutorialWorkspaceSketch() {
  // ── Store selectors (fine-grained to reduce re-renders) ──
  const discoveredTutorials = useAppStore((state) => state.discoveredTutorials);
  const discoveredSeries = useAppStore((state) => state.discoveredSeries);
  const progress = useAppStore((state) => state.progress);
  const terminalEntries = useAppStore((state) => state.terminalEntries);
  const isExecuting = useAppStore((state) => state.isExecuting);
  const executeCommandInTerminal = useAppStore(
    (state) => state.executeCommandInTerminal
  );
  const updateProgress = useAppStore((state) => state.updateProgress);
  const scanContent = useAppStore((state) => state.scanContent);
  const clearTerminal = useAppStore((state) => state.clearTerminal);
  const showTerminal = useAppStore((state) => state.showTerminal);
  const killRunningCommand = useAppStore((state) => state.killRunningCommand);
  const currentWorkspace = useAppStore((state) => state.currentWorkspace);
  const workspaces = useAppStore((state) => state.workspaces);
  const defaultWorkspaceId = useAppStore((state) => state.defaultWorkspaceId);
  const hasScanned = useAppStore((state) => state.hasScanned);

  // ── Local UI state ──
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [runningStepId, setRunningStepId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Effects ──

  // 1. Trigger content scan on first mount if not already scanned
  useEffect(() => {
    if (!hasScanned) {
      scanContent();
    }
  }, [hasScanned, scanContent]);

  // 2. Auto-expand the first series when data arrives
  useEffect(() => {
    if (discoveredSeries.length > 0 && expandedSeries.size === 0) {
      setExpandedSeries(new Set([discoveredSeries[0].id]));
    }
  }, [discoveredSeries, expandedSeries.size]);

  // 3. Auto-select the first tutorial when data arrives
  useEffect(() => {
    if (!selectedSlug && discoveredTutorials.length > 0) {
      const firstSeries = discoveredSeries[0];
      if (firstSeries?.tutorials && firstSeries.tutorials.length > 0) {
        setSelectedSlug(firstSeries.tutorials[0].slug);
      } else {
        setSelectedSlug(discoveredTutorials[0].slug);
      }
    }
  }, [selectedSlug, discoveredTutorials, discoveredSeries]);

  // 4. Load tutorial content when selection changes
  useEffect(() => {
    if (!selectedSlug) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const workspacePath =
          currentWorkspace?.path ||
          (defaultWorkspaceId
            ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path
            : undefined);

        const result = await loadTutorialContent(selectedSlug, workspacePath);
        if (!cancelled) {
          if (result) {
            const parsed = parseFrontmatter(result.content);
            const parsedSteps = parseStepsFromMarkdown(parsed.body);
            setSteps(parsedSteps);
          } else {
            setSteps([]);
          }
        }
      } catch (e) {
        console.error("Failed to load tutorial:", e);
        if (!cancelled) setSteps([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedSlug, currentWorkspace, defaultWorkspaceId, workspaces]);

  // 5. Sync step status with persisted progress
  useEffect(() => {
    if (!selectedSlug || steps.length === 0) return;

    const tutorialProgress = progress[selectedSlug];
    if (!tutorialProgress) return;

    setSteps((prev) =>
      prev.map((step) => {
        if (tutorialProgress.completedSections.includes(step.id)) {
          return { ...step, status: "success" as const };
        }
        if (runningStepId === step.id) {
          return { ...step, status: "running" as const };
        }
        return step.status === "running"
          ? { ...step, status: "pending" as const }
          : step;
      })
    );
  }, [progress, selectedSlug, runningStepId, steps.length]);

  // ── Handlers ──

  const toggleSeries = useCallback((id: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExecuteStep = useCallback(
    (stepId: string, command: string) => {
      if (isExecuting && runningStepId === stepId) {
        // Stop the currently running step
        killRunningCommand();
        setRunningStepId(null);
        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId ? { ...s, status: "pending" as const } : s
          )
        );
        return;
      }

      // Start running
      setRunningStepId(stepId);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status: "running" as const } : s
        )
      );
      showTerminal();
      executeCommandInTerminal(command);
    },
    [isExecuting, runningStepId, killRunningCommand, showTerminal, executeCommandInTerminal]
  );

  const handleStepComplete = useCallback(
    (stepId: string) => {
      if (!selectedSlug) return;

      const tutorialProgress = progress[selectedSlug] || {
        tutorialId: selectedSlug,
        completed: false,
        completedSections: [],
      };

      if (!tutorialProgress.completedSections.includes(stepId)) {
        const newCompleted = [...tutorialProgress.completedSections, stepId];
        const newProgress: Progress = {
          ...tutorialProgress,
          tutorialId: selectedSlug,
          completedSections: newCompleted,
          completed: newCompleted.length >= steps.length,
          lastSection: stepId,
          startedAt:
            tutorialProgress.startedAt || new Date().toISOString(),
          completedAt:
            newCompleted.length >= steps.length
              ? new Date().toISOString()
              : undefined,
        };
        updateProgress(newProgress);
      }

      setRunningStepId(null);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status: "success" as const } : s
        )
      );
    },
    [selectedSlug, progress, steps.length, updateProgress]
  );

  const handleRunAll = useCallback(() => {
    const pendingSteps = steps.filter(
      (s) => s.status !== "success" && s.command
    );
    if (pendingSteps.length === 0) return;

    showTerminal();
    // Send all pending commands with a staggered delay so the terminal
    // processes them sequentially. This is a simple queue — real completion
    // detection would need PTY event listeners.
    pendingSteps.forEach((step, i) => {
      setTimeout(() => {
        executeCommandInTerminal(step.command!);
      }, i * 500);
    });

    // Mark the first one as "running" in the UI
    if (pendingSteps[0]) {
      setRunningStepId(pendingSteps[0].id);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === pendingSteps[0].id
            ? { ...s, status: "running" as const }
            : s
        )
      );
    }
  }, [steps, showTerminal, executeCommandInTerminal]);

  const handleStopAll = useCallback(() => {
    killRunningCommand();
    setRunningStepId(null);
    setSteps((prev) =>
      prev.map((s) =>
        s.status === "running" ? { ...s, status: "pending" as const } : s
      )
    );
  }, [killRunningCommand]);

  // ── Derived data ──

  const completedSteps = steps.filter((s) => s.status === "success").length;
  const progressPercent =
    steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  const currentTutorial = discoveredTutorials.find(
    (t) => t.slug === selectedSlug
  );
  const currentSeries = discoveredSeries.find((s) =>
    s.tutorials?.some((t) => t.slug === selectedSlug)
  );

  const tutorialProgress = selectedSlug ? progress[selectedSlug] : null;

  const studyDuration = useMemo(() => {
    if (!tutorialProgress?.startedAt) return "0 分钟";
    const start = new Date(tutorialProgress.startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diff <= 0 ? "0 分钟" : `${diff} 分钟`;
  }, [tutorialProgress?.startedAt]);

  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return discoveredSeries;
    const q = searchQuery.toLowerCase();
    return discoveredSeries.filter((series) => {
      const matchesSeries = series.title.toLowerCase().includes(q);
      const tutorials = getTutorialsForSeries(series, discoveredTutorials);
      const matchesTutorial = tutorials.some((t) =>
        t.title.toLowerCase().includes(q)
      );
      return matchesSeries || matchesTutorial;
    });
  }, [discoveredSeries, searchQuery, discoveredTutorials]);

  const platformInfo = useMemo(() => {
    if (typeof navigator === "undefined") return "Unknown";
    const platform = navigator.platform;
    if (platform.includes("Win")) return "Windows";
    if (platform.includes("Mac")) return "macOS";
    if (platform.includes("Linux")) return "Linux";
    return platform;
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const copyTerminalOutput = useCallback(() => {
    const text = terminalEntries.map((e) => e.text).join("\n");
    copyToClipboard(text);
  }, [terminalEntries, copyToClipboard]);

  // ── Render ──

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── 顶部工具栏 ─── */}
      <div className="h-12 flex items-center gap-3 px-4 border-b bg-card/50 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className={
            sidebarVisible
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }
          title="切换侧边栏"
        >
          <PanelLeft size={18} />
        </Button>

        <div className="flex-1 max-w-md relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="搜索教程、命令..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleRunAll}
            disabled={
              isExecuting ||
              steps.filter((s) => s.command && s.status !== "success").length ===
                0
            }
          >
            <Play size={14} />
            <span>运行全部</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={handleStopAll}
            disabled={!isExecuting}
          >
            <Square size={14} />
            <span>停止</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-background border border-border rounded-lg">
          <span className="text-xs text-muted-foreground">进度</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">
            {progressPercent}%
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className={
              rightPanelVisible
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }
            title="切换右侧面板"
          >
            <PanelRight size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
          >
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
              {hasScanned ? (
                filteredSeries.length > 0 ? (
                  filteredSeries.map((series) => {
                    const tutorials = getTutorialsForSeries(
                      series,
                      discoveredTutorials
                    );
                    return (
                      <div key={series.id}>
                        <button
                          onClick={() => toggleSeries(series.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                          {expandedSeries.has(series.id) ? (
                            <ChevronDown
                              size={14}
                              className="text-muted-foreground"
                            />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="text-muted-foreground"
                            />
                          )}
                          <FolderOpen size={14} className="text-amber-500" />
                          <span className="text-foreground font-medium">
                            {series.title}
                          </span>
                        </button>
                        {expandedSeries.has(series.id) &&
                          tutorials.length > 0 && (
                            <div className="ml-4">
                              {tutorials.map((tutorial) => (
                                <button
                                  key={tutorial.slug}
                                  onClick={() =>
                                    setSelectedSlug(tutorial.slug)
                                  }
                                  className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg mx-1 transition-colors ${
                                    selectedSlug === tutorial.slug
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
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    暂无教程
                  </div>
                )
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  扫描中...
                </div>
              )}
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-8 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-muted-foreground">
                  加载教程中...
                </div>
              </div>
            ) : !currentTutorial ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                请选择一个教程
              </div>
            ) : (
              <>
                {/* 面包屑 */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <span>{currentSeries?.title || "系列"}</span>
                  <ChevronRight size={14} />
                  <span className="text-foreground font-medium">
                    {currentTutorial.title}
                  </span>
                </div>

                {/* 标题区 */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-4">
                    <Cpu size={12} />
                    <span>
                      {currentTutorial.category} ·{" "}
                      {currentTutorial.difficulty === "beginner"
                        ? "初学者"
                        : currentTutorial.difficulty === "intermediate"
                        ? "中级"
                        : "高级"}
                      · {currentTutorial.duration} 分钟
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {currentTutorial.title}
                  </h1>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentTutorial.description}
                  </p>
                  {currentTutorial.tags && currentTutorial.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {currentTutorial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 步骤列表 */}
                <div className="space-y-4 max-w-3xl">
                  {steps.length === 0 ? (
                    <div className="text-muted-foreground">
                      本教程暂无步骤。
                    </div>
                  ) : (
                    steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`relative p-5 rounded-xl border transition-all ${
                          runningStepId === step.id
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
                            <h3 className="text-sm font-semibold text-foreground">
                              {step.title}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </div>

                        {/* 步骤内容 */}
                        {step.content && (
                          <div className="text-sm text-muted-foreground mb-3 ml-10 whitespace-pre-wrap">
                            {step.content}
                          </div>
                        )}

                        {/* 命令块 */}
                        {step.command && (
                          <div className="ml-10 bg-background border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                              <span className="text-xs text-muted-foreground font-mono">
                                bash
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-muted-foreground"
                                  onClick={() =>
                                    copyToClipboard(step.command!)
                                  }
                                >
                                  复制
                                </Button>
                                <Button
                                  size="sm"
                                  className={`h-6 text-xs gap-1 ${
                                    step.status === "running"
                                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                      : "bg-primary/10 text-primary hover:bg-primary/20"
                                  }`}
                                  onClick={() =>
                                    handleExecuteStep(step.id, step.command!)
                                  }
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

                        {/* 手动标记完成 */}
                        {step.status !== "success" &&
                          step.status !== "running" && (
                            <div className="ml-10 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                onClick={() => handleStepComplete(step.id)}
                              >
                                <CheckCircle size={10} className="mr-1" />
                                标记完成
                              </Button>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右侧面板 */}
        {rightPanelVisible && (
          <div className="w-96 flex flex-col border-l bg-muted/20 shrink-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Terminal size={14} className="text-primary" />
              <span className="text-sm font-semibold">终端</span>
              <span
                className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  isExecuting
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isExecuting ? "running" : "idle"}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {terminalEntries.length === 0 ? (
                <div className="text-muted-foreground text-xs">
                  终端暂无输出
                </div>
              ) : (
                terminalEntries.map((entry, i) => (
                  <div
                    key={i}
                    className={`py-0.5 break-words ${
                      entry.type === "command"
                        ? "text-primary mt-1"
                        : entry.type === "stderr"
                        ? "text-destructive"
                        : entry.type === "system"
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {entry.text}
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="flex items-center gap-2 mt-2 text-primary animate-pulse">
                  <span>$</span>
                  <span className="w-2 h-4 bg-primary inline-block" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={copyTerminalOutput}
              >
                <Copy size={12} className="mr-1" />
                复制全部
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={clearTerminal}
              >
                <Trash2 size={12} className="mr-1" />
                清除
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 底部状态栏 ─── */}
      <div className="h-7 flex items-center gap-4 px-4 border-t bg-card/50 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5">
          <FileText size={12} />
          <span>当前教程: {currentTutorial?.title || "未选择"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu size={12} />
          <span>平台: {platformInfo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>耗时: {studyDuration}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <CheckCircle size={12} className="text-emerald-500" />
          <span>
            步骤 {completedSteps}/{steps.length} 已完成
          </span>
        </div>
      </div>
    </div>
  );
}
