import { useState } from 'react';
import {
  Users,
  Moon,
  Sun,
  Sparkles,
  Trophy,
  FileDown,
  Share2,
  Trash2,
} from 'lucide-react';
import useStore from '../store/useStore';
import ImportExportModal from '../modals/ImportExportModal';
import ChallongeExportModal from '../modals/BulkExportModal';
import ShareModal from '../modals/ShareModal';
import ClearAllModal from '../modals/ClearAllModal';

export default function Header() {
  const {
    darkMode,
    toggleDarkMode,
    eventName,
    organizerName,
    teams,
    players,
    clearAll,
  } = useStore();
  const [showImportExport, setShowImportExport] = useState(false);
  const [showChallongeExport, setShowChallongeExport] =
    useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const hasDataToClear =
    teams.length > 0 ||
    players.length > 0 ||
    eventName ||
    organizerName;

  return (
    <>
      <header className='glass-header sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2.5 bg-gradient-to-br from-primary to-rose-500 rounded-xl text-white shadow-lg shadow-primary/25'>
                <Users size={28} />
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-rose-600 bg-clip-text text-transparent'>
                  Teamify
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

            {/* Action Buttons Container */}
            <div className='flex items-center gap-2'>
              {/* Export/Share buttons wrapper with tour attribute */}
              <div
                className='flex items-center gap-2'
                data-tour='export-share'
              >
                {/* Challonge Export Button */}
                <button
                  onClick={() => setShowChallongeExport(true)}
                  disabled={teams.length === 0}
                  className='hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm'
                  title={
                    teams.length === 0
                      ? 'Create teams first'
                      : 'Export teams for Challonge'
                  }
                >
                  <Trophy size={16} />
                  <span className='hidden md:inline'>Challonge</span>
                </button>

                {/* Mobile Challonge Export Button */}
                <button
                  onClick={() => setShowChallongeExport(true)}
                  disabled={teams.length === 0}
                  className='sm:hidden p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  title={
                    teams.length === 0
                      ? 'Create teams first'
                      : 'Export for Challonge'
                  }
                >
                  <Trophy size={18} />
                </button>

                {/* Import/Export Button */}
                <button
                  onClick={() => setShowImportExport(true)}
                  className='hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium shadow-sm'
                  title='Import or export team configurations'
                >
                  <FileDown size={16} />
                  <span className='hidden md:inline'>
                    Import/Export
                  </span>
                </button>

                {/* Mobile Import/Export Button */}
                <button
                  onClick={() => setShowImportExport(true)}
                  className='sm:hidden p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200'
                  title='Import/Export'
                >
                  <FileDown size={18} />
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setShowShare(true)}
                  disabled={teams.length === 0}
                  className='hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm'
                  title={
                    teams.length === 0
                      ? 'Create teams first'
                      : 'Share teams'
                  }
                >
                  <Share2 size={16} />
                  <span className='hidden md:inline'>Share</span>
                </button>

                {/* Mobile Share Button */}
                <button
                  onClick={() => setShowShare(true)}
                  disabled={teams.length === 0}
                  className='sm:hidden p-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  title='Share'
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Clear All Button - separate from tour */}
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!hasDataToClear}
                className='hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm'
                title={
                  hasDataToClear
                    ? 'Clear all data'
                    : 'No data to clear'
                }
              >
                <Trash2 size={16} />
                <span className='hidden md:inline'>Clear All</span>
              </button>

              {/* Mobile Clear All Button */}
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!hasDataToClear}
                className='sm:hidden p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                title={
                  hasDataToClear
                    ? 'Clear all data'
                    : 'No data to clear'
                }
              >
                <Trash2 size={18} />
              </button>

              {/* Dark Mode Toggle - separate from tour */}
              <button
                onClick={toggleDarkMode}
                className='p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group'
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
        </div>
      </header>

      {/* Modals */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />
      <ChallongeExportModal
        isOpen={showChallongeExport}
        onClose={() => setShowChallongeExport(false)}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />

      <ClearAllModal
        isOpen={showClearConfirm}
        onConfirm={handleClearAll}
        onClose={() => setShowClearConfirm(false)}
      />
    </>
  );
}
