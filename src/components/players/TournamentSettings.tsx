import { Hash, Target, Plus, Minus } from 'lucide-react';
import useStore from '../../store/useStore';

export default function TournamentSettings() {
  const { players, teamSize, setTeamSize, maxTeams, setMaxTeams } =
    useStore();

  // Calculate stats
  const activePlayers = players.filter((p) => !p.isReserve);
  const reservePlayers = players.filter((p) => p.isReserve);
  const estimatedTeams =
    activePlayers.length > 0
      ? Math.ceil(activePlayers.length / teamSize)
      : 0;
  const maxActiveSlots =
    maxTeams > 0 ? maxTeams * teamSize : Infinity;
  const isAtCapacity = activePlayers.length >= maxActiveSlots;

  const handleTeamSizeChange = (delta: number) => {
    const newSize = Math.max(1, Math.min(10, teamSize + delta));
    setTeamSize(newSize);
  };

  const handleMaxTeamsChange = (delta: number) => {
    const newMax = Math.max(0, Math.min(64, maxTeams + delta));
    setMaxTeams(newMax);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
      {/* Tournament Planning */}
      <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
        <div className='flex items-center gap-2 mb-3'>
          <Target size={16} className='text-blue-600' />
          <h3 className='font-semibold text-blue-900 dark:text-blue-100 text-sm'>
            Tournament Setup
          </h3>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-xs text-blue-700 dark:text-blue-300'>
              Teams
            </span>
            <span className='font-bold text-blue-900 dark:text-blue-100'>
              {maxTeams > 0
                ? Math.min(maxTeams, estimatedTeams)
                : estimatedTeams}
              {maxTeams > 0 && ` / ${maxTeams}`}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-xs text-blue-700 dark:text-blue-300'>
              Slots
            </span>
            <span className='font-bold text-blue-900 dark:text-blue-100'>
              {activePlayers.length}
              {maxTeams > 0 && ` / ${maxActiveSlots}`}
            </span>
          </div>
          {isAtCapacity && reservePlayers.length > 0 && (
            <div className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
              ⚠️ At capacity
            </div>
          )}
        </div>
      </div>

      {/* Team Size  */}
      <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
        <label className='flex items-center gap-2 text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100'>
          <Hash size={16} className='text-blue-600' />
          Team Size
        </label>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <button
            onClick={() => handleTeamSizeChange(-1)}
            disabled={teamSize <= 1}
            className='p-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <Minus
              size={16}
              className='text-blue-600 dark:text-blue-300'
            />
          </button>
          <div className='w-16 h-12 flex items-center justify-center'>
            <span className='font-bold text-2xl text-blue-900 dark:text-blue-100'>
              {teamSize}
            </span>
          </div>
          <button
            onClick={() => handleTeamSizeChange(1)}
            disabled={teamSize >= 10}
            className='p-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <Plus
              size={16}
              className='text-blue-600 dark:text-blue-300'
            />
          </button>
        </div>
        <p className='text-xs text-blue-700 dark:text-blue-300 text-center'>
          players per team
        </p>
      </div>

      {/* Max Teams  */}
      <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
        <label className='flex items-center gap-2 text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100'>
          <Target size={16} className='text-blue-600' />
          Max Teams
        </label>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <button
            onClick={() => handleMaxTeamsChange(-1)}
            disabled={maxTeams <= 0}
            className='p-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <Minus
              size={16}
              className='text-blue-600 dark:text-blue-300'
            />
          </button>
          <div className='w-16 h-12 flex items-center justify-center'>
            <span className='font-bold text-2xl text-blue-900 dark:text-blue-100'>
              {maxTeams === 0 ? '∞' : maxTeams}
            </span>
          </div>
          <button
            onClick={() => handleMaxTeamsChange(1)}
            disabled={maxTeams >= 64}
            className='p-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <Plus
              size={16}
              className='text-blue-600 dark:text-blue-300'
            />
          </button>
        </div>
        <p className='text-xs text-blue-700 dark:text-blue-300 text-center'>
          {maxTeams === 0 ? 'no limit' : 'teams max'}
        </p>
      </div>
    </div>
  );
}
