import { useAppStore } from '../store/useAppStore';
import { SeriesCard } from './tutorial/SeriesCard';
import { TutorialCard } from './tutorial/TutorialCard';
import { FolderOpen, FileText, Plus } from 'lucide-react';

interface HomeProps {
  onSeriesClick: (seriesId: string) => void;
  onTutorialClick: (tutorialId: string) => void;
  onImportClick: () => void;
  onAddDirectoryClick: () => void;
}

export function Home({ onSeriesClick, onTutorialClick, onImportClick, onAddDirectoryClick }: HomeProps) {
  const { series, tutorials, getFilteredTutorials } = useAppStore();
  
  const filteredTutorials = getFilteredTutorials();
  const recentTutorials = tutorials.slice(0, 6);
  
  return (
    <div className="h-full overflow-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          可执行教程
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          边学边做，让技术学习变得简单有趣。每个教程都包含可执行的命令，
          点击运行即可在终端中看到实时结果。
        </p>
      </div>
      
      {/* Featured Series */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <FolderOpen size={20} className="text-primary" />
            推荐系列
          </h2>
          <button 
            onClick={() => {}}
            className="text-sm text-primary hover:underline"
          >
            查看全部 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {series.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              tutorials={tutorials.filter((t) => t.series === s.id)}
              onClick={() => onSeriesClick(s.id)}
            />
          ))}
        </div>
      </section>
      
      {/* Recent Tutorials */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            最近教程
          </h2>
          <button 
            onClick={() => {}}
            className="text-sm text-primary hover:underline"
          >
            查看全部 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredTutorials.length > 0 ? filteredTutorials : recentTutorials).map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              onClick={() => onTutorialClick(tutorial.id)}
            />
          ))}
        </div>
        
        {filteredTutorials.length === 0 && recentTutorials.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            没有找到匹配的教程
          </div>
        )}
      </section>
      
      {/* Quick Actions */}
      <section className="border-t border-bg-tertiary pt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          快速操作
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onAddDirectoryClick}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-bg-tertiary rounded-lg text-text-primary hover:border-primary/50 transition-colors"
          >
            <FolderOpen size={18} className="text-primary" />
            <span>添加本地目录</span>
          </button>
          
          <button
            onClick={onImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-bg-tertiary rounded-lg text-text-primary hover:border-primary/50 transition-colors"
          >
            <Plus size={18} className="text-primary" />
            <span>导入教程</span>
          </button>
        </div>
      </section>
    </div>
  );
}
