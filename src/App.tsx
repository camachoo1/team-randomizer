import { useEffect, useState } from 'react';
import Header from './components/Header';
import EventSettings from './components/EventSettings';
import Players from './components/Players';
import { Sparkles } from 'lucide-react';
import useStore from './store/useStore';
import TeamDisplay from './components/TeamDisplay';
import History from './components/History';
import BracketIntegration from './components/BracketIntegration';
import ShareView from './components/ShareView';

function App() {
  const darkMode = useStore((state) => state.darkMode);
  const [isShareView, setIsShareView] = useState(false);

  useEffect(() => {
    // Ensure dark mode class is applied on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Check if we're in share view
    const checkShareView = () => {
      const hash = window.location.hash;
      setIsShareView(hash.startsWith('#share='));
    };

    checkShareView();
    window.addEventListener('hashchange', checkShareView);
    return () =>
      window.removeEventListener('hashchange', checkShareView);
  }, []);

  // If in share view, show only the ShareView component
  if (isShareView) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <ShareView />
      </div>
    );
  }

  // Normal app view
  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className='gradient-bg min-h-screen transition-colors duration-500'>
        {/* Background decoration */}
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle' />
          <div
            className='absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse-subtle'
            style={{ animationDelay: '1s' }}
          />
        </div>

        <Header />

        {/* Main Content */}
        <main className='container mx-auto px-4 py-8 relative'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1 space-y-6'>
              <EventSettings />
              <Players />
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
            <div className='flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
              <Sparkles
                size={16}
                className='text-primary animate-pulse-subtle'
              />
              <span>Teamify • Built by Fade</span>
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
