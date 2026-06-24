import { readFileSync, writeFileSync } from 'fs';

const file = 'src/app/admin/series/page.tsx';
let content = readFileSync(file, 'utf-8');

const oldBlock = `  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#3498db");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);

    // Generate ID: slugify with pinyin support for Chinese, fallback to timestamp
    let id = title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-|-$/g, '');
    // If ID is empty (e.g. all Chinese with no latin), use timestamp
    if (!id) {
      id = \`course-\${Date.now()}\`;
    }

    setSaving(true);
    try {
      await saveSeriesToWorkspace(workspacePath || '', {
        id,
        title: title.trim(),
        description: description.trim(),
        icon,
        color,
        source: 'local',
        tutorials: [],
      });
      onSave();
    } catch (err) {
      console.error('Failed to create course:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (!workspacePath) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">请先创建工作区以保存自定义系列。</p>
        <Button variant="outline" size="sm" onClick={onCancel} className="mt-2">取消</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">创建新系列</h3>
      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          保存失败: {error}
        </div>
      )}`;

const newBlock = `  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#3498db");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">创建新系列</h3>`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  writeFileSync(file, content, 'utf-8');
  console.log('REPLACED');
} else {
  console.log('NOT FOUND');
  const idx = content.indexOf('const [title, setTitle]');
  if (idx > 0) console.log('first title state at offset', idx, '|', JSON.stringify(content.slice(idx, idx+200)));
}
