import { useState } from 'react';
import useStore from '../store/useStore';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Info,
  Trophy,
} from 'lucide-react';
import clsx from 'clsx';

export default function BulkExport() {
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

  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.5s' }}
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <Trophy className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Export for Challonge</h2>
      </div>
      {teams.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <Trophy size={32} className='mx-auto mb-2 opacity-30' />
          <p className='text-sm'>
            Create teams first to export for Challonge
          </p>
        </div>
      ) : (
        <>
          <div className='mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
            <div className='flex items-start gap-2'>
              <Info
                size={18}
                className='text-blue-600 flex-shrink-0 mt-0.5'
              />
              <div className='text-sm space-y-2'>
                <p className='font-semibold text-blue-800 dark:text-blue-200'>
                  How to use with Challonge:
                </p>
                <ol className='text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside'>
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
                  className='inline-flex items-center gap-1 text-primary hover:underline font-medium'
                >
                  Create a tournament on Challonge
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className='mb-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={includePlayerNames}
                onChange={(e) =>
                  setIncludePlayerNames(e.target.checked)
                }
                className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded 
                         focus:ring-primary focus:ring-2'
              />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Include player names with teams
              </span>
            </label>
          </div>

          <div className='relative'>
            <div
              className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm 
                          max-h-64 overflow-y-auto scrollbar-custom'
            >
              <pre className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                {teamList}
              </pre>
            </div>

            <button
              onClick={handleCopy}
              className={clsx(
                'absolute top-2 right-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                'transition-all duration-200 flex items-center gap-2',
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
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
                  Copy
                </>
              )}
            </button>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
            <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3'>
              <p className='text-gray-600 dark:text-gray-400'>
                Total Teams
              </p>
              <p className='text-xl font-bold'>{teams.length}</p>
            </div>
            <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3'>
              <p className='text-gray-600 dark:text-gray-400'>
                Total Players
              </p>
              <p className='text-xl font-bold'>
                {teams.reduce(
                  (total, team) => total + team.players.length,
                  0
                )}
              </p>
            </div>
          </div>

          {eventName && (
            <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                <strong>Tournament Name Suggestion:</strong>{' '}
                {eventName}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
