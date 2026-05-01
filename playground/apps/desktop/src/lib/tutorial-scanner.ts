/**
 * Tutorial Scanner
 *
 * 扫描内置教程和用户工作区中的教程文件，提取元数据。
 */

import { CourseSkill } from "@/types";

// ─── Types ───────────────────────────────────────────────

export interface SkillFile {
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  category: string;
  tags?: string[];
  course?: string;
  courseOrder?: number;
  source?: string;
  localPath?: string;
}

export interface CourseFile {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  skills?: CourseSkill[];
}

interface ScanResult {
  courses: CourseFile[];
  skills: SkillFile[];
}

// ─── Built-in content manifest ───────────────────────────
// 已清空所有内置教程

const BUILTIN_COURSES: CourseFile[] = [];

const BUILTIN_SKILL_PATHS: Record<string, string> = {
  "install-claude-code-glm5-deepseek-v4": "/skills/install-claude-code-glm5-deepseek-v4.md",
};

const BUILTIN_SKILLS: SkillFile[] = [
  {
    slug: "install-claude-code-glm5-deepseek-v4",
    title: "Claude Code + GLM 5.1 + DeepSeek V4 安装指南",
    description: "一次性安装 Claude Code，配置 GLM 5.1 和 DeepSeek V4 模型，使用 Coding Tool Helper 自动化管理",
    difficulty: "beginner",
    duration: 15,
    category: "dev-tools",
    tags: ["claude-code", "glm", "deepseek", "ai", "setup", "coding-helper"],
    source: "builtin",
    localPath: "/skills/install-claude-code-glm5-deepseek-v4.md",
  },
];

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

