import { Home, BookOpen, FolderOpen, Settings, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type Tab = 'home' | 'tutorials' | 'series' | 'settings';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useAppStore();
  
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: '首页', icon: <Home size={18} /> },
    { id: 'tutorials', label: '教程', icon: <BookOpen size={18} /> },
    { id: 'series', label: '系列', icon: <FolderOpen size={18} /> },
    { id: 'settings', label: '设置', icon: <Settings size={18} /> },
  ];
  
  return (
    <header className="h-14 bg-bg-secondary border-b border-bg-tertiary flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">ET</span>
        </div>
        <span className="font-semibold text-text-primary hidden sm:block">Executable Tutorial</span>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 ml-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab.id 
                ? 'bg-primary/20 text-primary' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="搜索教程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-bg-primary border border-bg-tertiary rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </header>
  );
}
