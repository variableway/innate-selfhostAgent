# Tutorial Locations

There are three separate "tutorial" stores in this app, and they live in
totally different places. Understanding the split is essential before
you start adding or removing content.

| | **Built-in tutorials** | **User tutorials (workspace)** | **Course (series) metadata** |
|---|---|---|---|
| **Source of truth** | Files inside the app repo (`public/tutorials/`) | Files inside the user's chosen workspace folder on disk | A runtime data store (seeded from `data/seed-courses.json`) |
| **Who edits them** | Developers, via git | End users, via the admin UI or by editing files directly | The app (seeds on first run, then user edits via the admin UI) |
| **Default state** | Four onboarding tutorials in `public/tutorials/` | Empty until the user creates a workspace | The Hermes getting-started course |
| **Survives reinstall** | Yes (baked into the app) | Yes (lives outside the app, in the user's filesystem) | Yes (persisted to localStorage / Tauri Store) |
| **Override priority** | Lowest | **Highest** — workspace wins on slug collision | Middle — merged in after built-ins, before the workspace |

> **Folder name and manifest name are configurable.** See
> `src/lib/tutorial-config.ts` and the `NEXT_PUBLIC_TUTORIALS_DIR` /
> `NEXT_PUBLIC_TUTORIALS_MANIFEST` env vars. The rest of this doc uses
> the defaults: `tutorials/` and `tutorials-manifest.json`.

---

## 1. Built-in tutorials (the app's defaults)

These are the tutorials shipped with the app itself. They are static
assets served as part of the Next.js frontend.

### Filesystem

```
playground/apps/desktop/
├── public/
│   ├── tutorials/                   # ← drop .mdx / .md files here
│   │   └── *.mdx
│   └── tutorials-manifest.json      # ← auto-generated index, do not hand-edit
├── scripts/
│   └── generate-tutorials-manifest.mjs   # ← regenerates the manifest
└── src/lib/
    ├── tutorial-config.ts           # ← folder & manifest names (configurable)
    └── tutorial-scanner.ts          # ← reads the manifest at runtime
```

### Format

Each file is an MDX/Markdown file with YAML frontmatter:

```mdx
---
title: "My Tutorial"
description: "What this tutorial teaches"
difficulty: beginner        # beginner | intermediate | advanced
duration: 10                # minutes
category: general
tags: ["tag1", "tag2"]
---

# Heading

Markdown / MDX body here…

```bash {executable}
echo "this block has a Run button"
```

Code blocks tagged with `{executable}` get a **Run** button that pipes
the lines to the in-app terminal (Tauri only — the web build just
displays the code). See `src/components/tutorial/runnable-code-block.tsx`.
```

The file's basename (without `.mdx` / `.md`) becomes its `slug` — e.g.
`hello-world.mdx` is exposed as slug `hello-world`.

### Adding / removing built-in tutorials

```bash
# 1. drop your .mdx file in
playground/apps/desktop/public/tutorials/

# 2. regenerate the manifest
cd playground/apps/desktop
node scripts/generate-tutorials-manifest.mjs

# 3. (dev only) hard-refresh the app — Ctrl+Shift+R
#    The scanner caches the manifest in memory.
```

To remove a tutorial, delete its `.mdx` file and rerun the manifest
generator. The scanner at `src/lib/tutorial-scanner.ts` will then
return a shorter `tutorials` array on next load.

### How the app reads them

`loadManifest()` in `src/lib/tutorial-scanner.ts` fetches
`/<TUTORIALS_DIR_NAME>-manifest.json` (relative to the app's base
path) and caches it in a module-level variable. Both the desktop
Tauri window and a plain `localhost:5001` browser tab read from the
same manifest.

---

## 2. Course (series) metadata — the data layer

Course metadata (id, title, description, ordered list of tutorial
slugs) is **data, not code**. It must be the same shape on the
website build and the desktop build, so it lives in a data store
that both versions read from — not in the manifest, not in any TS
file, and not in `public/`.

### Why a data layer (not source code)

- The app ships as both a **website** (Next.js static / SSR) and a
  **desktop** build (Tauri). Course metadata should be editable at
  runtime, not just at build time.
- The seed content (the Hermes onboarding course) is bundled with
  the app, but user-created courses are written to the same store at
  runtime.
- Future migration to SQLite is a drop-in: swap the `tauriStorage`
  adapter for an SQLite-backed one and the rest of the code is
  unchanged.

### Filesystem

```
playground/apps/desktop/
├── src/
│   ├── data/
│   │   ├── seed-courses.json        # ← bundled seed (Hermes course today)
│   │   └── seed-courses.d.ts        # ← intellisense for the JSON
│   └── lib/
│       ├── courses-store.ts         # ← Zustand store, persists via tauriStorage
│       └── tauri-storage.ts         # ← localStorage (web) / Tauri Store (desktop)
```

### How it works

1. On first load, `useCoursesStore` rehydrates from the local data
   store (`tauriStorage`, which is `localStorage` in the browser and
   the Tauri Store in the desktop build). The persist key is
   `innate-courses-v1`.
2. If the local store is empty, `onRehydrateStorage → ensureSeeded()`
   copies the bundled `data/seed-courses.json` into it.
3. From that point on, the local store is the source of truth. The
   seed JSON is only re-read if the user clicks **Reset to seed** in
   the admin UI.
4. `useAppStore.scanContent()` reads from `useCoursesStore` and
   merges the results into `discoveredSeries` — see Section 4 below.

### Format

A `seed-courses.json` entry matches `SeriesFile` from
`src/lib/tutorial-scanner.ts`:

```json
[
  {
    "id": "hermes-getting-started",
    "title": "Hermes 入门:从零搭建你的开发环境",
    "description": "...",
    "icon": "🚀",
    "color": "#10b981",
    "source": "seed",
    "tutorials": [
      { "slug": "00-install-fnm",    "order": 1 },
      { "slug": "01-install-nodejs", "order": 2 },
      { "slug": "02-install-git",    "order": 3 },
      { "slug": "03-hello-world",    "order": 4 }
    ]
  }
]
```

### Editing courses

- **Admin UI** at `/admin/courses` (or `/admin/series` in older
  builds) — create / edit / delete courses and add / remove /
  reorder their tutorials. Writes go straight to the data store.
- **Programmatic** — `useCoursesStore` exposes `addCourse`,
  `updateCourse`, `removeCourse`, `addTutorialToCourse`,
  `removeTutorialFromCourse`, `reorderCourseTutorials`.
- **Reset to seed** — call `useCoursesStore.getState().resetToSeed()`
  (or click the button in the admin UI) to wipe local edits and
  re-copy from `data/seed-courses.json`.

---

## 3. User tutorials (workspace)

These are the tutorials the end user creates, imports, or edits
through the app. They live in a folder the user picks when they
create a workspace. The app never moves or renames that folder — it
just reads and writes inside it.

### Workspace location

The workspace path is **chosen by the user** through the admin UI at
`/admin/workspace` → "新建工作区" (New workspace). Common picks:

| OS | Typical path |
|---|---|
| Windows | `C:\Users\<name>\Documents\InnatePlayground` or similar |
| macOS   | `/Users/<name>/Documents/InnatePlayground` |
| Linux   | `/home/<name>/InnatePlayground` |

A list of registered workspaces is persisted in the Tauri store under
the key `innate-playground-storage-v2` (see `src/store/useAppStore.ts`).
One of them is flagged as the **default** workspace
(`defaultWorkspaceId`).

### Folder layout inside a workspace

When a user creates a new workspace, the app creates this skeleton:

```
<workspace>/
├── tutorials/       # ← primary location for user tutorials
├── lessons/         # ← alternative location (older convention)
├── KM/              # knowledge-base content
└── Apps/            # app-related content
```

> Note: workspace-level series/course JSON files (`<workspace>/courses/`,
> `<workspace>/_courses.json`) were retired in favor of the data layer
> (Section 2). Series are now stored in the app's data store, not on
> the workspace filesystem.

The scanned subdirectories are defined in
`src/lib/tutorial-config.ts`:

```ts
export const TUTORIAL_SCAN_SUBDIRS = ["tutorials", "lessons", "KM", "Apps"];
```

### Where each piece of content lives

| Content type | Folder | File name pattern |
|---|---|---|
| Tutorial (created via admin UI) | `<workspace>/tutorials/` | `<slug>.md` |
| Tutorial (legacy import) | `<workspace>/lessons/` | `<slug>.md` or `<slug>.mdx` |
| Knowledge-base entry | `<workspace>/KM/` | `<slug>.md(x)` |
| App-related content | `<workspace>/Apps/` | `<slug>.md(x)` |

### How the app reads them

`scanWorkspace()` in `src/lib/tutorial-scanner.ts` walks the
workspace tree to depth 3, looking for `.md` / `.mdx` files in
`tutorials/`, `lessons/`, `KM/`, `Apps/`, and the workspace root. It
parses each file's frontmatter and emits a `TutorialFile` record.

### How the app writes them

From `src/lib/tutorial-scanner.ts`:

- `saveTutorialToWorkspace()` — writes
  `${workspacePath}/tutorials/${slug}.md` with the new content.
- `deleteTutorialFromWorkspace()` — removes
  `tutorials/`, `lessons/`, and the workspace root for a given slug.

(Per-series workspace writes were removed when series moved to the
data layer; see Section 2.)

### Editing user tutorials

Three equivalent ways, all writing to the same files:

1. **Admin UI** at `/admin/tutorials` — create / edit / delete
   tutorials through forms.
2. **Tutorial editor** at `/tutorial/edit` — edit a single tutorial's
   frontmatter and body.
3. **Direct file edit** — open `<workspace>/tutorials/<slug>.md` in
   any editor. The Tauri webview reads it on every visit, so changes
   appear on next reload.

---

## 4. How the three sources merge

In `src/store/useAppStore.ts`, `scanContent()` calls `scanBuiltin()`
(built-in tutorials), `useCoursesStore` (course metadata from the
data layer), and `scanWorkspace()` (user tutorials), and merges the
results:

```ts
// Workspace tutorials override built-ins with the same slug
const slugSet = new Set(workspace.tutorials.map((s) => s.slug));
const mergedTutorials = [
  ...workspace.tutorials,
  ...builtin.tutorials.filter((s) => !slugSet.has(s.slug)),
];

// Course metadata comes from the data layer.
// Workspace wins on id collision (so a user can shadow a seeded
// course by re-saving it in the workspace).
const coursesFromStore = useCoursesStore.getState().courses;
const seriesIdSet = new Set(workspace.series.map((c) => c.id));
const mergedSeries = [
  ...workspace.series,
  ...coursesFromStore.filter((c) => !seriesIdSet.has(c.id)),
];
```

So a tutorial with the same `slug` in both built-in and workspace
stores shows up as the **workspace** version. A course with the same
`id` in both data store and workspace shows up as the **workspace**
version. This is the mechanism that lets a user override or "shadow"
shipped content without editing the app or the data layer.

---

## 5. Quick reference

```
Repo (read-only, ships with the app)   Data store (runtime)         User filesystem (editable)
─────────────────────────────────────  ───────────────────────────  ─────────────────────────
public/tutorials/                      src/lib/courses-store.ts     <workspace>/tutorials/
  └─ *.mdx         ← built-in tutorials  └─ useCoursesStore           └─ *.md    ← user tutorials
public/                                data/seed-courses.json      <workspace>/lessons/
tutorials-manifest.json                  └─ seed courses             └─ *.md(x) ← legacy
                                        src/data/seed-courses.d.ts <workspace>/KM/
                                        src/lib/tauri-storage.ts    <workspace>/Apps/
                                          └─ localStorage / Tauri
                                             Store key
                                             "innate-courses-v1"
```

The **built-in** side is rebuilt from git and the manifest script;
the **workspace** side is owned by the end user; and the **course
data store** is owned by the app and survives across sessions.
