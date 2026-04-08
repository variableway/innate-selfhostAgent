import { ArrowLeft, Play, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface TutorialDetailProps {
  tutorialId: string;
  onBack: () => void;
}

export function TutorialDetail({ tutorialId, onBack }: TutorialDetailProps) {
  const { 
    tutorials, 
    showTerminal, 
    addTerminalOutput, 
    setIsExecuting,
    updateProgress,
    progress,
  } = useAppStore();
  
  const tutorial = tutorials.find((t) => t.id === tutorialId);
  const tutorialProgress = progress[tutorialId];
  
  if (!tutorial) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted">教程不存在</div>
      </div>
    );
  }
  
  const handleRun = (code: string) => {
    showTerminal();
    setIsExecuting(true);
    
    addTerminalOutput(`$ ${code}`);
    
    // Mock execution
    setTimeout(() => {
      addTerminalOutput('> 正在执行命令...');
      addTerminalOutput('✓ 命令执行成功！\n');
      setIsExecuting(false);
    }, 1000);
  };
  
  const handleMarkComplete = () => {
    updateProgress({
      tutorialId,
      completed: true,
      completedSections: [],
      completedAt: new Date().toISOString(),
    });
  };
  
  const difficultyLabels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级',
  };
  
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary px-6 py-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {tutorial.title}
            </h1>
            <p className="text-text-secondary mt-1">
              {tutorial.description}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
              <span className="px-2 py-0.5 bg-bg-secondary rounded-full">
                {difficultyLabels[tutorial.difficulty]}
              </span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{tutorial.duration} 分钟</span>
              </div>
            </div>
          </div>
          
          {/* Complete Button */}
          {tutorialProgress?.completed ? (
            <div className="flex items-center gap-2 text-success shrink-0">
              <CheckCircle size={20} />
              <span className="font-medium">已完成</span>
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors shrink-0"
            >
              <CheckCircle size={18} />
              <span>标记完成</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 max-w-4xl">
        {/* Mock Tutorial Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              什么是 {tutorial.title}？
            </h2>
            <p className="text-text-secondary leading-relaxed">
              这是一个关于 {tutorial.title} 的教程。在这里，你将学习如何使用相关工具，
              并通过实际操作来掌握核心概念。
            </p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              前置条件
            </h2>
            <ul className="list-disc list-inside text-text-secondary space-y-1">
              <li>已安装终端工具</li>
              <li>基本的命令行知识</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              安装步骤
            </h2>
            
            {/* Executable Block */}
            <div className="bg-bg-secondary rounded-xl border border-bg-tertiary overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-bg-tertiary">
                <span className="text-sm text-text-muted">Bash</span>
                <button
                  onClick={() => handleRun('brew install node')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors"
                >
                  <Play size={14} />
                  <span>运行</span>
                </button>
              </div>
              <div className="p-4 font-mono text-sm text-text-primary">
                <pre>brew install node</pre>
              </div>
            </div>
            
            <p className="text-text-secondary mt-4 leading-relaxed">
              执行上述命令安装 Node.js。安装完成后，你可以通过运行 
              <code className="px-1.5 py-0.5 bg-bg-secondary rounded text-primary mx-1">node -v</code>
              来验证安装是否成功。
            </p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              验证安装
            </h2>
            
            {/* Another Executable Block */}
            <div className="bg-bg-secondary rounded-xl border border-bg-tertiary overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-bg-tertiary">
                <span className="text-sm text-text-muted">Bash</span>
                <button
                  onClick={() => handleRun('node -v && npm -v')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors"
                >
                  <Play size={14} />
                  <span>运行</span>
                </button>
              </div>
              <div className="p-4 font-mono text-sm text-text-primary">
                <pre>node -v && npm -v</pre>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              总结
            </h2>
            <p className="text-text-secondary leading-relaxed">
              恭喜！你已经完成了 {tutorial.title} 的学习。现在你可以开始使用这个工具了。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
