/**
 * Tutorial Scanner
 *
 * Auto-discovers tutorials from public/<tutorials>/ via
 * public/<tutorials-manifest.json>. The folder name and manifest filename
 * are both configurable through `src/lib/tutorial-config.ts` (or the
 * matching NEXT_PUBLIC_* env vars).
 *
 * Run `node scripts/generate-tutorials-manifest.mjs` to regenerate the
 * manifest after adding new .mdx/.md files.
 */

import { SeriesTutorial } from "@/types";
import {
  TUTORIALS_DIR_NAME,
  TUTORIALS_MANIFEST_NAME,
  TUTORIAL_SCAN_SUBDIRS,
  getTutorialsManifestUrl,
  getBuiltinTutorialPath,
  getWorkspaceTutorialsDir,
  getWorkspaceTutorialCandidates,
} from "./tutorial-config";

// ─── Types ───────────────────────────────────────────────

export interface TutorialFile {
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  category: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  source?: string;
  localPath?: string;
}

export interface SeriesFile {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  tutorials?: SeriesTutorial[];
  source?: "seed" | "builtin" | "local";
}

interface ScanResult {
  series: SeriesFile[];
  tutorials: TutorialFile[];
}

interface TutorialsManifest {
  generatedAt: string;
  count: number;
  tutorials: TutorialFile[];
  series?: SeriesFile[];
  // Note: course / series metadata is no longer carried in the manifest.
  // It's loaded at runtime from the courses data layer
  // (src/lib/courses-store.ts + data/seed-courses.json). See that file
  // for the data-shape contract.
}

// ─── Base Path Helper ────────────────────────────────────

function getBasePath(): string {
  if (typeof window !== "undefined") {
    const base = document.querySelector("base");
    if (base?.getAttribute("href")) return base.getAttribute("href")!.replace(/\/$/, "");
  }
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

// ─── Manifest Loader ─────────────────────────────────────

let _cachedManifest: TutorialsManifest | null = null;

async function loadManifest(): Promise<TutorialsManifest> {
  if (_cachedManifest) return _cachedManifest;

  try {
    const response = await fetch(getTutorialsManifestUrl(getBasePath()));
    if (response.ok) {
      const manifest: TutorialsManifest = await response.json();
      _cachedManifest = manifest;
      return manifest;
    }
  } catch {
    // fetch may fail during SSR
  }

  // Fallback: empty manifest
  return { generatedAt: "", count: 0, tutorials: [], series: [] };
}

/** Clear the cached manifest (use after adding/removing tutorials). */
export function clearManifestCache(): void {
  _cachedManifest = null;
}

// ─── Frontmatter Parser ──────────────────────────────────

export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlText = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlText.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let value: unknown = line.slice(idx + 1).trim();
      if (
        typeof value === "string" &&
        ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = value.slice(1, -1);
      }
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          // keep as string
        }
      }
      if (typeof value === "string" && /^-?\d+$/.test(value)) {
        value = parseInt(value, 10);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

// ─── Content Loader ──────────────────────────────────────

export async function loadTutorialContent(
  slug: string,
  workspacePath?: string
): Promise<{ content: string; path: string } | null> {
  // Try workspace first (Tauri only)
  if (workspacePath && "__TAURI_INTERNALS__" in window) {
    try {
      const { readFile } = await import("@tauri-apps/plugin-fs");
      const possiblePaths = getWorkspaceTutorialCandidates(workspacePath, slug);
      for (const p of possiblePaths) {
        try {
          const bytes = await readFile(p);
          const text = new TextDecoder().decode(bytes);
          return { content: text, path: p };
        } catch {
          // try next
        }
      }
    } catch {
      // fallback
    }
  }

  // Try built-in tutorials from manifest
  const manifest = await loadManifest();
  const tutorial = manifest.tutorials.find((s) => s.slug === slug);
  if (tutorial?.localPath) {
    try {
      const response = await fetch(`${getBasePath()}${tutorial.localPath}`);
      if (response.ok) {
        const content = await response.text();
        return { content, path: tutorial.localPath };
      }
    } catch {
      // fallback
    }
  }

  // Fallback: try common path patterns directly
  for (const ext of [".mdx", ".md"]) {
    try {
      const response = await fetch(
        getBuiltinTutorialPath(`${slug}${ext}`, getBasePath())
      );
      if (response.ok) {
        const content = await response.text();
        return {
          content,
          path: `/${TUTORIALS_DIR_NAME}/${slug}${ext}`,
        };
      }
    } catch {
      // try next
    }
  }

  return null;
}

// ─── Builtin Scanner ─────────────────────────────────────

/**
 * Returns the built-in tutorials shipped in `public/tutorials/` (via
 * the manifest). Series metadata is NOT returned here — it lives in
 * the courses data layer (src/lib/courses-store.ts) and is merged in
 * by the caller (useAppStore.scanContent).
 */
export async function scanBuiltin(): Promise<{ tutorials: TutorialFile[] }> {
  const manifest = await loadManifest();
  return { tutorials: manifest.tutorials };
}

// ─── Synchronous Access for generateStaticParams ─────────
// generateStaticParams runs at build time and needs sync access.
// We import the manifest JSON directly via a build-time require.

let _syncTutorials: TutorialFile[] | null = null;

/** Get built-in tutorials synchronously (for generateStaticParams at build time). */
export function getBuiltinTutorialsSync(): TutorialFile[] {
  if (_syncTutorials) return _syncTutorials;

  // At build time (Node.js), try to read the manifest file directly
  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const manifestPath = path.join(
        process.cwd(),
        "public",
        TUTORIALS_MANIFEST_NAME
      );
      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest: TutorialsManifest = JSON.parse(raw);
      _syncTutorials = manifest.tutorials;
      return _syncTutorials;
    } catch {
      // manifest not found or not in Node.js
    }
  }

  return [];
}

