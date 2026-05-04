#!/usr/bin/env node

/**
 * Skills & Courses Manifest Generator
 *
 * Scans public/skills/ for .mdx/.md files, parses frontmatter,
 * auto-generates course definitions from skill categories,
 * and writes public/skills-manifest.json for client-side consumption.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const SKILLS_DIR = join(PROJECT_ROOT, "public", "skills");
const MANIFEST_PATH = join(PROJECT_ROOT, "public", "skills-manifest.json");

// ─── Course templates by category ──────────────────────────

const COURSE_TEMPLATES = {
  "ai-assistant": {
    id: "ai-assistant-basics",
    title: "AI 助手入门系列",
    description: "从零开始学习使用 AI 助手，掌握搜索总结、邮件管理、日程安排和自定义技能",
    icon: "🤖",
    color: "#6366f1",
  },
  "ai-fundamentals": {
    id: "ai-fundamentals",
    title: "AI 基础知识系列",
    description: "系统学习 AI 的跨学科基础：数学、认知科学、控制论和因果推断",
    icon: "🧠",
    color: "#8b5cf6",
  },
  "dev-tools": {
    id: "dev-tools-setup",
    title: "开发环境搭建系列",
    description: "一站式安装和配置 AI 编程工具：Claude Code、Node.js、Git、Kimi CLI",
    icon: "🛠️",
    color: "#f59e0b",
  },
};

// ─── Helpers ──────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlText = match[1];
  const frontmatter = {};

  for (const line of yamlText.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
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

  return { frontmatter, body: match[2] };
}

function scanSkillsDir() {
  if (!existsSync(SKILLS_DIR)) {
    console.log("⚠️  public/skills/ directory not found, creating empty manifest");
    return [];
  }

  const files = readdirSync(SKILLS_DIR);
  const skillFiles = files.filter(
    (f) => (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("_")
  );

  const skills = [];

  for (const filename of skillFiles) {
    const slug = filename.replace(/\.(md|mdx)$/, "");
    const filePath = join(SKILLS_DIR, filename);
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter } = parseFrontmatter(content);

    skills.push({
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || "",
      difficulty: frontmatter.difficulty || "beginner",
      duration: frontmatter.duration || 10,
      category: frontmatter.category || "general",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      source: "builtin",
      localPath: `/skills/${filename}`,
    });
  }

  // Sort by category then title for consistent ordering
  skills.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.title.localeCompare(b.title);
  });

  return skills;
}

function generateCourses(skills) {
  // Group skills by category
  const byCategory = {};
  for (const skill of skills) {
    const cat = skill.category || "general";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(skill);
  }

  const courses = [];

  for (const [category, catSkills] of Object.entries(byCategory)) {
    const template = COURSE_TEMPLATES[category];
    if (!template) continue; // skip categories without a template

    courses.push({
      id: template.id,
      title: template.title,
      description: template.description,
      icon: template.icon,
      color: template.color,
      skills: catSkills.map((s, i) => ({ slug: s.slug, order: i + 1 })),
    });
  }

  return courses;
}

// ─── Main ──────────────────────────────────────────────────

console.log("🔍 Scanning public/skills/ for tutorial files...");

const skills = scanSkillsDir();
const courses = generateCourses(skills);

const manifest = {
  generatedAt: new Date().toISOString(),
  count: skills.length,
  skills,
  courses,
};

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

console.log(`✅ Generated manifest with ${skills.length} tutorials in ${courses.length} courses:`);
for (const course of courses) {
  console.log(`   ${course.icon} ${course.title} (${course.skills.length} skills)`);
}
for (const s of skills) {
  console.log(`   ${s.slug} (${s.difficulty}, ${s.category})`);
}
console.log(`📝 Manifest written to: public/skills-manifest.json`);
