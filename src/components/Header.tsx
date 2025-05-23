import React from 'react';
import { Users, Moon, Sun, Sparkles } from 'lucide-react';
import useStore from '../store/useStore';

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode, eventName, organizerName } =
    useStore();

  return (
    <header className='glass-header sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className='p-2.5 bg-gradient-to-br from-primary to-rose-500 rounded-xl 
                          text-white shadow-lg shadow-primary/25'
            >
              <Users size={28} />
            </div>
            <div>
              <h1
                className='text-2xl font-bold bg-gradient-to-r from-primary to-rose-600 
                           bg-clip-text text-transparent'
              >
                Team Randomizer
              </h1>
              {eventName && (
                <p className='text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2'>
                  <Sparkles size={12} />
                  {eventName}
                  {organizerName && ` • ${organizerName}`}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className='p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-all duration-200 group'
            aria-label='Toggle dark mode'
          >
            {darkMode ? (
              <Sun
                size={22}
                className='group-hover:rotate-180 transition-transform duration-500'
              />
            ) : (
              <Moon
                size={22}
                className='group-hover:-rotate-12 transition-transform duration-500'
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
