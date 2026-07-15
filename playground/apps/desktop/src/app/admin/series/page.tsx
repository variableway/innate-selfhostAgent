"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCoursesStore } from "@/lib/courses-store";
import { Button, Badge } from "@innate/ui";
import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  FolderPlus,
  FileText,
  RefreshCw,
  ChevronRight,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  saveTutorialToWorkspace,
  deleteTutorialFromWorkspace,
  generateTutorialMDX,
  SeriesFile,
  TutorialFile,
} from "@/lib/tutorial-scanner";

type Tab = "series" | "tutorials";

export default function CoursesManagerPage() {
  const {
    discoveredTutorials,
    scanContent,
    currentWorkspace,
    workspaces,
    defaultWorkspaceId,
  } = useAppStore();
  const courses = useCoursesStore((s) => s.courses);
  const addCourse = useCoursesStore((s) => s.addCourse);
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const removeCourse = useCoursesStore((s) => s.removeCourse);

  const [tab, setTab] = useState<Tab>("series");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const workspacePath = currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);

  const handleScan = async () => {
    setScanning(true);
    await scanContent();
    setScanning(false);
  };

  useEffect(() => {
    scanContent();
  }, [scanContent]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">系列中心</h1>
            <p className="text-sm text-muted-foreground">
              {discoveredTutorials.length} 个教程, {courses.length} 个系列
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleScan} disabled={scanning}>
            <RefreshCw className={`mr-2 size-4 ${scanning ? 'animate-spin' : ''}`} />
            Scan
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setTab("series")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === "series"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderPlus className="size-4 inline mr-2" />
          系列 ({courses.length})
        </button>
        <button
          onClick={() => setTab("tutorials")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === "tutorials"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4 inline mr-2" />
          教程 ({discoveredTutorials.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === "series" ? (
          <CourseTab
            series={courses}
            tutorials={discoveredTutorials}
            showCreate={showCreateCourse}
            setShowCreate={setShowCreateCourse}
            editingCourseId={editingCourseId}
            setEditingCourseId={setEditingCourseId}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={removeCourse}
            onRefresh={handleScan}
          />
        ) : (
          <SkillsTab
            tutorials={discoveredTutorials}
            series={courses}
            workspacePath={workspacePath}
            showCreate={showCreateSkill}
            setShowCreate={setShowCreateSkill}
            onRefresh={handleScan}
          />
        )}
      </div>
    </div>
  );
}

// ─── Course Tab ────────────────────────────────────────────────────────

