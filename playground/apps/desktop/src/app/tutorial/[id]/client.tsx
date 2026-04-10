"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Separator,
  ScrollArea,
} from "@innate/ui";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Terminal,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface TutorialDetailClientProps {
  id: string;
}

export default function TutorialDetailClient({ id }: TutorialDetailClientProps) {
  const router = useRouter();
  const tutorialId = id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    tutorials,
    executeCommandInTerminal,
    updateProgress,
    progress,
  } = useAppStore();

  const tutorial = tutorials.find((t) => t.id === tutorialId);
  const tutorialProgress = progress[tutorialId];

  if (!tutorial) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">教程不存在</div>
      </div>
    );
  }

  const handleRun = (code: string, id: string) => {
    executeCommandInTerminal(code);
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkComplete = () => {
    updateProgress({
      tutorialId,
      completed: true,
      completedSections: [],
      completedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    updateProgress({
      tutorialId,
      completed: false,
      completedSections: [],
    });
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "intermediate":
        return { text: "进阶", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "advanced":
        return { text: "高级", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      default:
        return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
  };

  const difficulty = getDifficultyConfig(tutorial.difficulty);

  const sections = [
    {
      type: "text" as const,
      content: `## 什么是 ${tutorial.title}？\n\n这是一个关于 ${tutorial.title} 的教程。在这里，你将学习如何使用相关工具，并通过实际操作来掌握核心概念。本教程适合${difficulty.text}水平的用户。`,
    },
    {
      type: "text" as const,
      content: "## 前置条件\n\n在开始之前，请确保你已经：\n- 安装了终端工具\n- 具备基本的命令行知识\n- 有稳定的网络连接",
    },
    {
      type: "executable" as const,
      id: "step-1",
      title: "安装",
      description: "执行以下命令进行安装：",
      code: "brew install node",
      language: "bash",
    },
    {
      type: "text" as const,
      content: "安装完成后，你可以通过运行 `node -v` 来验证安装是否成功。如果看到版本号输出，说明安装成功。",
    },
    {
      type: "executable" as const,
      id: "step-2",
      title: "验证安装",
      description: "验证 Node.js 和 npm 是否正确安装：",
      code: "node -v && npm -v",
      language: "bash",
    },
    {
      type: "text" as const,
      content: "## 总结\n\n恭喜！你已经完成了本教程的学习。现在你可以开始使用这个工具了。建议继续学习系列中的其他教程，以获得更全面的知识。",
    },
  ];

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
                {tutorial.duration} 分钟
              </span>
              {tutorialProgress?.completed && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
            <p className="text-muted-foreground text-lg">{tutorial.description}</p>
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
              <Button
                onClick={handleMarkComplete}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <CheckCircle className="mr-2" size={18} />
                标记完成
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-4xl">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              {section.type === "text" ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div
                    className="text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: section.content
                        .replace(/## (.*)/, '<h2 class="text-2xl font-bold text-foreground mb-4 mt-8">$1</h2>')
                        .replace(/- (.*)/g, '<li class="ml-4 mb-2">$1</li>')
                        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-primary text-sm">$1</code>'),
                    }}
                  />
                </div>
              ) : section.type === "executable" ? (
                <Card>
                  <div className="flex items-center justify-between px-5 py-4 bg-muted/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Terminal className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{(section as any).title}</h3>
                        <p className="text-sm text-muted-foreground">{(section as any).description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy((section as any).code, (section as any).id)}
                      >
                        {copiedId === (section as any).id ? (
                          <Check className="text-emerald-500" size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRun((section as any).code, (section as any).id)}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        <Play className="mr-2 fill-current" size={16} />
                        运行
                      </Button>
                    </div>
                  </div>
                  <div className="p-5 bg-black/50">
                    <pre className="font-mono text-sm text-foreground overflow-x-auto">
                      <code>{(section as any).code}</code>
                    </pre>
                  </div>
                </Card>
              ) : null}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="text-primary-foreground" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                {tutorialProgress?.completed ? "想要学习更多？" : "完成本教程！"}
              </h3>
              <p className="text-muted-foreground">
                {tutorialProgress?.completed
                  ? "继续探索系列中的其他教程，提升你的技能。"
                  : "完成上面的步骤，然后点击\"标记完成\"按钮。"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
