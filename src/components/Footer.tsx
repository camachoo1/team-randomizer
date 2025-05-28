import { Sparkles } from 'lucide-react';
import ReactSvg from '../assets/react_dark.svg';
import TypeScriptSvg from '../assets/typescript.svg';
import ViteSvg from '../assets/vitejs.svg';
import TailwindSvg from '../assets/tailwindcss.svg';

export default function Footer() {
  return (
    <footer className='relative mt-auto py-8 text-center'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center gap-4'>
          {/* Main title */}
          <div className='flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
            <Sparkles
              size={16}
              className='text-primary animate-pulse-subtle'
            />
            <span>Teamify • Developed by Fade</span>
            <Sparkles
              size={16}
              className='text-primary animate-pulse-subtle'
            />
          </div>

          {/* Tech stack */}
          <div className='flex items-center justify-center gap-3'>
            <span className='text-xs text-gray-400 dark:text-gray-500 mr-2'>
              Built with
            </span>
            <div className='flex items-center gap-2'>
              <img
                src={ReactSvg}
                alt='React'
                className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity'
                title='React'
              />
              <img
                src={TypeScriptSvg}
                alt='TypeScript'
                className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity'
                title='TypeScript'
              />
              <img
                src={ViteSvg}
                alt='Vite'
                className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity'
                title='Vite'
              />
              <img
                src={TailwindSvg}
                alt='Tailwind CSS'
                className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity'
                title='Tailwind CSS'
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
