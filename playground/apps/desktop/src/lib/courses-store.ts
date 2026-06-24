/**
 * Courses Store — the runtime data layer for course (series) metadata.
 *
 * Why a data layer and not source code:
 *   The app needs to run as both a **website** (browser) and a **desktop**
 *   build (Tauri). Course metadata (id, title, description, tutorial list
 *   in order) is data, not code — so it should live in a data store that
 *   both versions read from, not be hardcoded into the manifest generator
 *   or any TS file.
 *
 * How it works:
 *   1. On first load, the store seeds itself from `data/seed-courses.json`
 *      (bundled with the app at build time).
 *   2. After that, the data is persisted via Zustand's `persist` middleware
 *      using `tauriStorage`, which writes to:
 *        - localStorage  in the **web** build
 *        - Tauri Store   in the **desktop** build
 *      (see `src/lib/tauri-storage.ts`)
 *   3. User edits through the admin UI go to this store, which writes back
 *      to the local data store. The seed JSON is never read again after
 *      first load.
 *
 * The Hermes course (the onboarding series) is the one seed entry today —
 * see data/seed-courses.json. To add another seed course, append to that
 * file; existing users keep their local data (so the new course only
 * shows up after `resetToSeed()` or a manual import).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { tauriStorage } from "./tauri-storage";
import type { SeriesFile } from "./tutorial-scanner";
import seedCoursesRaw from "@/data/seed-courses.json";

// Coerce the JSON import into the typed shape. We trust the bundled file
// at build time, so a single cast is enough.
const SEED_COURSES = seedCoursesRaw as unknown as SeriesFile[];

interface CoursesState {
  courses: SeriesFile[];
  /** True after the first load has happened (used to gate async side-effects). */
  hydrated: boolean;

  /** Mark the store as hydrated from the local data store. */
  setHydrated: (v: boolean) => void;

  /**
   * Seed the store from the bundled JSON on first run.
   * Safe to call multiple times — does nothing if courses already exist.
   */
  ensureSeeded: () => void;

  /** Wipe the local data store and re-seed from the bundled JSON. */
  resetToSeed: () => void;

  /** Append a new course. Returns the assigned id. */
  addCourse: (course: SeriesFile) => string;

  /** Replace the course with the same id. No-op if id not found. */
  updateCourse: (id: string, patch: Partial<SeriesFile>) => void;

  /** Remove the course with this id. */
  removeCourse: (id: string) => void;

  /** Add a tutorial to a course (de-duplicated by slug). */
  addTutorialToCourse: (
    courseId: string,
    slug: string,
    order: number
  ) => void;

  /** Remove a tutorial from a course. */
  removeTutorialFromCourse: (courseId: string, slug: string) => void;

  /** Reorder tutorials in a course. */
  reorderCourseTutorials: (courseId: string, slugs: string[]) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: [],
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      ensureSeeded: () => {
        if (get().courses.length > 0) return;
        set({ courses: SEED_COURSES.map((c) => ({ ...c })) });
      },

      resetToSeed: () => set({ courses: SEED_COURSES.map((c) => ({ ...c })) }),

      addCourse: (course) => {
        const id = course.id || `course-${Date.now()}`;
        const stamped: SeriesFile = { ...course, id, source: "local" };
        set((s) => ({ courses: [...s.courses, stamped] }));
        return id;
      },

      updateCourse: (id, patch) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === id ? { ...c, ...patch, id } : c
          ),
        })),

      removeCourse: (id) =>
        set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),

      addTutorialToCourse: (courseId, slug, order) =>
        set((s) => ({
          courses: s.courses.map((c) => {
            if (c.id !== courseId) return c;
            const tutorials = c.tutorials ? [...c.tutorials] : [];
            if (!tutorials.find((t) => t.slug === slug)) {
              tutorials.push({ slug, order });
              tutorials.sort((a, b) => a.order - b.order);
            }
            return { ...c, tutorials };
          }),
        })),

      removeTutorialFromCourse: (courseId, slug) =>
        set((s) => ({
          courses: s.courses.map((c) => {
            if (c.id !== courseId) return c;
            const tutorials = (c.tutorials || []).filter(
              (t) => t.slug !== slug
            );
            return { ...c, tutorials };
          }),
        })),

      reorderCourseTutorials: (courseId, slugs) =>
        set((s) => ({
          courses: s.courses.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              tutorials: slugs.map((slug, i) => ({ slug, order: i + 1 })),
            };
          }),
        })),
    }),
    {
      // Persist via the existing Tauri-aware storage (localStorage in
      // browser, Tauri Store in desktop).
      name: "innate-courses-v1",
      storage: createJSONStorage(() => tauriStorage),
      // Only persist the data, not the transient `hydrated` flag.
      partialize: (state) => ({ courses: state.courses }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          // If the local data store is empty (first ever run), seed it.
          state.ensureSeeded();
        }
      },
    }
  )
);

/**
 * Convenience helper for SSR / one-shot reads outside React.
 * Returns the current courses array synchronously.
 */
export function getCoursesSnapshot(): SeriesFile[] {
  return useCoursesStore.getState().courses;
}
