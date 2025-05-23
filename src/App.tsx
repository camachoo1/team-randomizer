import { Users, Moon, Sun, Sparkles } from 'lucide-react';
import useStore from './store/useStore';
import EventSettings from './components/EventSettings';

function App() {
  const { darkMode, toggleDarkMode, eventName, organizerName } =
    useStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 
                      dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg transition-colors duration-500'
      >
        {/* Background decoration */}
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary-base/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl' />
        </div>

        {/* Header */}
        <header className='glass-effect border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-br from-primary-base to-rose-500 rounded-xl text-white'>
                  <Users size={28} />
                </div>
                <div>
                  <h1 className='text-2xl font-bold bg-gradient-to-r from-primary-base to-rose-600 bg-clip-text text-transparent'>
                    Team Randomizer
                  </h1>
                  {eventName && (
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {eventName}{' '}
                      {organizerName && `• ${organizerName}`}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={toggleDarkMode}
                className='p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200'
                aria-label='Toggle dark mode'
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='container mx-auto p-4 pb-8 relative'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6'>
            <div className='lg:col-span-1 space-y-6'>
              <EventSettings />
            </div>

            <div className='lg:col-span-2'>
              {/* Placeholder for Team Display */}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400'>
          <div className='flex items-center justify-center gap-2'>
            <Sparkles size={16} />
            <span>Built with React + TypeScript + Tailwind CSS</span>
            <Sparkles size={16} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
