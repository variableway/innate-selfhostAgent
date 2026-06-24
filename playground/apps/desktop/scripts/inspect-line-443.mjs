import { readFileSync } from 'fs';
const c = readFileSync('src/app/series/detail/client.tsx', 'utf-8');
const lines = c.split('\n');
const line = lines[442];
console.log('line 443 raw:', JSON.stringify(line));
for (let i = 0; i < line.length; i++) {
  const ch = line[i];
  if (ch.charCodeAt(0) > 127 || ch === '"' || ch === "'") {
    console.log('  idx', i, ':', JSON.stringify(ch), 'U+' + ch.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase());
  }
}
