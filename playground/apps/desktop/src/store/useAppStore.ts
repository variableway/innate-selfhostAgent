import { create } from 'zustand';
import { Tutorial, Series, Progress, TerminalPosition, TerminalEntry } from '../types';
import { tutorials as initialTutorials } from '../data/tutorials';
import { series as initialSeries } from '../data/series';

interface AppState {
  // Data
  tutorials: Tutorial[];
  series: Series[];
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

  // Actions
  setTutorials: (tutorials: Tutorial[]) => void;
  setSeries: (series: Series[]) => void;
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
  killRunningCommand: () => void;

  // Progress Actions
  updateProgress: (progress: Progress) => void;

  // Getters
  getFilteredTutorials: () => Tutorial[];
  getTutorialsBySeries: (seriesId: string) => Tutorial[];
}

const mockTutorials = initialTutorials;
const mockSeries = initialSeries;

async function writeToPty(data: string) {
  if ("__TAURI_INTERNALS__" in window) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("pty_write", { data });
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tutorials: mockTutorials,
  series: mockSeries,
  progress: {},

  searchQuery: '',
  selectedCategory: null,
  selectedDifficulty: null,

  terminalPosition: 'hidden',
  terminalVisible: false,
  isExecuting: false,
  terminalEntries: [],

  // Actions
  setTutorials: (tutorials) => set({ tutorials }),
  setSeries: (series) => set({ series }),
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
    get().showTerminal();
    // Write the command + Enter to the persistent PTY session
    writeToPty(command + "\r");
  },

  killRunningCommand: () => {
    // Send Ctrl+C to the PTY
    writeToPty("\x03");
  },

  // Progress Actions
  updateProgress: (progress) => set((state) => ({
    progress: {
      ...state.progress,
      [progress.tutorialId]: progress,
    },
  })),

  // Getters
  getFilteredTutorials: () => {
    const { tutorials, searchQuery, selectedCategory, selectedDifficulty } = get();
    return tutorials.filter((tutorial) => {
      const matchesSearch = !searchQuery ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || tutorial.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  },

  getTutorialsBySeries: (seriesId: string) => {
    const { tutorials } = get();
    return tutorials
      .filter((t) => t.series === seriesId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },
}));
