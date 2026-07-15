"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
} from "@innate/ui";
import {
  FolderOpen,
  FileText,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle,
  Circle,
  Play,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { discoveredSeries, discoveredTutorials, progress, scanContent, getSeriesForTutorial } = useAppStore();

  useEffect(() => {
    setMounted(true);
    // The home page never triggers a scan by default, so the
    // "推荐系列" section is empty unless another page happened to
    // scan first. Trigger one here so the Hermes course (and any
    // user-created courses) appear on first visit.
    scanContent();
  }, [scanContent]);

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="relative px-8 pt-20 pb-10 space-y-6">
            <div className="h-8 w-32 rounded-full bg-muted/60 animate-pulse" />
            <div className="space-y-2">
              <div className="h-12 w-64 bg-muted/60 animate-pulse rounded-lg" />
              <div className="h-12 w-96 bg-muted/60 animate-pulse rounded-lg" />
            </div>
            <div className="h-6 w-[500px] bg-muted/60 animate-pulse rounded-lg" />
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 px-5 py-3 bg-card/50 border rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-muted/60 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-6 w-12 bg-muted/60 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-card/50 border rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-muted/60 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-6 w-12 bg-muted/60 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-card/50 border rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-muted/60 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-6 w-12 bg-muted/60 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 pt-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted/60 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-6 w-24 bg-muted/60 animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
              <div className="h-9 w-20 bg-muted/60 animate-pulse rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-muted/60 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-16 bg-muted/60 animate-pulse rounded-full" />
                      <div className="h-5 w-full bg-muted/60 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-full bg-muted/60 animate-pulse rounded" />
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-20 bg-muted/60 animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted/60 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const recentTutorials = discoveredTutorials.slice(0, 6);

  const completedTutorials = discoveredTutorials.filter((t) => progress[t.slug]?.completed);
  const totalStudyMinutes = completedTutorials.reduce((sum, t) => sum + (t.duration || 0), 0);
  let studyTimeValue: string;
  if (totalStudyMinutes === 0) {
    studyTimeValue = "0 分钟";
  } else if (totalStudyMinutes < 60) {
    studyTimeValue = `${totalStudyMinutes} 分钟`;
  } else {
    const hours = Math.floor(totalStudyMinutes / 60);
    const mins = totalStudyMinutes % 60;
    studyTimeValue = mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  }

  const stats = [
    { label: "教程总数", value: discoveredTutorials.length, icon: FileText },
    { label: "系列", value: discoveredSeries.length, icon: FolderOpen },
    { label: "学习时长", value: studyTimeValue, icon: Clock },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "intermediate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "advanced":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "入门";
      case "intermediate":
        return "进阶";
      case "advanced":
        return "高级";
      default:
        return "入门";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative px-8 pt-20 pb-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Sparkles className="text-primary" size={16} />
              <span className="text-sm text-primary font-medium">交互式学习平台</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              可执行
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}
                教程
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              边学边做，让技术学习变得简单有趣。每个教程都包含可执行的命令，
              点击运行即可在终端中看到实时结果。
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 px-5 py-3 bg-card/50 backdrop-blur-sm border rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <stat.icon className="text-primary-foreground" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-2 space-y-10">
        {/* Featured Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">推荐系列</h2>
                <p className="text-sm text-muted-foreground">精选学习路径</p>
              </div>
            </div>
            <Button variant="ghost" className="group" onClick={() => router.push("/series")}>
              查看全部
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </div>

          {discoveredSeries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {discoveredSeries.map((c) => {
              const seriesTutorialSlugs = (c.tutorials ?? []).map((st) => st.slug);
              const seriesTutorials = seriesTutorialSlugs
                .map((slug) => discoveredTutorials.find((t) => t.slug === slug))
                .filter((t): t is NonNullable<typeof t> => !!t);
              const totalDuration = seriesTutorials.reduce((sum, t) => sum + t.duration, 0);
              const completedCount = seriesTutorials.filter((t) => progress[t.slug]?.completed).length;
              const progressPercent = seriesTutorials.length > 0 ? (completedCount / seriesTutorials.length) * 100 : 0;

              return (
                <Card
                  key={c.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 active:scale-[0.98]"
                  onClick={() => router.push(`/series/detail?id=${c.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${c.color}20 0%, ${c.color}40 100%)`,
                        }}
                      >
                        {c.icon || "📚"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs">
                          {seriesTutorials.length} 教程
                        </Badge>
                        <CardTitle className="text-base mt-1 whitespace-normal break-words [overflow-wrap:anywhere]">{c.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{seriesTutorials.length} 个教程</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{totalDuration} 分钟</span>
                      </div>
                    </div>
                    {progressPercent > 0 && (
                      <div className="mt-3">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-b from-card/50 to-card rounded-2xl border border-dashed border-border/60">
              <div className="animate-float">
                <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">暂无系列</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">开始创建你的第一个学习系列吧</p>
              <Button variant="link" onClick={() => router.push("/admin/series")}>
                创建系列
              </Button>
            </div>
          )}
        </section>

        {/* Recent Tutorials */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  最近教程
                </h2>
                <p className="text-sm text-muted-foreground">
                  最新发布的内容
                </p>
              </div>
            </div>
            <Button variant="ghost" className="group" onClick={() => router.push("/tutorials")}>
              查看全部
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </div>

          {recentTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentTutorials.map((tutorial) => {
                const isCompleted = progress[tutorial.slug]?.completed;
                return (
                  <Card
                    key={tutorial.slug}
                    className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 active:scale-[0.98]"
                    onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                              {getDifficultyText(tutorial.difficulty)}
                            </Badge>
                            {isCompleted && (
                              <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                已完成
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {tutorial.title}
                          </CardTitle>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}
                        >
                          {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {tutorial.description}
                      </p>
                      {(() => {
                        const seriesList = getSeriesForTutorial(tutorial.slug);
                        const seriesInfo = Array.isArray(seriesList) ? seriesList[0] : seriesList;
                        return seriesInfo ? (
                          <div className="flex items-center gap-1 text-xs text-primary/70 mt-1 mb-2">
                            <FolderOpen size={12} />
                            <span>{seriesInfo.title}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{tutorial.duration} 分钟</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-gradient-to-r from-primary to-secondary"
                          }`}
                        >
                          <Play className="w-3 h-3 mr-1 fill-current" />
                          {isCompleted ? "复习" : "开始"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-b from-card/50 to-card rounded-2xl border border-dashed border-border/60">
              <div className="animate-float">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">暂无教程</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">浏览教程中心，开始你的学习之旅</p>
              <Button variant="link" onClick={() => router.push("/tutorials")}>
                浏览教程中心
              </Button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl" />
          <div className="relative p-6 rounded-2xl border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">快速操作</h2>
                <p className="text-sm text-muted-foreground">扩展你的学习内容</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => router.push("/admin/workspace")}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-3">
                  <FolderOpen className="text-primary" size={24} />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">添加本地目录</span>
                  <span className="text-sm text-muted-foreground">导入本地教程文件夹</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => router.push("/admin/series")}>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mr-3">
                  <Plus className="text-secondary" size={24} />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">管理系列</span>
                  <span className="text-sm text-muted-foreground">创建和管理系列与教程</span>
                </div>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
