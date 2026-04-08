import { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2, PanelRight, PanelBottom, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  const {
    terminalPosition,
    terminalVisible,
    terminalOutput,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    addTerminalOutput,
    clearTerminal,
  } = useAppStore();
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);
  
  if (!terminalVisible) return null;
  
  const positionClasses = {
    right: 'w-96 border-l',
    bottom: 'h-64 border-t',
  };
  
  const handleExecute = () => {
    if (!input.trim()) return;
    
    addTerminalOutput(`$ ${input}`);
    
    // Mock execution - in real app this would call Tauri
    setTimeout(() => {
      addTerminalOutput(`执行: ${input}`);
      addTerminalOutput('命令执行成功！\n');
    }, 500);
    
    setInput('');
  };
  
  return (
    <div 
      className={`
        bg-bg-primary flex flex-col transition-all duration-300
        ${terminalPosition === 'right' 
          ? 'w-96 border-l border-bg-tertiary' 
          : 'h-64 border-t border-bg-tertiary'
        }
      `}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">终端</span>
          {isExecuting && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              执行中
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Position Toggle */}
          <button
            onClick={toggleTerminalPosition}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
            title={terminalPosition === 'right' ? '切换到底部' : '切换到右侧'}
          >
            {terminalPosition === 'right' ? <PanelBottom size={14} /> : <PanelRight size={14} />}
          </button>
          
          {/* Clear */}
          <button
            onClick={clearTerminal}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
            title="清除输出"
          >
            <Trash2 size={14} />
          </button>
          
          {/* Minimize */}
          <button
            onClick={hideTerminal}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
            title="最小化"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm space-y-1"
      >
        {terminalOutput.length === 0 ? (
          <div className="text-text-muted text-center py-8">
            点击教程中的&quot;运行&quot;按钮开始执行命令
          </div>
        ) : (
          terminalOutput.map((line, index) => (
            <div 
              key={index} 
              className={`${
                line.startsWith('$') 
                  ? 'text-primary' 
                  : line.startsWith('错误') 
                    ? 'text-error' 
                    : 'text-text-primary'
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>
      
      {/* Terminal Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-bg-tertiary bg-bg-secondary">
        <span className="text-primary font-mono text-sm">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
          placeholder="输入命令..."
          className="flex-1 bg-transparent text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
