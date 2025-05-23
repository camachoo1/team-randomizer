import { useEffect } from 'react';
import Header from './components/Header';
import EventSettings from './components/EventSettings';
import PlayerManager from './components/PlayerManager';
import { Sparkles } from 'lucide-react';
import useStore from './store/useStore';
import ImportExport from './components/ImportExport';
import TeamDisplay from './components/TeamDisplay';
import History from './components/History';
import BulkExport from './components/BulkExport';
import BracketIntegration from './components/BracketIntegration';

function App() {
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    // Ensure dark mode class is applied on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className='gradient-bg min-h-screen transition-colors duration-500'>
        {/* Background decoration */}
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div
            className='absolute -top-40 -right-40 w-96 h-96 bg-primary/10 
                        rounded-full blur-3xl animate-pulse-subtle'
          />
          <div
            className='absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500/10 
                        rounded-full blur-3xl animate-pulse-subtle'
            style={{ animationDelay: '1s' }}
          />
        </div>

        <Header />

        {/* Main Content */}
        <main className='container mx-auto px-4 py-8 relative'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1 space-y-6'>
              <EventSettings />
              <PlayerManager />
              <BulkExport />
              <ImportExport />
              <History />
            </div>

            <div className='lg:col-span-2 space-y-6'>
              <TeamDisplay />
              <BracketIntegration />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='relative mt-auto py-8 text-center'>
          <div className='container mx-auto px-4'>
            <div
              className='flex items-center justify-center gap-2 text-sm 
                          text-gray-500 dark:text-gray-400'
            >
              <Sparkles
                size={16}
                className='text-primary animate-pulse-subtle'
              />
              <span>
                Team Randomizer • Built with React + TypeScript +
                Tailwind CSS
              </span>
              <Sparkles
                size={16}
                className='text-primary animate-pulse-subtle'
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
