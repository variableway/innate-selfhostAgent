"use client";

import { useState, useEffect, Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button, Badge } from "@innate/ui";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { RunButton } from "@/components/tutorial/run-button";
import { PlatformTabs } from "@/components/tutorial/platform-tabs";
import { RunnableCodeBlock } from "@/components/tutorial/runnable-code-block";
import { AutoRunnablePre } from "@/components/tutorial/auto-runnable-pre";
import { loadSkillContent, parseFrontmatter, SkillFile } from "@/lib/tutorial-scanner";

interface TutorialDetailClientProps {
  id: string;
}

// Error boundary for MDX rendering
class MDXErrorBoundary extends Component<{ children: ReactNode; onError: (err: Error) => void }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[MDXErrorBoundary] MDX render error:", error);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
          <p className="text-red-600 font-medium">内容渲染出错</p>
          <p className="text-sm text-red-500 mt-1">请刷新页面重试，或检查教程文件格式。</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Inline code styling (for `code` backticks within text)
function MdxInlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  );
}

const mdxComponents = {
  RunButton,
  PlatformTabs,
  RunnableCodeBlock,
  pre: AutoRunnablePre,
  code: MdxInlineCode,
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mt-0 mb-4 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mt-8 mb-3 border-b border-border/50 pb-2 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-medium mt-6 mb-2 text-foreground">{children}</h3>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b bg-primary/5 px-3 py-2 text-left font-medium text-foreground">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-border/40 px-3 py-2">{children}</td>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-primary/50 bg-primary/5 px-4 py-2 rounded-r-md">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 leading-7">{children}</p>
  ),
  hr: () => <hr className="my-6 border-border/50" />,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="text-primary hover:text-primary/80 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function TutorialDetailClient({ id }: TutorialDetailClientProps) {
  const router = useRouter();
  const slug = id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [meta, setMeta] = useState<SkillFile | null>(null);

  const { discoveredSkills, updateProgress, progress } = useAppStore();
  const tutorialProgress = progress[slug];

  // Load MDX content
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Find workspace path
        const state = useAppStore.getState();
        const workspacePath = state.currentWorkspace?.path ||
          (state.defaultWorkspaceId ? state.workspaces.find((w) => w.id === state.defaultWorkspaceId)?.path : undefined);

        console.log(`[TutorialDetail] Loading skill: ${slug}, workspace: ${workspacePath || 'none'}`);

        const result = await loadSkillContent(slug, workspacePath);
        if (!result) {
          console.error(`[TutorialDetail] Skill content not found: ${slug}`);
          setError("技能内容未找到");
          return;
        }

        console.log(`[TutorialDetail] Content loaded from: ${result.path}, length: ${result.content.length}`);

        const { frontmatter, body } = parseFrontmatter(result.content);
        console.log(`[TutorialDetail] Frontmatter:`, frontmatter);

        // Set metadata
        const skillMeta = discoveredSkills.find((t) => t.slug === slug);
        setMeta(skillMeta || {
          slug,
          title: frontmatter.title || slug,
          description: frontmatter.description || '',
          difficulty: frontmatter.difficulty || 'beginner',
          duration: frontmatter.duration || 10,
          category: frontmatter.category || 'general',
          tags: frontmatter.tags || [],
          source: result.source,
        } as SkillFile);

        // Serialize MDX body
        // Escape bare fenced code blocks so MDX/acorn doesn't choke on {} inside them.
        // Code inside JSX component props (e.g. code={...}) is already safe because
        // it's inside a string — only bare ``` blocks need this treatment.
        const safeBody = body.replace(
          /(```[\s\S]*?```)/g,
          (match) => {
            // If this code block contains curly braces that acorn would try to parse,
            // wrap the content in a JSX expression string to protect it.
            if (/{[^}]*}/.test(match)) {
              const inner = match.slice(3, -3);
              const firstNewline = inner.indexOf("\n");
              const lang = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : "";
              const code = firstNewline >= 0 ? inner.slice(firstNewline + 1) : "";
              return `<RunnableCodeBlock language="${lang || "text"}" runnable={false} code={\`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`} />`;
            }
            return match;
          }
        );

        console.log(`[TutorialDetail] Serializing MDX body...`);
        const serialized = await serialize(safeBody, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            format: "mdx",
          },
          parseFrontmatter: false,
        });
        console.log(`[TutorialDetail] MDX serialized successfully`);
        setMdxSource(serialized);
      } catch (err) {
        console.error(`[TutorialDetail] Error loading skill:`, err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, discoveredSkills]);

  const handleMarkComplete = () => {
    updateProgress({
      skillId: slug,
      completed: true,
      completedSections: [],
      completedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    updateProgress({
      skillId: slug,
      completed: false,
      completedSections: [],
    });
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "intermediate": return { text: "进阶", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "advanced": return { text: "高级", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      default: return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
  };

  const difficulty = getDifficultyConfig(meta?.difficulty || "beginner");

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">加载技能...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" size={16} />
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-8 py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          返回
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${difficulty.bg} ${difficulty.color} ${difficulty.border}`}>
                {difficulty.text}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock size={14} />
                {meta?.duration || 10} 分钟
              </span>
              {meta?.source === 'local' && (
                <Badge variant="outline" className="text-xs">本地</Badge>
              )}
              {tutorialProgress?.completed && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{meta?.title || slug}</h1>
            <p className="text-muted-foreground text-lg">{meta?.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {tutorialProgress?.completed ? (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2" size={18} />
                  重置进度
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-md">
                  <CheckCircle size={18} />
                  <span className="font-medium">已完成</span>
                </div>
              </>
            ) : (
              <Button onClick={handleMarkComplete} className="bg-gradient-to-r from-primary to-secondary">
                <CheckCircle className="mr-2" size={18} />
                标记完成
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {mdxSource ? (
            <div className="prose prose-slate max-w-none
              [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground
              [&_p]:text-foreground/90 [&_li]:text-foreground/90
              [&_strong]:text-foreground [&_a]:text-primary [&_a]:hover:text-primary/80
              [&_blockquote]:bg-primary/5 [&_blockquote]:border-primary/40
              [&_hr]:border-border
              [&_code]:bg-primary/8 [&_code]:text-primary/90
            ">
              <MDXErrorBoundary onError={(err) => setError(`渲染错误: ${err.message}`)}>
                <MDXRemote {...mdxSource} components={mdxComponents} />
              </MDXErrorBoundary>
            </div>
          ) : null}
        </div>

        {/* Footer CTA */}
        <div className="mx-auto max-w-3xl px-6 pb-8">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="text-primary-foreground" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  {tutorialProgress?.completed ? "想要学习更多？" : "完成本技能！"}
                </h3>
                <p className="text-muted-foreground">
                  {tutorialProgress?.completed
                    ? "继续探索课程中的其他技能，提升你的能力。"
                    : "完成上面的步骤，然后点击\"标记完成\"按钮。"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
