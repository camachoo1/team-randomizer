import {
  AlertCircle,
  Archive,
  ChevronDown,
  Clock,
  Download,
  Trash2,
} from 'lucide-react';
import useStore from '../store/useStore';
import { useState } from 'react';

export default function History() {
  const { history, loadHistoryEntry, clearHistory } = useStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };
  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.3s' }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <Clock className='text-primary' size={22} />
          </div>
          <h2 className='text-xl font-bold'>History</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                     rounded-lg transition-all duration-200'
            title='Clear all history'
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {showClearConfirm && (
        <div
          className='mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl 
                      border border-red-200 dark:border-red-800 animate-slide-up'
        >
          <div className='flex gap-3 mb-3'>
            <AlertCircle
              className='text-red-600 flex-shrink-0 mt-0.5'
              size={20}
            />
            <div className='flex-1'>
              <p className='font-semibold text-red-900 dark:text-red-100'>
                Clear all history?
              </p>
              <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
                This will permanently delete all {history.length}{' '}
                saved team configurations.
              </p>
            </div>
          </div>
          <div className='flex gap-2 ml-8'>
            <button
              onClick={handleClearHistory}
              className='btn-danger'
            >
              Clear History
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className='btn-ghost'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className='text-center py-12 text-gray-400'>
          <Archive size={48} className='mx-auto mb-3 opacity-30' />
          <p className='font-medium'>No history yet</p>
          <p className='text-sm mt-1'>
            Past team configurations will appear here
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className='border border-gray-200 dark:border-gray-700 rounded-xl 
                       overflow-hidden hover:border-primary/30 transition-all duration-300
                       animate-slide-up'
              style={{
                animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
              }}
            >
              <div
                className='p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 
                         flex justify-between items-center transition-all duration-200'
                onClick={() =>
                  setExpandedId(
                    expandedId === entry.id ? null : entry.id
                  )
                }
              >
                <div className='flex-1'>
                  <p className='font-semibold'>
                    {entry.eventName || 'Unnamed Event'}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mt-0.5'>
                    {formatDate(entry.timestamp)}
                    {entry.organizerName &&
                      ` • ${entry.organizerName}`}
                  </p>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 text-gray-400
                    ${expandedId === entry.id ? 'rotate-180' : ''}`}
                />
              </div>

              {expandedId === entry.id && (
                <div
                  className='px-4 pb-4 border-t border-gray-200 dark:border-gray-700 
                              animate-slide-up'
                >
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-4'>
                    {entry.teams.map((team, teamIdx) => (
                      <div
                        key={teamIdx}
                        className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3'
                      >
                        <p className='font-semibold text-sm mb-2'>
                          {team.name}
                        </p>
                        <div className='space-y-1'>
                          {team.players.map((player, pIdx) => (
                            <p
                              key={pIdx}
                              className='text-sm text-gray-600 dark:text-gray-400'
                            >
                              • {player.name}
                            </p>
                          ))}
                          {team.players.length === 0 && (
                            <p className='text-sm text-gray-400 italic'>
                              No players
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadHistoryEntry(entry.id);
                    }}
                    className='btn-secondary w-full text-sm flex items-center justify-center gap-2'
                  >
                    <Download size={16} />
                    Load This Configuration
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
