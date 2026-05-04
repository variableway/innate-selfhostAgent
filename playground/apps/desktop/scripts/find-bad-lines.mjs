import { readFileSync } from "fs";
const { compile } = await import("/Users/patrick/innate/innate-executable/playground/node_modules/.pnpm/@mdx-js+mdx@3.1.1/node_modules/@mdx-js/mdx/index.js");
import remarkGfm from "/Users/patrick/innate/innate-executable/playground/node_modules/.pnpm/remark-gfm@4.0.1/node_modules/remark-gfm/index.js";

const slugs = [
  "openclaw-email-calendar", "ai-cognitive-science", "ai-math-basics-part1",
  "ai-math-basics-part2", "ai-interdisciplinary-journey", "ai-cybernetics-complexity",
  "ai-causal-inference", "install-git", "install-kimi-cli", "install-nodejs"
];

for (const slug of slugs) {
  const content = readFileSync(`/tmp/mdx-fail-${slug}.txt`, "utf-8");
  const lines = content.split("\n");
  
  let failLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const chunk = lines.slice(0, i + 1).join("\n");
    try {
      await compile(chunk, { format: "mdx", remarkPlugins: [remarkGfm], outputFormat: "function-body" });
    } catch {
      failLine = i;
      break;
    }
  }
  
  if (failLine >= 0) {
    const start = Math.max(0, failLine - 2);
    const end = Math.min(lines.length - 1, failLine + 2);
    console.log(`\n=== ${slug} fails at line ${failLine + 1} ===`);
    for (let i = start; i <= end; i++) {
      const marker = i === failLine ? ">>>" : "   ";
      console.log(`${marker} ${i + 1}: ${lines[i].substring(0, 150)}`);
    }
  }
}
