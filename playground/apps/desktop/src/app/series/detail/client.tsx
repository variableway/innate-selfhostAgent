"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useCoursesStore } from "@/lib/courses-store";
import { Button, Badge } from "@innate/ui";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  Trophy,
  Play,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { loadTutorialContent } from "@/lib/tutorial-scanner";

interface CourseDetailClientProps {
  id: string;
}

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
  const router = useRouter();

  const { discoveredTutorials, progress, currentWorkspace, workspaces, defaultWorkspaceId, seriesTutorialOrder, saveSeriesTutorialOrder } = useAppStore();
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const removeCourse = useCoursesStore((s) => s.removeCourse);
  const removeTutorialFromCourse = useCoursesStore((s) => s.removeTutorialFromCourse);
  const reorderCourseTutorials = useCoursesStore((s) => s.reorderCourseTutorials);
  const addTutorialToCourse = useCoursesStore((s) => s.addTutorialToCourse);

  const currentCourse = useCoursesStore((s) => s.courses.find((c) => c.id === id));

  const courseTutorialSlugs = new Set(currentCourse?.tutorials?.map((cs) => cs.slug) || []);

  // Build tutorial list: use saved order if available, otherwise manifest order
  const savedOrder = seriesTutorialOrder[id];
  const baseTutorials = currentCourse?.tutorials
    ? currentCourse.tutorials
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cs) => {
          const s = discoveredTutorials.find((sk) => sk.slug === cs.slug);
          return s ? { ...s, order: cs.order } : null;
        })
        .filter((s): s is NonNullable<typeof s> => !!s)
    : [];

  const courseTutorials = savedOrder
    ? savedOrder
        .map((slug) => baseTutorials.find((s) => s.slug === slug))
        .filter((s): s is NonNullable<typeof s> => !!s)
    : baseTutorials;

  const availableTutorials = discoveredTutorials.filter((s) => !courseTutorialSlugs.has(s.slug));

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const workspacePath = currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);
  // Every course is editable — they all live in the data store now,
  // so there is no read-only source. The workspacePath requirement was
  // for the old filesystem-based write functions and is no longer needed.
  const canEdit = !!currentCourse;

  if (!currentCourse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">系列不存在</p>
        <Button variant="outline" onClick={() => router.push("/series")}>
          <ArrowLeft className="mr-2" size={16} />
          返回系列列表
        </Button>
      </div>
    );
  }

  const completedCount = courseTutorials.filter((s) => progress[s.slug]?.completed).length;
  const progressPercent = courseTutorials.length > 0 ? (completedCount / courseTutorials.length) * 100 : 0;
  const totalDuration = courseTutorials.reduce((sum, s) => sum + s.duration, 0);
  const nextSkill = courseTutorials.find((s) => !progress[s.slug]?.completed);

  // Move tutorial up/down and save immediately
  const moveSkill = (fromIdx: number, direction: "up" | "down") => {
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= courseTutorials.length) return;

    const slugs = courseTutorials.map((s) => s.slug);
    [slugs[fromIdx], slugs[toIdx]] = [slugs[toIdx], slugs[fromIdx]];
    saveSeriesTutorialOrder(id, slugs);
    // Persist the new order to the data store too, so the next page
    // load sees the same order.
    reorderCourseTutorials(id, slugs);
  };

  // Multi-select add
  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const handleBatchAdd = async () => {
    if (selectedSlugs.size === 0) return;
    setSaving(true);
    try {
      const slugs = Array.from(selectedSlugs);
      const startOrder = courseTutorials.length + 1;
      for (let i = 0; i < slugs.length; i++) {
        addTutorialToCourse(id, slugs[i], startOrder + i);
      }
      setSelectedSlugs(new Set());
      setShowAddSkill(false);
    } catch (err) {
      console.error("Failed to add tutorials:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTutorial = async (slug: string) => {
    setRemovingSlug(slug);
    try {
      removeTutorialFromCourse(id, slug);
    } catch (err) {
      console.error("Failed to remove tutorial:", err);
    } finally {
      setRemovingSlug(null);
    }
  };

  const handleDeleteCourse = () => {
    if (!currentCourse) return;
    removeCourse(id);
    router.push("/series");
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Hero Header */}
      <div className="relative px-8 pt-6 pb-4 border-b bg-card">
        <Button variant="ghost" onClick={() => router.push("/series")} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          返回系列列表
        </Button>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `linear-gradient(135deg, ${currentCourse.color || '#3498db'}30 0%, ${currentCourse.color || '#3498db'}50 100%)` }}
          >
            {currentCourse.icon || "📚"}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className="text-white bg-gradient-to-r from-primary to-secondary">
                {courseTutorials.length} 个教程
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock size={14} />
                {totalDuration} 分钟
              </span>
              {currentCourse.source === "seed" && (
                <Badge variant="outline" className="text-xs">内置</Badge>
              )}
              {currentCourse.source === "local" && (
                <Badge variant="outline" className="text-xs">本地</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">{currentCourse.title}</h1>
            <p className="text-muted-foreground max-w-2xl">{currentCourse.description}</p>
          </div>
          {canEdit && (
            <div className="shrink-0 flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-sm text-muted-foreground">确定删除整个系列？</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCourse}
                    className="text-red-500 border-red-500/40 hover:bg-red-500/10"
                  >
                    <Trash2 className="mr-1.5" size={14} />
                    删除系列
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                  title="删除整个系列"
                >
                  <Trash2 className="mr-1.5" size={14} />
                  删除系列
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-primary" size={16} />
              <span className="text-sm font-medium">学习进度</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{Math.round(progressPercent)}%</span>
              <span className="text-sm text-muted-foreground">({completedCount}/{courseTutorials.length})</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-2">
            {nextSkill && progressPercent < 100 && (
              <Button size="sm" onClick={() => router.push(`/tutorial/${nextSkill.slug}`)} className="bg-gradient-to-r from-primary to-secondary">
                <Play className="mr-1 fill-current" size={14} />
                继续学习: {nextSkill.title}
              </Button>
            )}
            {progressPercent === 100 && courseTutorials.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-md text-sm">
                <Trophy size={16} />
                <span className="font-medium">恭喜！你已完成本系列所有教程</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">教程列表</h2>
              <p className="text-sm text-muted-foreground">
                {canEdit ? "用 ↑ ↓ 按钮调整顺序，自动保存 · 点击右侧删除按钮从系列中移除" : "用 ↑ ↓ 按钮调整顺序，自动保存"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button size="sm" onClick={() => { setShowAddSkill(!showAddSkill); setSelectedSlugs(new Set()); }} className="gap-2">
                <Plus size={16} />
                添加教程
              </Button>
            )}
          </div>
        </div>

        {/* Multi-select add panel */}
        {showAddSkill && canEdit && (
          <div className="mb-6 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {availableTutorials.length > 0
                  ? `选择要添加的教程 (已选 ${selectedSlugs.size}/${availableTutorials.length})`
                  : "没有可添加的教程"}
              </h3>
              {availableTutorials.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSlugs(new Set(availableTutorials.map((s) => s.slug)))}>全选</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSlugs(new Set())} disabled={selectedSlugs.size === 0}>清除</Button>
                </div>
              )}
            </div>
            {availableTutorials.length > 0 && (
              <>
                <div className="space-y-1 max-h-64 overflow-auto mb-3">
                  {availableTutorials.map((s) => {
                    const isSelected = selectedSlugs.has(s.slug);
                    return (
                      <label
                        key={s.slug}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                        }`}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(s.slug)} className="rounded" />
                        <BookOpen size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium flex-1">{s.title}</span>
                        <Badge variant="secondary" className="text-xs">{s.difficulty}</Badge>
                        <span className="text-xs text-muted-foreground">{s.duration}min</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedSlugs.size > 0 ? `已选择 ${selectedSlugs.size} 个教程` : "请选择教程"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowAddSkill(false); setSelectedSlugs(new Set()); }}>取消</Button>
                    <Button size="sm" onClick={handleBatchAdd} disabled={selectedSlugs.size === 0 || saving}>
                      {saving ? (
                        <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />添加中...</>
                      ) : (
                        <><Plus size={14} className="mr-2" />添加 {selectedSlugs.size > 0 ? `(${selectedSlugs.size})` : ""}</>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Skill list with up/down buttons */}
        {courseTutorials.length > 0 ? (
          <div className="space-y-1">
            {courseTutorials.map((tutorial, idx) => {
              const isCompleted = progress[tutorial.slug]?.completed;
              const isFirst = idx === 0;
              const isLast = idx === courseTutorials.length - 1;

              return (
                <div
                  key={tutorial.slug}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 transition-all group ${
                    isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  {/* Order number */}
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-xs font-mono text-muted-foreground shrink-0">
                    {idx + 1}
                  </div>

                  {/* Up/Down buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveSkill(idx, "up")}
                      disabled={isFirst}
                      className={`p-0.5 rounded transition-colors ${
                        isFirst
                          ? "text-muted-foreground/20 cursor-not-allowed"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      }`}
                      title="上移"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSkill(idx, "down")}
                      disabled={isLast}
                      className={`p-0.5 rounded transition-colors ${
                        isLast
                          ? "text-muted-foreground/20 cursor-not-allowed"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      }`}
                      title="下移"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Skill info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium whitespace-normal break-words [overflow-wrap:anywhere] text-sm group-hover:text-primary transition-colors">{tutorial.title}</span>
                      <Badge
                        className={`text-xs ${
                          tutorial.difficulty === "beginner" ? "bg-emerald-500/10 text-emerald-500"
                          : tutorial.difficulty === "intermediate" ? "bg-amber-500/10 text-amber-500"
                          : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {tutorial.difficulty === "beginner" ? "入门" : tutorial.difficulty === "intermediate" ? "进阶" : "高级"}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />已完成
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tutorial.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span className="text-xs">{tutorial.duration} 分钟</span>
                    </div>
                    {canEdit && !showAddSkill && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                        onClick={async (e) => { e.stopPropagation(); await handleRemoveTutorial(tutorial.slug); }}
                        disabled={removingSlug === tutorial.slug}
                        title="从系列中移除"
                      >
                        {removingSlug === tutorial.slug ? (
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} className="text-red-500" />
                        )}
                      </Button>
                    )}
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
            <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-lg">该系列暂无教程</p>
            <p className="text-sm text-muted-foreground mt-1">{canEdit ? "点击上方“添加教程”按钮开始" : "暂无内容"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