// ─── Workspace Scanner ───────────────────────────────────

export async function scanWorkspace(workspacePath: string): Promise<ScanResult> {
  if (!("__TAURI_INTERNALS__" in window)) {
    return { series: [], tutorials: [] };
  }

  try {
    const { readDir, exists } = await import("@tauri-apps/plugin-fs");
    const tutorials: TutorialFile[] = [];
    const series: SeriesFile[] = [];

    const scanDir = async (dir: string, depth = 0) => {
      if (depth > 3) return;
      try {
        const entries = await readDir(dir);
        for (const entry of entries) {
          const name = entry.name;
          const path = (entry as any).path || `${dir}/${name}`;

          if ((entry as any).isDirectory || entry.children !== undefined) {
            await scanDir(path, depth + 1);
          } else if (
            (name.endsWith(".md") || name.endsWith(".mdx")) &&
            !name.startsWith("_")
          ) {
            try {
              const { readFile } = await import("@tauri-apps/plugin-fs");
              const bytes = await readFile(path);
              const text = new TextDecoder().decode(bytes);
              const { frontmatter } = parseFrontmatter(text);

              const slug = name.replace(/\.(md|mdx)$/, "");
              tutorials.push({
                slug,
                title: (frontmatter.title as string) || slug,
                description: (frontmatter.description as string) || "",
                difficulty:
                  (frontmatter.difficulty as TutorialFile["difficulty"]) || "beginner",
                duration: (frontmatter.duration as number) || 5,
                category: (frontmatter.category as string) || "general",
                tags: Array.isArray(frontmatter.tags)
                  ? (frontmatter.tags as string[])
                  : undefined,
                source: "local",
                localPath: path,
              });
            } catch {
              // skip broken files
            }
          }
        }
      } catch {
        // directory not readable
      }
    };

    const subdirs = TUTORIAL_SCAN_SUBDIRS;
    for (const sub of subdirs) {
      const subPath = `${workspacePath}/${sub}`;
      try {
        if (await exists(subPath)) {
          await scanDir(subPath, 0);
        }
      } catch {
        // skip
      }
    }

    await scanDir(workspacePath, 0);

    return { series, tutorials };
  } catch {
    return { series: [], tutorials: [] };
  }
}

// ─── Workspace File Helpers ──────────────────────────────

export function generateTutorialMDX({
  title,
  description,
  difficulty,
  duration,
  category,
  tags,
  content,
}: {
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  category: string;
  tags: string[];
  content: string;
}): string {
  const tagsStr = tags.length > 0 ? JSON.stringify(tags) : "[]";
  return `---
title: "${title}"
description: "${description}"
difficulty: ${difficulty}
duration: ${duration}
category: ${category}
tags: ${tagsStr}
---

${content}
`;
}

