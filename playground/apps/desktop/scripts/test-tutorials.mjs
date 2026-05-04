import { readFileSync, writeFileSync } from "fs";
const { compile } = await import("/Users/patrick/innate/innate-executable/playground/node_modules/.pnpm/@mdx-js+mdx@3.1.1/node_modules/@mdx-js/mdx/index.js");
import remarkGfm from "remark-gfm";

const manifest = JSON.parse(readFileSync("public/skills-manifest.json", "utf-8"));

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: {}, body: match[2] };
}

function transformBody(body) {
  return body.replace(
    /(```[\s\S]*?```)/g,
    (match) => {
      if (/{[^}]*}/.test(match)) {
        const inner = match.slice(3, -3);
        const firstNewline = inner.indexOf("\n");
        const lang = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : "";
        const code = firstNewline >= 0 ? inner.slice(firstNewline + 1) : "";
        return `<RunnableCodeBlock language="${lang || "text"}" runnable={false} code={\`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`} />`;
      }
      return match;
    }
  );
}

let pass = 0, fail = 0;
const failed = [];
for (const skill of manifest.skills) {
  try {
    const content = readFileSync(`public${skill.localPath}`, "utf-8");
    const { body } = parseFrontmatter(content);
    const safeBody = transformBody(body);
    await compile(safeBody, { format: "mdx", remarkPlugins: [remarkGfm], outputFormat: "function-body" });
    console.log(`✅ ${skill.slug}`);
    pass++;
  } catch (err) {
    const msg = err.message.split("\n").slice(0, 3).join(" | ");
    console.log(`❌ ${skill.slug}: ${msg}`);
    // Save the failing body for inspection
    writeFileSync(`/tmp/mdx-fail-${skill.slug}.txt`, transformBody(parseFrontmatter(readFileSync(`public${skill.localPath}`, "utf-8")).body));
    failed.push(skill.slug);
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
if (failed.length) console.log("Failed:", failed.join(", "));
