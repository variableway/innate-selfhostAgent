import { ArrowLeft, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TutorialCard } from './tutorial/TutorialCard';

interface SeriesDetailProps {
  seriesId: string;
  onBack: () => void;
  onTutorialClick: (tutorialId: string) => void;
}

export function SeriesDetail({ seriesId, onBack, onTutorialClick }: SeriesDetailProps) {
  const { series, getTutorialsBySeries, progress } = useAppStore();
  
  const currentSeries = series.find((s) => s.id === seriesId);
  const tutorials = getTutorialsBySeries(seriesId);
  
  if (!currentSeries) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted">系列不存在</div>
      </div>
    );
  }
  
  const completedCount = tutorials.filter(
    (t) => progress[t.id]?.completed
  ).length;
  const progressPercent = tutorials.length > 0 
    ? (completedCount / tutorials.length) * 100 
    : 0;
  const totalDuration = tutorials.reduce((sum, t) => sum + t.duration, 0);
  
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary px-6 py-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span>返回系列列表</span>
        </button>
        
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ backgroundColor: `${currentSeries.color}20` }}
          >
            {currentSeries.icon || '📚'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">
              {currentSeries.title}
            </h1>
            <p className="text-text-secondary mt-1">
              {currentSeries.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-3 text-sm text-text-muted">
              <div className="flex items-center gap-1.5">
                <BookOpen size={16} />
                <span>{tutorials.length} 个教程</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{totalDuration} 分钟</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 size={16} />
                <span>{completedCount}/{tutorials.length} 已完成</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {tutorials.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">学习进度</span>
              <span className="text-primary font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Tutorials List */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          教程列表
        </h2>
        
        {tutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                completed={progress[tutorial.id]?.completed}
                onClick={() => onTutorialClick(tutorial.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted bg-bg-secondary rounded-xl border border-bg-tertiary">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>该系列暂无教程</p>
          </div>
        )}
      </div>
    </div>
  );
}
