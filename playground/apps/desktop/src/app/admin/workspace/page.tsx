import { FolderKanban } from "lucide-react";

export default function WorkspacePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FolderKanban className="text-muted-foreground" size={32} />
      </div>
      <h1 className="text-2xl font-bold mb-2">Workspace</h1>
      <p className="text-muted-foreground text-center max-w-md">
        管理你的工作区文件和目录。此功能正在开发中。
      </p>
    </div>
  );
}
