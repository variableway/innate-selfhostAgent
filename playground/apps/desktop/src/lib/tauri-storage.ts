/**
 * Tauri Storage Adapter for Zustand Persist
 *
 * Uses @tauri-apps/plugin-store when running in Tauri desktop app,
 * falls back to localStorage in browser/web mode.
 */

import { type StateStorage } from "zustand/middleware";

async function getTauriStore() {
  if ("__TAURI_INTERNALS__" in window) {
    const { Store } = await import("@tauri-apps/plugin-store");
    return new Store("innate-playground-store.bin");
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