function CourseTab({
  series,
  tutorials,
  showCreate,
  setShowCreate,
  editingCourseId,
  setEditingCourseId,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onRefresh,
}: {
  series: SeriesFile[];
  tutorials: TutorialFile[];
  showCreate: boolean;
  setShowCreate: (v: boolean) => void;
  editingCourseId: string | null;
  setEditingCourseId: (id: string | null) => void;
  onAddCourse: (course: SeriesFile) => string;
  onUpdateCourse: (id: string, patch: Partial<SeriesFile>) => void;
  onDeleteCourse: (id: string) => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const editingCourse = series.find((c) => c.id === editingCourseId) || null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">所有系列</h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} />
          创建系列
        </Button>
      </div>

      {showCreate && (
        <CreateCourseForm
          onCancel={() => setShowCreate(false)}
          onSave={(payload) => {
            onAddCourse({
              id: "",
              ...payload,
              source: "local",
              tutorials: [],
            });
            setShowCreate(false);
          }}
        />
      )}

      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          onCancel={() => setEditingCourseId(null)}
          onSave={(patch) => {
            onUpdateCourse(editingCourse.id, patch);
            setEditingCourseId(null);
          }}
        />
      )}

      <div className="space-y-3">
        {series.map((c) => {
          const seriesTutorials = c.tutorials
            ? c.tutorials
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((cs) => tutorials.find((s) => s.slug === cs.slug))
                .filter((s): s is TutorialFile => !!s)
            : [];

          return (
            <div
              key={c.id}
              className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/series/detail?id=${c.id}`)}
                >
                  <span className="text-2xl shrink-0">{c.icon || '📘'}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold whitespace-normal break-words [overflow-wrap:anywhere]">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2 shrink-0">
                    {c.source === "seed" ? "内置" : c.source === "builtin" ? "内置" : "本地"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCourseId(c.id)}
                    title="编辑系列信息"
                  >
                    <Pencil size={16} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`确定删除系列「${c.title}」？此操作不可撤销。`)) {
                        onDeleteCourse(c.id);
                      }
                    }}
                    title="删除系列"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <button
                    onClick={() => router.push(`/series/detail?id=${c.id}`)}
                    className="p-2 rounded-md hover:bg-accent"
                    title="查看详情"
                  >
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pl-11">
                <p className="text-xs text-muted-foreground mb-2">
                  {seriesTutorials.length} 个教程
                </p>
                {seriesTutorials.map((s) => (
                  <div key={s.slug} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                    <FileText size={14} />
                    <span>{s.title}</span>
                    <Badge variant="secondary" className="text-xs">{s.difficulty}</Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skills Tab ─────────────────────────────────────────────────────

function SkillsTab({
  tutorials,
  series,
  workspacePath,
  showCreate,
  setShowCreate,
  onRefresh,
}: {
  tutorials: TutorialFile[];
  series: SeriesFile[];
  workspacePath?: string;
  showCreate: boolean;
  setShowCreate: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const { getSeriesForTutorial } = useAppStore();

  // Deduplicate tutorials by slug (keep first occurrence)
  const seenSlugs = new Set<string>();
  const uniqueTutorials = tutorials.filter((s) => {
    if (seenSlugs.has(s.slug)) return false;
    seenSlugs.add(s.slug);
    return true;
  });

  const handleImport = async () => {
    if (!workspacePath) return;
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [{ name: 'MDX/MD', extensions: ['mdx', 'md'] }],
      });
      if (!selected) return;

      const filePath = typeof selected === 'string' ? selected : selected;
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const bytes = await readFile(filePath);
      const content = new TextDecoder().decode(bytes);

      // Extract filename as slug
      const fileName = filePath.split('/').pop() || 'imported';
      const slug = fileName.replace(/\.(mdx|md)$/, '');

      await saveTutorialToWorkspace(workspacePath, slug, content);
      await onRefresh();
    } catch (err) {
      console.error('Failed to import file:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">所有教程</h2>
        <div className="flex gap-2">
          {workspacePath && (
            <Button size="sm" variant="outline" onClick={handleImport} className="gap-2">
              <Upload size={16} />
              导入
            </Button>
          )}
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={16} />
            创建教程
          </Button>
        </div>
      </div>

      {showCreate && (
        <CreateTutorialForm
          series={series}
          workspacePath={workspacePath}
          onCancel={() => setShowCreate(false)}
          onSave={async () => {
            setShowCreate(false);
            await onRefresh();
          }}
        />
      )}

      <div className="space-y-2">
        {uniqueTutorials.map((s) => {
          const relatedCourses = getSeriesForTutorial(s.slug);
          return (
            <div key={s.slug} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium whitespace-normal break-words [overflow-wrap:anywhere]">{s.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{s.duration}min</span>
                    <Badge variant="secondary" className="text-xs">{s.difficulty}</Badge>
                    {relatedCourses.length > 0 && (
                      <span>{relatedCourses.map((c) => c.icon || '📘').join(' ')} {relatedCourses.map((c) => c.title).join(', ')}</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {s.source === 'builtin' ? 'Builtin' : s.source === 'imported' ? 'Imported' : 'Local'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/tutorial/edit?slug=${s.slug}`)}
                  title="编辑"
                >
                  <Pencil size={16} className="text-muted-foreground" />
                </Button>
                {s.source !== 'builtin' && workspacePath && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await deleteTutorialFromWorkspace(workspacePath, s.slug);
                      await onRefresh();
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Emoji Picker ──────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "📚", "📘", "📕", "📖", "📗", "📙", "📓", "📔",
  "🦞", "🤖", "🧠", "💻", "🖥️", "⌨️", "🔧", "🛠️",
  "🚀", "⚡", "🔥", "✨", "🎯", "🏆", "🎮", "🎨",
  "🐍", "🐦", "🐙", "🦀", "🐳", "🐾", "🌿", "🌍",
  "☕", "🍺", "🍕", "🍩", "🎵", "📸", "🔑", "💎",
  "🟢", "🔵", "🟣", "🟠", "🔴", "🟡", "⚪", "⬛",
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-background border rounded-md text-sm hover:border-primary/50 transition-colors"
      >
        <span className="text-xl">{value}</span>
        <span className="text-muted-foreground text-xs">点击选择</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-popover border rounded-lg shadow-lg p-3 w-64">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors text-lg ${
                  value === emoji ? "bg-accent ring-1 ring-primary" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t flex items-center gap-2">
            <span className="text-xs text-muted-foreground">自定义:</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-background border rounded text-sm"
              maxLength={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Course Form ────────────────────────────────────────────────

function CreateCourseForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (payload: { title: string; description: string; icon: string; color: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#3498db");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">创建新系列</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            placeholder="例如: Python 入门"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">图标</label>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          placeholder="简短描述系列内容"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-8 rounded border cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{color}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">取消</Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          创建系列
        </Button>
      </div>
    </form>
  );
}

// ─── Edit Course Form ─────────────────────────────────────────────────

function EditCourseForm({
  course,
  onCancel,
  onSave,
}: {
  course: SeriesFile;
  onCancel: () => void;
  onSave: (patch: Partial<SeriesFile>) => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [icon, setIcon] = useState(course.icon || "📚");
  const [color, setColor] = useState(course.color || "#3498db");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">编辑系列 · {course.id}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">图标</label>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-8 rounded border cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{color}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">取消</Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          保存修改
        </Button>
      </div>
    </form>
  );
}

// ─── Create Tutorial Form ──────────────────────────────────────────────

function CreateTutorialForm({
  series,
  workspacePath,
  onCancel,
  onSave,
}: {
  series: SeriesFile[];
  workspacePath?: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [duration, setDuration] = useState(10);
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("# My Skill\n\nContent goes here...");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspacePath) return;

    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const mdx = generateTutorialMDX({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        duration,
        category,
        tags: [],
        content,
      });
      await saveTutorialToWorkspace(workspacePath, slug, mdx);
      onSave();
    } catch (err) {
      console.error('Failed to create tutorial:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!workspacePath) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">请先创建工作区以保存自定义教程。</p>
        <Button variant="outline" size="sm" onClick={onCancel} className="mt-2">取消</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">创建新教程</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            placeholder="My Skill"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">难度</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">时长 (分钟)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          placeholder="简短描述"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">内容 (MDX)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm font-mono"
          rows={10}
          placeholder="# Title&#10;&#10;Content with <RunButton command='echo hello' />"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">取消</Button>
        <Button type="submit" size="sm" disabled={!title.trim() || saving}>
          {saving ? '保存中...' : '创建教程'}
        </Button>
      </div>
    </form>
  );
}
