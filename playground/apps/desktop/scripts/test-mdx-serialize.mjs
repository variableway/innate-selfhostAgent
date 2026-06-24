import { readFileSync, writeFileSync } from 'fs';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';

const file = process.argv[2] || 'public/tutorials/00-install-fnm.mdx';
const raw = readFileSync(file, 'utf-8');
// strip frontmatter
const m = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
const body = m ? m[1] : raw;

// Apply the same transform TutorialContent does
const safeBody = body.replace(
  /(```[\s\S]*?```)/g,
  (match) => {
    if (/{[^}]*}/.test(match)) {
      const inner = match.slice(3, -3);
      const firstNewline = inner.indexOf("\n");
      const infoString = (firstNewline > 0 ? inner.slice(0, firstNewline) : "").trim();
      const code = firstNewline >= 0 ? inner.slice(firstNewline + 1) : "";
      const markerMatch = infoString.match(/^(\S+)(?:\s+\{([^}]+)\})?\s*$/);
      const lang = markerMatch?.[1] ?? "text";
      const runnable = markerMatch?.[2] === "executable";
      return `<RunnableCodeBlock language="${lang || "text"}" runnable={${runnable}} code={\`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`} />`;
    }
    return match;
  }
);

try {
  const r = await serialize(safeBody, {
    mdxOptions: { remarkPlugins: [remarkGfm], format: "mdx" },
    parseFrontmatter: false,
  });
  console.log('OK: serialized', file, '->', r.compiledSource.length, 'chars');
} catch (e) {
  console.error('FAIL:', file);
  console.error(e.message);
  console.error('---');
  if (e.position) console.error('at line', e.position.start.line, 'col', e.position.start.column);
  console.error('---');
  const lines = body.split('\n');
  const ln = e.position?.start?.line ?? 0;
  for (let i = Math.max(0, ln-3); i < Math.min(lines.length, ln+3); i++) {
    console.error(`${i+1}: ${lines[i]}`);
  }
}
