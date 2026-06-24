/**
 * Tutorial config — single source of truth for all tutorial-related
 * directory and file names used by both the Next.js runtime and the
 * manifest generator script.
 *
 * To customize the names, either edit the constants below OR set
 * environment variables before `pnpm dev` / `pnpm build`:
 *
 *   NEXT_PUBLIC_TUTORIALS_DIR          name of the folder under public/
 *                                      (also used as the sub-folder name
 *                                      inside each user workspace)
 *   NEXT_PUBLIC_TUTORIALS_MANIFEST     manifest filename under public/
 *   NEXT_PUBLIC_TUTORIAL_SCAN_SUBDIRS  comma-separated list of sub-folders
 *                                      inside a user workspace to scan for
 *                                      .md / .mdx tutorial files
 *
 * Note: NEXT_PUBLIC_* env vars are inlined at build time by Next.js, so the
 * runtime values cannot change without a rebuild. The Node.js-side
 * generator script reads the same exports via the same env-var fallbacks.
 */

export const TUTORIALS_DIR_NAME =
  process.env.NEXT_PUBLIC_TUTORIALS_DIR ?? "tutorials";

export const TUTORIALS_MANIFEST_NAME =
  process.env.NEXT_PUBLIC_TUTORIALS_MANIFEST ?? "tutorials-manifest.json";

/**
 * Sub-directories inside a user workspace that the scanner walks for
 * tutorial files. Order matters only for display precedence — the scanner
 * returns matches from every listed subdir.
 */
export const TUTORIAL_SCAN_SUBDIRS: readonly string[] = (
  process.env.NEXT_PUBLIC_TUTORIAL_SCAN_SUBDIRS ??
  "tutorials,lessons,KM,Apps"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Absolute (runtime) path the app fetches the manifest from. */
export function getTutorialsManifestUrl(basePath = ""): string {
  return `${basePath}/${TUTORIALS_MANIFEST_NAME}`;
}

/** Path a built-in tutorial file is served from (public/...). */
export function getBuiltinTutorialPath(filename: string, basePath = ""): string {
  return `${basePath}/${TUTORIALS_DIR_NAME}/${filename}`;
}

/** Sub-folder inside a user workspace where the app WRITES new tutorials. */
export function getWorkspaceTutorialsDir(workspacePath: string): string {
  return `${workspacePath}/${TUTORIALS_DIR_NAME}`;
}

/**
 * Return every candidate filesystem path a tutorial with the given
 * `slug` could live at inside a user workspace, checked in order.
 */
export function getWorkspaceTutorialCandidates(
  workspacePath: string,
  slug: string
): string[] {
  return [
    `${workspacePath}/${TUTORIALS_DIR_NAME}/${slug}.md`,
    `${workspacePath}/${TUTORIALS_DIR_NAME}/${slug}.mdx`,
    `${workspacePath}/lessons/${slug}.md`,
    `${workspacePath}/lessons/${slug}.mdx`,
    `${workspacePath}/${slug}.md`,
    `${workspacePath}/${slug}.mdx`,
  ];
}
