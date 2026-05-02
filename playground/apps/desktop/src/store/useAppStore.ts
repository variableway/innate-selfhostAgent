import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skill, Course, CourseSkill, Progress, TerminalPosition, TerminalEntry, Workspace, FileNode } from '../types';
import { tauriStorage } from '../lib/tauri-storage';
import { SkillFile, CourseFile, scanBuiltin, scanWorkspace } from '../lib/tutorial-scanner';

interface AppState {
  // Data
  skills: Skill[];
  courses: Course[];
  progress: Record<string, Progress>;

  // UI State
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  // Terminal State
  terminalPosition: TerminalPosition;
  terminalVisible: boolean;
  isExecuting: boolean;
  terminalEntries: TerminalEntry[];
  terminalReady: boolean;
  pendingCommands: string[];

  // Actions
  setSkills: (skills: Skill[]) => void;
  setCourses: (courses: Course[]) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setDifficulty: (difficulty: string | null) => void;

  // Terminal Actions
  showTerminal: () => void;
  hideTerminal: () => void;
  toggleTerminalPosition: () => void;
  setTerminalPosition: (position: TerminalPosition) => void;
  addTerminalEntry: (entry: TerminalEntry) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminal: () => void;
  setIsExecuting: (executing: boolean) => void;
  executeCommandInTerminal: (command: string) => void;
  flushPendingCommands: () => void;
  setTerminalReady: (ready: boolean) => void;
  killRunningCommand: () => void;

  // Progress Actions
  updateProgress: (progress: Progress) => void;

  // Workspace State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  defaultWorkspaceId: string | null;
  fileTree: FileNode[];
  selectedFile: FileNode | null;
  fileContent: string;
  selectedFolderPath: string | null;