export async function loadSkillContent(
  slug: string,
  workspacePath?: string
): Promise<{ content: string; path: string } | null> {
  // Try workspace first
  if (workspacePath && "__TAURI_INTERNALS__" in window) {
    try {
      const { readFile } = await import("@tauri-apps/plugin-fs");
      const possiblePaths = [
        `${workspacePath}/skills/${slug}.md`,
        `${workspacePath}/skills/${slug}.mdx`,
        `${workspacePath}/lessons/${slug}.md`,
        `${workspacePath}/lessons/${slug}.mdx`,
        `${workspacePath}/${slug}.md`,
        `${workspacePath}/${slug}.mdx`,
      ];
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

  // Try built-in / public tutorials via fetch
  if (BUILTIN_SKILL_PATHS[slug]) {
    try {
      const response = await fetch(BUILTIN_SKILL_PATHS[slug]);
      if (response.ok) {
        const content = await response.text();
        return { content, path: BUILTIN_SKILL_PATHS[slug] };
      }
    } catch {
      // fallback
    }
  }

  return null;
}

// ─── Builtin Scanner ─────────────────────────────────────

export async function scanBuiltin(): Promise<ScanResult> {
  return { courses: BUILTIN_COURSES, skills: BUILTIN_SKILLS };
}

// ─── Workspace Scanner ───────────────────────────────────

export async function scanWorkspace(workspacePath: string): Promise<ScanResult> {
  if (!("__TAURI_INTERNALS__" in window)) {
    return { courses: [], skills: [] };
  }

  try {
    const { readDir, exists } = await import("@tauri-apps/plugin-fs");
    const skills: SkillFile[] = [];
    const courses: CourseFile[] = [];

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
              skills.push({
                slug,
                title: (frontmatter.title as string) || slug,
                description: (frontmatter.description as string) || "",
                difficulty:
                  (frontmatter.difficulty as SkillFile["difficulty"]) || "beginner",
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

    const subdirs = ["skills", "lessons", "KM", "Apps"];
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

    return { courses, skills };
  } catch {
    return { courses: [], skills: [] };
  }
}

// ─── Workspace File Helpers ──────────────────────────────

export function generateSkillMDX({
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

export async function saveSkillToWorkspace(
  workspacePath: string,
  slug: string,
  content: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { writeFile, mkdir } = await import("@tauri-apps/plugin-fs");
  const skillsDir = `${workspacePath}/skills`;
  try {
    await mkdir(skillsDir, { recursive: true });
  } catch {
    // dir may already exist
  }
  const path = `${skillsDir}/${slug}.md`;
  const encoder = new TextEncoder();
  await writeFile(path, encoder.encode(content));
}

export async function deleteSkillFromWorkspace(
  workspacePath: string,
  slug: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { remove } = await import("@tauri-apps/plugin-fs");
  const possiblePaths = [
    `${workspacePath}/skills/${slug}.md`,
    `${workspacePath}/skills/${slug}.mdx`,
    `${workspacePath}/lessons/${slug}.md`,
    `${workspacePath}/lessons/${slug}.mdx`,
    `${workspacePath}/${slug}.md`,
    `${workspacePath}/${slug}.mdx`,
  ];
  for (const p of possiblePaths) {
    try {
      await remove(p);
    } catch {
      // file may not exist
    }
  }
}

export async function saveCourseToWorkspace(
  workspacePath: string,
  course: CourseFile
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { writeFile, readFile, mkdir } = await import("@tauri-apps/plugin-fs");
  const coursesDir = `${workspacePath}/courses`;
  try {
    await mkdir(coursesDir, { recursive: true });
  } catch {
    // dir may already exist
  }

  const path = `${coursesDir}/${course.id}.json`;
  let courses: CourseFile[] = [];
  try {
    const bytes = await readFile(`${workspacePath}/_courses.json`);
    const text = new TextDecoder().decode(bytes);
    courses = JSON.parse(text);
  } catch {
    // file may not exist
  }

  const idx = courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) {
    courses[idx] = course;
  } else {
    courses.push(course);
  }

  const encoder = new TextEncoder();
  await writeFile(`${workspacePath}/_courses.json`, encoder.encode(JSON.stringify(courses, null, 2)));
  await writeFile(path, encoder.encode(JSON.stringify(course, null, 2)));
}

export async function deleteCourseFromWorkspace(
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
    const courses: CourseFile[] = JSON.parse(text);
    const filtered = courses.filter((c) => c.id !== id);
    const encoder = new TextEncoder();
    await writeFile(`${workspacePath}/_courses.json`, encoder.encode(JSON.stringify(filtered, null, 2)));
  } catch {
    // file may not exist
  }
}

export async function addSkillToCourse(
  workspacePath: string,
  courseId: string,
  slug: string,
  _content: string,
  order: number
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${courseId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const course: CourseFile & { skills?: CourseSkill[] } = JSON.parse(text);
    if (!course.skills) course.skills = [];
    if (!course.skills.find((s) => s.slug === slug)) {
      course.skills.push({ slug, order });
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(course, null, 2)));
  } catch {
    // course may not exist
  }
}

export async function removeSkillFromCourse(
  workspacePath: string,
  courseId: string,
  slug: string
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${courseId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const course: CourseFile & { skills?: CourseSkill[] } = JSON.parse(text);
    if (course.skills) {
      course.skills = course.skills.filter((s) => s.slug !== slug);
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(course, null, 2)));
  } catch {
    // course may not exist
  }
}

export async function reorderCourseSkills(
  workspacePath: string,
  courseId: string,
  slugs: string[]
): Promise<void> {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const { readFile, writeFile } = await import("@tauri-apps/plugin-fs");
  const path = `${workspacePath}/courses/${courseId}.json`;

  try {
    const bytes = await readFile(path);
    const text = new TextDecoder().decode(bytes);
    const course: CourseFile & { skills?: CourseSkill[] } = JSON.parse(text);
    if (course.skills) {
      course.skills = slugs.map((slug, idx) => ({
        slug,
        order: idx + 1,
      }));
    }
    const encoder = new TextEncoder();
    await writeFile(path, encoder.encode(JSON.stringify(course, null, 2)));
  } catch {
    // course may not exist
  }
}
