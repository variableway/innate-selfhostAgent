"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { FileNode } from "@/types";
import { Button } from "@innate/ui";
import {
  FolderKanban,
  Plus,
  FolderOpen,
  Folder,
  FileText,
  FileCode2,
  File,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DEFAULT_FOLDERS = [
  { name: "skills", description: "技能相关文件" },
  { name: "Apps", description: "应用程序相关文件" },
  { name: "KM", description: "知识库相关文件" },
  { name: "lessons", description: "课程相关文件" },
];

// File tree item with expand/collapse
function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.isDirectory && node.children && node.children.length > 0;

  const icon = node.isDirectory ? (
    expanded ? (
      <FolderOpen size={16} className="text-amber-500 shrink-0" />
    ) : (
      <Folder size={16} className="text-amber-500 shrink-0" />
    )
  ) : node.name.endsWith(".md") || node.name.endsWith(".mdx") ? (
    <FileText size={16} className="text-blue-400 shrink-0" />
  ) : node.name.endsWith(".tsx") || node.name.endsWith(".ts") || node.name.endsWith(".js") ? (
    <FileCode2 size={16} className="text-green-400 shrink-0" />
  ) : (
    <File size={16} className="text-muted-foreground shrink-0" />
  );

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node);
          if (node.isDirectory) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-1.5 py-1 px-2 rounded-md text-sm transition-colors hover:bg-muted ${
          isSelected ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.isDirectory ? (
          expanded ? (
            <ChevronDown size={14} className="shrink-0" />
          ) : (
            <ChevronRight size={14} className="shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {icon}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && hasChildren &&
        node.children!.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

// File content viewer
function FileViewer({ node, content }: { node: FileNode; content: string }) {
  if (!node) return null;

  const isMarkdown = node.name.endsWith(".md") || node.name.endsWith(".mdx");

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 shrink-0">
        <FileText size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium truncate">{node.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {(content.length / 1024).toFixed(1)} KB
        </span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isMarkdown ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

// Empty state for no workspace
function EmptyWorkspaceState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <FolderKanban size={40} className="text-muted-foreground/50" />
      </div>
      <h2 className="text-2xl font-bold mb-2">还没有工作区</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        创建一个工作区来管理你的项目文件和教程资料
      </p>
      <Button onClick={onCreate} className="gap-2">
        <Plus size={18} />
        创建新工作区
      </Button>
    </div>
  );
}

// Create workspace form
function CreateWorkspaceForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (name: string, path: string) => void;
}) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const handleBrowse = async () => {
    if ("__TAURI_INTERNALS__" in window) {
      try {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const selected = await open({ directory: true, multiple: false });
        if (selected) {
          setPath(typeof selected === "string" ? selected : (selected as any).path || String(selected));
        }
      } catch {
        // Fallback: manual input
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && path.trim()) {
      onSubmit(name.trim(), path.trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">创建工作区</h2>
            <p className="text-sm text-muted-foreground">选择本地文件夹作为工作区根目录</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">工作区名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：My AI Learning"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">本地文件夹</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="选择或输入文件夹路径..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <Button type="button" variant="outline" onClick={handleBrowse} className="shrink-0 gap-2">
                <FolderOpen size={16} />
                浏览
              </Button>
            </div>
          </div>
        </div>

        {/* Default folders preview */}
        <div>
          <label className="block text-sm font-medium mb-2">将自动创建以下子文件夹：</label>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_FOLDERS.map((folder) => (
              <div key={folder.name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Folder size={16} className="text-amber-500" />
                <div>
                  <span className="text-sm font-medium">{folder.name}/</span>
                  <p className="text-xs text-muted-foreground">{folder.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || !path.trim()}
            className="flex-1"
          >
            创建工作区
          </Button>
        </div>
      </form>
    </div>
  );
}

// Two-column workspace browser
function WorkspaceBrowser() {
  const {
    currentWorkspace,
    fileTree,
    selectedFile,
    fileContent,
    selectedFolderPath,
    setSelectedFile,
    setFileContent,
    setSelectedFolderPath,
    setCurrentWorkspace,
  } = useAppStore();

  const [loading, setLoading] = useState(false);

  const handleSelectNode = async (node: FileNode) => {
    if (node.isDirectory) {
      setSelectedFolderPath(node.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(node);
      setLoading(true);
      try {
        if ("__TAURI_INTERNALS__" in window) {
          const { readFile } = await import("@tauri-apps/plugin-fs");
          const bytes = await readFile(node.path);
          const text = new TextDecoder().decode(bytes);
          setFileContent(text);
        } else {
          setFileContent(`// File: ${node.name}\n// Content preview not available in web mode`);
        }
      } catch {
        setFileContent(`// Error reading file: ${node.name}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const folderFiles = selectedFolderPath
    ? fileTree.find((n) => n.path === selectedFolderPath)?.children || []
    : [];

  return (
    <div className="h-full flex flex-col">
      {/* Workspace header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWorkspace(null)}
            className="h-8 w-8"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <FolderKanban size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">{currentWorkspace?.name}</h2>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {currentWorkspace?.path}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File tree */}
        <div className="w-64 border-r flex flex-col shrink-0">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
            文件结构
          </div>
          <div className="flex-1 overflow-auto p-1">
            {fileTree.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedFile?.path || selectedFolderPath}
                onSelect={handleSelectNode}
              />
            ))}
          </div>
        </div>

        {/* Right: Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <FileViewer node={selectedFile} content={fileContent} />
            )
          ) : (
            /* Folder contents or welcome */
            <div className="flex-1 overflow-auto p-4">
              {selectedFolderPath && folderFiles.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    {selectedFolderPath.split("/").pop() || selectedFolderPath.split("\\").pop()} 内容
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {folderFiles.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => handleSelectNode(file)}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                      >
                        {file.isDirectory ? (
                          <Folder size={18} className="text-amber-500 shrink-0" />
                        ) : (
                          <FileText size={18} className="text-blue-400 shrink-0" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileText size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">选择左侧文件查看内容</p>
                  <p className="text-xs mt-1 opacity-60">或点击文件夹查看其内容</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main workspace page component
export function WorkspacePage() {
  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    setCurrentWorkspace,
    setFileTree,
  } = useAppStore();

  const [showCreate, setShowCreate] = useState(false);

  // If we have a current workspace, show the browser
  if (currentWorkspace) {
    return (
      <div className="h-full flex">
        <WorkspaceBrowser />
      </div>
    );
  }

  // If creating a new workspace
  if (showCreate) {
    return (
      <div className="h-full flex">
        <CreateWorkspaceForm
          onCancel={() => setShowCreate(false)}
          onSubmit={async (name, path) => {
            createWorkspace(name, path);
            // Find the newly created workspace
            const ws = useAppStore.getState().workspaces.find((w) => w.path === path);
            if (ws) {
              setCurrentWorkspace(ws);
              // Build initial file tree
              await buildFileTree(ws.path);
            }
            setShowCreate(false);
          }}
        />
      </div>
    );
  }

  // If workspaces exist but none selected, show workspace list
  if (workspaces.length > 0) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">我的工作区</h2>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={16} />
            新建工作区
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={async () => {
                setCurrentWorkspace(ws);
                await buildFileTree(ws.path);
              }}
              className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderKanban size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{ws.name}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {ws.path}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                创建于 {new Date(ws.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // No workspaces: show empty state
  return (
    <div className="h-full flex">
      <EmptyWorkspaceState onCreate={() => setShowCreate(true)} />
    </div>
  );
}

// Helper: build file tree from workspace path
async function buildFileTree(rootPath: string) {
  const { setFileTree } = useAppStore.getState();

  if ("__TAURI_INTERNALS__" in window) {
    try {
      const { readDir } = await import("@tauri-apps/plugin-fs");
      const tree = await readNode(rootPath, readDir, 3);
      setFileTree(tree.children || []);
    } catch {
      setFileTree([]);
    }
  } else {
    // Web fallback: mock default folders
    setFileTree(
      DEFAULT_FOLDERS.map((f) => ({
        name: f.name,
        path: `${rootPath}/${f.name}`,
        isDirectory: true,
        children: [],
      }))
    );
  }
}

async function readNode(
  path: string,
  readDir: (dir: string) => Promise<any[]>,
  maxDepth: number,
  depth = 0
): Promise<FileNode> {
  const name = path.split("/").pop() || path.split("\\").pop() || path;

  if (depth >= maxDepth) {
    return { name, path, isDirectory: true, children: [] };
  }

  try {
    const entries = await readDir(path);
    const children: FileNode[] = await Promise.all(
      entries.map(async (entry: any) => {
        const childPath = entry.path || `${path}/${entry.name}`;
        if (entry.isDirectory || entry.children !== undefined) {
          const node = await readNode(childPath, readDir, maxDepth, depth + 1);
          return node;
        }
        return {
          name: entry.name,
          path: childPath,
          isDirectory: false,
          size: entry.size,
          modifiedAt: entry.modifiedAt?.toString(),
        };
      })
    );

    // Sort: directories first, then files
    children.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return { name, path, isDirectory: true, children };
  } catch {
    return { name, path, isDirectory: true, children: [] };
  }
}
