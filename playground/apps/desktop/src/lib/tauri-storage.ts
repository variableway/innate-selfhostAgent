/**
 * Tauri Storage Adapter for Zustand Persist
 *
 * Uses @tauri-apps/plugin-store when running in Tauri desktop app,
 * falls back to localStorage in browser/web mode.
 */

import { type StateStorage } from "zustand/middleware";

async function getTauriStore() {
  if (typeof window === "undefined") return null;
  if (!("__TAURI_INTERNALS__" in window)) return null;
  const mod = await import("@tauri-apps/plugin-store");
  // In @tauri-apps/plugin-store v2 the Store constructor is private;
  // use the static `Store.load(path)` or the top-level `load(path)` helper.
  if (typeof (mod as any).Store?.load === "function") {
    return (mod as any).Store.load("innate-playground-store.bin");
  }
  if (typeof (mod as any).load === "function") {
    return (mod as any).load("innate-playground-store.bin");
  }
  return null;
}

export const tauriStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const store = await getTauriStore();
      if (store) {
        const value = await store.get<string>(name);
        return value ?? null;
      }
    } catch {
      // fallback
    }
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(name);
    }
    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const store = await getTauriStore();
      if (store) {
        await store.set(name, value);
        await store.save();
        return;
      }
    } catch {
      // fallback
    }
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const store = await getTauriStore();
      if (store) {
        await store.delete(name);
        await store.save();
        return;
      }
    } catch {
      // fallback
    }
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};
