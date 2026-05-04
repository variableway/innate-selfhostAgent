#!/usr/bin/env node

/**
 * Skills Manifest Generator
 *
 * Scans public/skills/ for .mdx/.md files, parses frontmatter,
 * and writes public/skills-manifest.json for client-side consumption.
 *
 * Usage:
 *   node scripts/generate-skills-manifest.mjs
 *
 * Add new tutorials by dropping .mdx/.md files into public/skills/.
 * Re-run this script (or restart dev server) to update the manifest.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const SKILLS_DIR = join(PROJECT_ROOT, "public", "skills");
const MANIFEST_PATH = join(PROJECT_ROOT, "public", "skills-manifest.json");

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

// ─── Main ──────────────────────────────────────────────────

console.log("🔍 Scanning public/skills/ for tutorial files...");

const skills = scanSkillsDir();

const manifest = {
  generatedAt: new Date().toISOString(),
  count: skills.length,
  skills,
};

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

console.log(`✅ Generated manifest with ${skills.length} tutorials:`);
for (const s of skills) {
  console.log(`   ${s.slug} (${s.difficulty}, ${s.category})`);
}
console.log(`📝 Manifest written to: public/skills-manifest.json`);
