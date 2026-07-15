"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  Bot,
  LayoutGrid,
  Settings,
  ChevronUp,
  ChevronRight,
  FileText,
  Shield,
  FolderKanban,
  GraduationCap,
  BookMarked,
  Layout,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useSidebar,
} from "@innate/ui";

const adminItems = [
  { title: "Workspace", href: "/admin/workspace", icon: FolderKanban },
  { title: "系列中心", href: "/admin/series", icon: GraduationCap },
  { title: "设置", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [platform, setPlatform] = useState("detecting...");
  const { discoveredTutorials, discoveredSeries, scanContent } = useAppStore();
  const currentSeriesId = pathname === "/series/detail" ? searchParams.get("id") : null;
  const { isMobile, setOpenMobile } = useSidebar();

  // Track which courses are expanded
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});
  // Track which sidebar groups are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    scanContent();
  }, [scanContent]);

  // Auto-expand course that contains the current tutorial
  useEffect(() => {
    const currentSlug = pathname.startsWith("/tutorial/") ? pathname.split("/tutorial/")[1] : null;
    if (currentSlug) {
      const course = discoveredSeries.find((c) =>
        c.tutorials?.some((cs) => cs.slug === currentSlug)
      );
      if (course) {
        setExpandedSeries((prev) => ({ ...prev, [course.id]: true }));
      }
    }
  }, [pathname, discoveredSeries]);

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Courses with tutorials
  const coursesWithTutorials = discoveredSeries
    .filter((c) => c.tutorials && c.tutorials.length > 0)
    .map((c) => ({
      ...c,
      resolvedTutorials: c.tutorials!
        .sort((a, b) => a.order - b.order)
        .map((cs) => discoveredTutorials.find((s) => s.slug === cs.slug))
        .filter((s): s is NonNullable<typeof s> => !!s),
    }))
    .filter((c) => c.resolvedTutorials.length > 0);

  // Tutorials not in any course
  const allCourseSlugs = new Set(
    discoveredSeries.flatMap((c) => c.tutorials?.map((cs) => cs.slug) || [])
  );
  const ungroupedTutorials = discoveredTutorials.filter((s) => !allCourseSlugs.has(s.slug));

  useEffect(() => {
    if ("__TAURI_INTERNALS__" in window) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke<string>("get_platform").then(setPlatform).catch(() => setPlatform("unknown"));
      });
    } else {
      setPlatform("web");
    }
  }, []);

  const platformIcon =
    platform.includes("macos") ? "🍎" :
    platform.includes("windows") ? "🪟" :
    platform.includes("linux") ? "🐧" : "🌐";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => router.push("/")}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Innate</span>
                <span className="text-xs text-muted-foreground">Playground</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setOpenMobile(false)}
            className="absolute right-2 top-2 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label="关闭侧边栏"
          >
            <X className="size-5" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("nav")}
          >
            导航
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["nav"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["nav"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="首页"
                  onClick={() => router.push("/")}
                >
                  <LayoutGrid className="size-4" />
                  <span>首页</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/tutorials"}
                  tooltip="教程中心"
                  onClick={() => router.push("/tutorials")}
                >
                  <BookMarked className="size-4" />
                  <span>教程中心</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/learn"}
                  tooltip="学习工作台"
                  onClick={() => router.push("/learn")}
                >
                  <Layout className="size-4" />
                  <span>学习工作台</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Courses as collapsible first-level items */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("series")}
          >
            系列
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["series"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["series"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              {coursesWithTutorials.map((course) => (
                <Collapsible
                  key={course.id}
                  open={expandedSeries[course.id] ?? false}
                  onOpenChange={() => toggleSeries(course.id)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={course.title}
                        isActive={currentSeriesId === course.id}
                      >
                        <span className="text-sm">{course.icon || "📘"}</span>
                        <span>{course.title}</span>
                        <ChevronRight className={`ml-auto size-4 transition-transform duration-200 ${
                          expandedSeries[course.id] ? "rotate-90" : ""
                        }`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-primary/15 pl-3">
                        {course.resolvedTutorials.map((tutorial, idx) => (
                          <li key={tutorial.slug}>
                            <button
                              onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors ${
                                pathname === `/tutorial/${tutorial.slug}`
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                              }`}
                            >
                              <span className="size-4 flex items-center justify-center text-[10px] text-muted-foreground/60 font-mono shrink-0">{idx + 1}</span>
                              <span className="truncate">{tutorial.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {/* Ungrouped tutorials */}
              {ungroupedTutorials.map((tutorial) => (
                <SidebarMenuItem key={tutorial.slug}>
                  <SidebarMenuButton
                    isActive={pathname === `/tutorial/${tutorial.slug}`}
                    tooltip={tutorial.title}
                    onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                  >
                    <FileText className="size-4" />
                    <span>{tutorial.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Admin / 管理 (bottom position) */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("admin")}
          >
            <Shield className="size-3 mr-1 inline" />
            管理
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["admin"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["admin"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <span className="text-sm">{platformIcon}</span>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm">{platform}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
