import { useEffect, useState } from 'react';
import Header from './components/Header';
import EventSettings from './components/EventSettings';
import useStore from './store/useStore';
import History from './components/History';
import BracketIntegration from './components/BracketIntegration';
import ShareView from './components/ShareView';
import PlayerDisplay from './components/players/PlayerDisplay';
import TeamDisplay from './components/teams/TeamDisplay';
import Footer from './components/Footer';
import OnboardingOverlay from './components/OnboardingOverlay';

function App() {
  const darkMode = useStore((state) => state.darkMode);
  const [isShareView, setIsShareView] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem(
      'teamify-tour-completed'
    );
    if (!tourCompleted && !isShareView) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  }, [isShareView]);

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
    <>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className='gradient-bg min-h-screen transition-colors duration-200'>
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
                <PlayerDisplay />
                <History />
              </div>
              <div className='lg:col-span-2 space-y-6'>
                <TeamDisplay />
                <BracketIntegration />
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default App;
