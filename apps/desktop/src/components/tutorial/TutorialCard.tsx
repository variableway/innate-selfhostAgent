import { Clock, Play, CheckCircle, Circle } from 'lucide-react';
import { Tutorial } from '../../types';

interface TutorialCardProps {
  tutorial: Tutorial;
  completed?: boolean;
  onClick: () => void;
}

const difficultyLabels = {
  beginner: { text: '入门', color: 'text-green-400 bg-green-400/10' },
  intermediate: { text: '进阶', color: 'text-yellow-400 bg-yellow-400/10' },
  advanced: { text: '高级', color: 'text-red-400 bg-red-400/10' },
};

export function TutorialCard({ tutorial, completed, onClick }: TutorialCardProps) {
  const difficulty = difficultyLabels[tutorial.difficulty];
  
  return (
    <div 
      onClick={onClick}
      className="group bg-bg-secondary rounded-xl border border-bg-tertiary p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
            {tutorial.title}
          </h3>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {tutorial.description}
          </p>
        </div>
        
        {/* Completion Status */}
        {completed ? (
          <CheckCircle size={20} className="text-success shrink-0" />
        ) : (
          <Circle size={20} className="text-bg-tertiary shrink-0" />
        )}
      </div>
      
      {/* Tags */}
      {tutorial.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tutorial.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-bg-primary text-text-muted text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {tutorial.tags.length > 3 && (
            <span className="px-2 py-0.5 text-text-muted text-xs">
              +{tutorial.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {/* Difficulty Badge */}
          <span className={`px-2 py-0.5 text-xs rounded-full ${difficulty.color}`}>
            {difficulty.text}
          </span>
          
          {/* Duration */}
          <div className="flex items-center gap-1 text-text-muted text-sm">
            <Clock size={14} />
            <span>{tutorial.duration} 分钟</span>
          </div>
        </div>
        
        {/* Play Button */}
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={14} />
          <span>开始</span>
        </button>
      </div>
    </div>
  );
}
