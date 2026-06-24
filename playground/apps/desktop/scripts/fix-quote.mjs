import { readFileSync, writeFileSync } from 'fs';
const f = 'src/app/series/detail/client.tsx';
let c = readFileSync(f, 'utf-8');
const old = '{canEdit ? "点击上方"添加教程"按钮开始" : "暂无内容"}';
const neu = '{canEdit ? "点击上方“添加教程”按钮开始" : "暂无内容"}';
if (!c.includes(old)) { console.log('MISS'); process.exit(1); }
c = c.replace(old, neu);
writeFileSync(f, c, 'utf-8');
console.log('OK');