export async function saveTutorialToWorkspace(
  workspacePath: string,
  slug: string,
  content: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { writeFile, mkdir } = await import("@tauri-apps/plugin-fs");
  const tutorialsDir = getWorkspaceTutorialsDir(workspacePath);
  try {
    await mkdir(tutorialsDir, { recursive: true });
  } catch {
    // dir may already exist
  }
  const path = `${tutorialsDir}/${slug}.md`;
  const encoder = new TextEncoder();
  await writeFile(path, encoder.encode(content));
}

export async function deleteTutorialFromWorkspace(
  workspacePath: string,
  slug: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { remove } = await import("@tauri-apps/plugin-fs");
  const possiblePaths = getWorkspaceTutorialCandidates(workspacePath, slug);
  for (const p of possiblePaths) {
    try {
      await remove(p);
    } catch {
      // file may not exist
    }
  }
}

export async function saveSeriesToWorkspace(
  workspacePath: string,
  seriesItem: SeriesFile
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { writeFile, readFile, mkdir } = await import("@tauri-apps/plugin-fs");
  const seriesDir = `${workspacePath}/courses`;
  try {
    await mkdir(seriesDir, { recursive: true });
  } catch {
    // dir may already exist
  }

  const path = `${seriesDir}/${seriesItem.id}.json`;
  let seriesList: SeriesFile[] = [];
  try {
    const bytes = await readFile(`${workspacePath}/_courses.json`);
    const text = new TextDecoder().decode(bytes);
    seriesList = JSON.parse(text);
  } catch {
    // file may not exist
  }

  const idx = seriesList.findIndex((c) => c.id === seriesItem.id);
  if (idx >= 0) {
    seriesList[idx] = seriesItem;
  } else {
    seriesList.push(seriesItem);
  }

  const encoder = new TextEncoder();
  await writeFile(`${workspacePath}/_courses.json`, encoder.encode(JSON.stringify(seriesList, null, 2)));
  await writeFile(path, encoder.encode(JSON.stringify(seriesItem, null, 2)));
}

export async function deleteSeriesFromWorkspace(
  workspacePath: string,
  id: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { remove, readFile, writeFile } = await import("@tauri-apps/plugin-fs");

  try {
    await remove(`${workspacePath}/courses/${id}.json`);
  } catch {
    // file may not exist
  }

  try {
    const bytes = await readFile(`${workspacePath}/_courses.json`);
    const text = new TextDecoder().decode(bytes);
    const seriesList: SeriesFile[] = JSON.parse(text);
    const filtered = seriesList.filter((c) => c.id !== id);
    const encoder = new TextEncoder();
    await writeFile(`${workspacePath}/_courses.json`, encoder.encode(JSON.stringify(filtered, null, 2)));
  } catch {
    // file may not exist
  }
}

export async function addTutorialToSeries(
  workspacePath: string,
  seriesId: string,
  slug: string,
  _content: string,
  order: number
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${seriesId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const seriesItem: SeriesFile & { tutorials?: SeriesTutorial[] } = JSON.parse(text);
    if (!seriesItem.tutorials) seriesItem.tutorials = [];
    if (!seriesItem.tutorials.find((s) => s.slug === slug)) {
      seriesItem.tutorials.push({ slug, order });
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(seriesItem, null, 2)));
  } catch {
    // series may not exist
  }
}

export async function removeTutorialFromSeries(
  workspacePath: string,
  seriesId: string,
  slug: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${seriesId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const seriesItem: SeriesFile & { tutorials?: SeriesTutorial[] } = JSON.parse(text);
    if (seriesItem.tutorials) {
      seriesItem.tutorials = seriesItem.tutorials.filter((s) => s.slug !== slug);
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(seriesItem, null, 2)));
  } catch {
    // series may not exist
  }
}

export async function reorderSeriesTutorials(
  workspacePath: string,
  seriesId: string,
  slugs: string[]
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${seriesId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const seriesItem: SeriesFile & { tutorials?: SeriesTutorial[] } = JSON.parse(text);
    if (seriesItem.tutorials) {
      seriesItem.tutorials = slugs.map((slug, idx) => ({
        slug,
        order: idx + 1,
      }));
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(seriesItem, null, 2)));
  } catch {
    // series may not exist
  }
}
