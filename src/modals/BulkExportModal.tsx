import React, { useState, useEffect, useCallback } from 'react';
import useStore from '../store/useStore';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Info,
  Trophy,
  X,
} from 'lucide-react';
import clsx from 'clsx';

interface ChallongeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallongeExportModal({
  isOpen,
  onClose,
}: ChallongeExportModalProps) {
  const { teams, eventName } = useStore();
  const [copied, setCopied] = useState(false);
  const [includePlayerNames, setIncludePlayerNames] = useState(false);

  const generateTeamList = () => {
    if (includePlayerNames) {
      // Format: "Team Name (Player1, Player2, Player3)"
      return teams
        .map(
          (team) =>
            `${team.name} (${team.players
              .map((p) => p.name)
              .join(', ')})`
        )
        .join('\n');
    } else {
      // Format: Just team names
      return teams.map((team) => team.name).join('\n');
    }
  };

  const teamList = generateTeamList();

  const handleCopy = async () => {
    const teamList = generateTeamList();
    try {
      await navigator.clipboard.writeText(teamList);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = teamList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [setCopied, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () =>
        document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
              <Trophy className='text-primary' size={22} />
            </div>
            <h2 className='text-xl font-bold'>
              Export for Challonge
            </h2>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6'>
          {teams.length === 0 ? (
            <div className='text-center py-12'>
              <Trophy
                size={48}
                className='mx-auto mb-4 text-gray-300 opacity-50'
              />
              <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                No teams to export
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-6'>
                Create some teams first, then come back to export them
                for Challonge.
              </p>
              <button onClick={handleClose} className='btn-primary'>
                Got it
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Instructions */}
              <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <div className='flex items-start gap-3'>
                  <Info
                    size={20}
                    className='text-blue-600 flex-shrink-0 mt-0.5'
                  />
                  <div className='space-y-3'>
                    <p className='font-semibold text-blue-800 dark:text-blue-200'>
                      How to use with Challonge:
                    </p>
                    <ol className='text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside text-sm'>
                      <li>Copy the team list below</li>
                      <li>Go to your Challonge tournament</li>
                      <li>Click "Participants" → "Bulk Add"</li>
                      <li>Paste the list (one team per line)</li>
                      <li>Click "Add Participants"</li>
                    </ol>
                    <a
                      href='https://challonge.com/tournaments/new'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-primary hover:underline font-medium text-sm'
                    >
                      Create a tournament on Challonge
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className='flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                  <input
                    type='checkbox'
                    checked={includePlayerNames}
                    onChange={(e) =>
                      setIncludePlayerNames(e.target.checked)
                    }
                    className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded 
                             focus:ring-primary focus:ring-2'
                  />
                  <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      Include player names with teams
                    </span>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Shows team members in parentheses after team
                      name
                    </p>
                  </div>
                </label>
              </div>

              {/* Export Preview */}
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                    Team List Preview
                  </h3>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {teams.length} teams
                  </span>
                </div>

                <div className='relative'>
                  <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto scrollbar-custom border'>
                    <pre className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                      {teamList}
                    </pre>
                  </div>

                  <button
                    onClick={handleCopy}
                    className={clsx(
                      'absolute top-3 right-3 px-3 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-200 flex items-center gap-2 shadow-sm',
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy List
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center'>
                  <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    {teams.length}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Total Teams
                  </p>
                </div>
                <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center'>
                  <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    {teams.reduce(
                      (total, team) => total + team.players.length,
                      0
                    )}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Total Players
                  </p>
                </div>
              </div>

              {/* Tournament Name Suggestion */}
              {eventName && (
                <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    <strong>Tournament Name Suggestion:</strong>
                  </p>
                  <p className='font-medium text-gray-900 dark:text-gray-100 mt-1'>
                    {eventName}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <button
                  onClick={handleClose}
                  className='btn-ghost px-6'
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className='btn-primary px-6'
                >
                  Copy & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
