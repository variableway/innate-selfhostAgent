import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Terminal } from './components/terminal/Terminal';
import { Home } from './components/Home';
import { SeriesDetail } from './components/SeriesDetail';
import { TutorialDetail } from './components/TutorialDetail';
import { useAppStore } from './store/useAppStore';

type Tab = 'home' | 'tutorials' | 'series' | 'settings';
type View = 
  | { type: 'home' }
  | { type: 'series'; seriesId: string }
  | { type: 'tutorial'; tutorialId: string };

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentView, setCurrentView] = useState<View>({ type: 'home' });
  const { terminalPosition, terminalVisible } = useAppStore();
  
  const handleSeriesClick = (seriesId: string) => {
    setCurrentView({ type: 'series', seriesId });
  };
  
  const handleTutorialClick = (tutorialId: string) => {
    setCurrentView({ type: 'tutorial', tutorialId });
  };
  
  const handleBack = () => {
    setCurrentView({ type: 'home' });
  };
  
  const handleImportClick = () => {
    // TODO: Implement import functionality
    alert('导入功能开发中...');
  };
  
  const handleAddDirectoryClick = () => {
    // TODO: Implement add directory functionality
    alert('添加目录功能开发中...');
  };
  
  const renderContent = () => {
    switch (currentView.type) {
      case 'home':
        return (
          <Home
            onSeriesClick={handleSeriesClick}
            onTutorialClick={handleTutorialClick}
            onImportClick={handleImportClick}
            onAddDirectoryClick={handleAddDirectoryClick}
          />
        );
      case 'series':
        return (
          <SeriesDetail
            seriesId={currentView.seriesId}
            onBack={handleBack}
            onTutorialClick={handleTutorialClick}
          />
        );
      case 'tutorial':
        return (
          <TutorialDetail
            tutorialId={currentView.tutorialId}
            onBack={handleBack}
          />
        );
      default:
        return <div className="p-8 text-text-muted">页面开发中...</div>;
    }
  };
  
  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
        
        {/* Terminal - Right Side */}
        {terminalVisible && terminalPosition === 'right' && (
          <Terminal />
        )}
      </div>
      
      {/* Terminal - Bottom */}
      {terminalVisible && terminalPosition === 'bottom' && (
        <Terminal />
      )}
    </div>
  );
}

export default App;
