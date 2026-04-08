import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Series, Tutorial } from '../../types';

interface SeriesCardProps {
  series: Series;
  tutorials: Tutorial[];
  onClick: () => void;
}

export function SeriesCard({ series, tutorials, onClick }: SeriesCardProps) {
  const totalDuration = tutorials.reduce((sum, t) => sum + t.duration, 0);
  const completedCount = 0; // TODO: Get from progress
  const progress = tutorials.length > 0 ? (completedCount / tutorials.length) * 100 : 0;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-bg-secondary rounded-xl border border-bg-tertiary p-5 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${series.color}20` }}
        >
          {series.icon || '📚'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
            {series.title}
          </h3>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {series.description}
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} />
          <span>{tutorials.length} 个教程</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{totalDuration} 分钟</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-muted">进度</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Action */}
      <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
        <span>开始学习</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