  // Workspace Actions
  createWorkspace: (name: string, path: string) => void;
  deleteWorkspace: (id: string) => void;
  setDefaultWorkspace: (id: string | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  setSelectedFile: (file: FileNode | null) => void;
  setFileContent: (content: string) => void;
  setSelectedFolderPath: (path: string | null) => void;

  // Discovered skills/courses (from MDX frontmatter scanning)
  discoveredSkills: SkillFile[];
  discoveredCourses: CourseFile[];
  scanContent: () => Promise<void>;

  // Getters
  getFilteredSkills: () => Skill[];
  getSkillsByCourse: (courseId: string) => SkillFile[];
  getCoursesForSkill: (slug: string) => CourseFile[];
}

// Pre-cached Tauri invoke to avoid dynamic import on every call
let _tauriInvoke: ((cmd: string, args: Record<string, unknown>) => Promise<void>) | null = null;

async function getTauriInvoke() {
  if (_tauriInvoke) return _tauriInvoke;
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  _tauriInvoke = invoke as any;
  return _tauriInvoke;
}

// Pre-warm the invoke cache (safe for SSR)
if (typeof window !== "undefined") {
  getTauriInvoke();
}

async function writeToPty(data: string): Promise<boolean> {
  try {
    const invoke = await getTauriInvoke();
    if (invoke) {
      await invoke("pty_write", { data });
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("web-pty-write", { detail: data }));
    }
    return true;
  } catch (err) {
    console.error("[writeToPty] Failed to send data to terminal:", err);
    return false;
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Initial state
  skills: [],
  courses: [],
  progress: {},

  searchQuery: '',
  selectedCategory: null,
  selectedDifficulty: null,

  terminalPosition: 'hidden',
  terminalVisible: false,
  isExecuting: false,
  terminalEntries: [],
  terminalReady: false,
  pendingCommands: [],

  // Actions
  setSkills: (skills) => set({ skills }),
  setCourses: (courses) => set({ courses }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),

  // Terminal Actions
  showTerminal: () => set({
    terminalVisible: true,
    terminalPosition: 'right'
  }),
  hideTerminal: () => set({
    terminalVisible: false,
    terminalPosition: 'hidden'
  }),
  toggleTerminalPosition: () => set((state) => ({
    terminalPosition: state.terminalPosition === 'right' ? 'bottom' : 'right',
  })),
  setTerminalPosition: (terminalPosition) => set({ terminalPosition }),
  addTerminalEntry: (entry) => set({ terminalEntries: [...get().terminalEntries, entry] }),
  addTerminalOutput: (output) => set({ terminalEntries: [...get().terminalEntries, { type: 'stdout', text: output }] }),
  clearTerminal: () => set({ terminalEntries: [] }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),

  executeCommandInTerminal: (command: string) => {
    const state = get();
    state.showTerminal();

    // If terminal is not ready yet, queue the command
    if (!state.terminalReady) {
      console.log("[executeCommandInTerminal] Terminal not ready, queuing command:", command);
      set({ pendingCommands: [...state.pendingCommands, command] });
      return;
    }

    // CD to workspace first if available, then run the command
    const wsPath = state.currentWorkspace?.path ||
      (state.defaultWorkspaceId
        ? state.workspaces.find((w) => w.id === state.defaultWorkspaceId)?.path
        : undefined);

    const sendCommand = async () => {
      if (wsPath) {
        // Send cd + command with a delay between them
        const cdOk = await writeToPty(`cd "${wsPath}"\r`);
        if (!cdOk) {
          console.error("[executeCommandInTerminal] Failed to send cd command");
          return;
        }
        // Wait for cd to complete, then send the actual command
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
        const cmdOk = await writeToPty(command + "\r");
        if (!cmdOk) {
          console.error("[executeCommandInTerminal] Failed to send command:", command);
        } else {
          console.log("[executeCommandInTerminal] Command sent:", command);
        }
      } else {
        const cmdOk = await writeToPty(command + "\r");
        if (!cmdOk) {
          console.error("[executeCommandInTerminal] Failed to send command:", command);
        } else {
          console.log("[executeCommandInTerminal] Command sent:", command);
        }
      }
    };

    sendCommand();
  },

  flushPendingCommands: () => {
    const state = get();
    const { pendingCommands } = state;
    if (pendingCommands.length === 0) return;

    console.log("[flushPendingCommands] Flushing", pendingCommands.length, "queued command(s)");

    // Clear queue first to avoid recursion
    set({ pendingCommands: [] });

    // Execute each queued command with a staggered delay to avoid race conditions
    pendingCommands.forEach((cmd, index) => {
      setTimeout(() => {
        const freshState = get();
        if (freshState.terminalReady) {
          freshState.executeCommandInTerminal(cmd);
        } else {
          // Re-queue if terminal became unready somehow
          console.warn("[flushPendingCommands] Terminal not ready on flush, re-queuing:", cmd);
          set({ pendingCommands: [...get().pendingCommands, cmd] });
        }
      }, index * 200);
    });
  },

  setTerminalReady: (terminalReady: boolean) => set({ terminalReady }),

  killRunningCommand: () => {
    // Send Ctrl+C to the PTY
    writeToPty("\x03");
  },

  // Progress Actions
  updateProgress: (progress) => set((state) => ({
    progress: {
      ...state.progress,
      [progress.skillId]: progress,
    },
  })),

  // Workspace State
  workspaces: [],
  currentWorkspace: null,
  defaultWorkspaceId: null,
  fileTree: [],
  selectedFile: null,
  fileContent: '',
  selectedFolderPath: null,

  // Workspace Actions
  createWorkspace: (name, path) => {
    const id = `ws-${Date.now()}`;
    const now = new Date().toISOString();
    const workspace: Workspace = { id, name, path, createdAt: now, updatedAt: now };
    set((state) => {
      const isFirst = !state.defaultWorkspaceId;
      return {
        workspaces: [...state.workspaces, workspace],
        ...(isFirst ? { defaultWorkspaceId: id } : {}),
      };
    });
  },
  deleteWorkspace: (id) => set((state) => ({
    workspaces: state.workspaces.filter((w) => w.id !== id),
    currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
    defaultWorkspaceId: state.defaultWorkspaceId === id ? null : state.defaultWorkspaceId,
  })),
  setDefaultWorkspace: (id) => set({ defaultWorkspaceId: id }),
  setCurrentWorkspace: (currentWorkspace) => set({
    currentWorkspace,
    fileTree: [],
    selectedFile: null,
    fileContent: '',
    selectedFolderPath: null,
  }),
  setFileTree: (fileTree) => set({ fileTree }),
  setSelectedFile: (selectedFile) => set({ selectedFile, fileContent: '' }),
  setFileContent: (fileContent) => set({ fileContent }),
  setSelectedFolderPath: (selectedFolderPath) => set({ selectedFolderPath }),

  // Discovered skills/courses
  discoveredSkills: [],
  discoveredCourses: [],
  scanContent: async () => {
    try {
      const builtin = await scanBuiltin();
      const state = get();
      const workspacePath = state.currentWorkspace?.path || state.defaultWorkspaceId
        ? state.workspaces.find((w: Workspace) => w.id === state.defaultWorkspaceId)?.path
        : undefined;

      let workspace = { courses: [] as CourseFile[], skills: [] as SkillFile[] };
      if (workspacePath) {
        workspace = await scanWorkspace(workspacePath);
      }

      // Merge: workspace skills override builtin with same slug
      // Also deduplicate within builtin (same slug can appear in multiple courses)
      const seenSlugs = new Set<string>();
      const dedupedBuiltinSkills = builtin.skills.filter((s) => {
        const key = `${s.slug}::${s.courseId || '__none__'}`;
        if (seenSlugs.has(key)) return false;
        seenSlugs.add(key);
        return true;
      });

      const slugSet = new Set(workspace.skills.map((s) => s.slug));
      const mergedSkills = [...workspace.skills, ...dedupedBuiltinSkills.filter((s) => !slugSet.has(s.slug))];

      // Merge courses: workspace overrides builtin by id
      const courseIdSet = new Set(workspace.courses.map((c) => c.id));
      const mergedCourses = [...workspace.courses, ...builtin.courses.filter((c) => !courseIdSet.has(c.id))];

      set({ discoveredSkills: mergedSkills, discoveredCourses: mergedCourses });
    } catch (e) {
      console.error('[scanContent] failed:', e);
    }
  },

  // Getters
  getFilteredSkills: () => {
    const { skills, searchQuery, selectedCategory, selectedDifficulty } = get();
    return skills.filter((skill) => {
      const matchesSearch = !searchQuery ||
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || skill.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || skill.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  },

  getSkillsByCourse: (courseId: string) => {
    const { discoveredSkills, discoveredCourses } = get();
    const course = discoveredCourses.find((c) => c.id === courseId);
    if (!course?.skills) return [];
    return course.skills
      .sort((a, b) => a.order - b.order)
      .map((cs) => discoveredSkills.find((s) => s.slug === cs.slug))
      .filter((s): s is SkillFile => !!s);
  },

  getCoursesForSkill: (slug: string) => {
    const { discoveredCourses } = get();
    return discoveredCourses.filter(
      (c) => c.skills?.some((cs) => cs.slug === slug)
    );
  },
}),
{
  name: 'innate-playground-storage-v2',
  storage: tauriStorage,
  partialize: (state) => ({
    workspaces: state.workspaces,
    defaultWorkspaceId: state.defaultWorkspaceId,
  }),
}
  )
);
