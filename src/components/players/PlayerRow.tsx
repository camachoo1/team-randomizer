import { X, Lock, Unlock, UserX, ArrowUp, Edit2 } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';
import { Player } from '../../types';

interface PlayerRowProps {
  player: Player;
  index: number;
  type: 'active' | 'reserve';
  onEdit?: (player: Player) => void;
}

export default function PlayerRow({
  player,
  index,
  type,
  onEdit,
}: PlayerRowProps) {
  const {
    removePlayer,
    togglePlayerLock,
    togglePlayerReserve,
    reservePlayersEnabled,
    skillBalancingEnabled,
    skillCategories,
    teamSize,
    maxTeams,
    players,
  } = useStore();

  // Calculate capacity for reserves
  const activePlayers = players.filter((p) => !p.isReserve);
  const maxActiveSlots =
    maxTeams > 0 ? maxTeams * teamSize : Infinity;
  const isAtCapacity = activePlayers.length >= maxActiveSlots;

  const getSkillCategoryInfo = (skillCategoryId?: string) => {
    return skillCategories.find((cat) => cat.id === skillCategoryId);
  };

  const skillInfo =
    skillBalancingEnabled && player.skillLevel
      ? getSkillCategoryInfo(player.skillLevel)
      : null;

  const isReserve = type === 'reserve';
  const displayIndex = isReserve ? `R${index + 1}` : `#${index + 1}`;

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-3 rounded-lg group transition-all duration-200',
        isReserve
          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
          : player.locked
          ? 'bg-gradient-to-r from-primary/10 to-rose-500/10 border border-primary/20'
          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <div className='flex items-center gap-3 flex-1 min-w-0'>
        <span
          className={clsx(
            'text-sm font-bold w-6',
            isReserve
              ? 'text-orange-400 dark:text-orange-500'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {displayIndex}
        </span>

        {skillInfo && (
          <div
            className='w-3 h-3 rounded-full flex-shrink-0'
            style={{ backgroundColor: skillInfo.color }}
            title={skillInfo.name}
          />
        )}

        <span
          className={clsx(
            'font-medium truncate',
            isReserve
              ? 'text-orange-900 dark:text-orange-100'
              : player.locked && 'text-primary font-semibold'
          )}
        >
          {player.name}
        </span>

        {isReserve ? (
          <span className='text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full font-semibold'>
            RESERVE
          </span>
        ) : (
          player.locked && (
            <span className='text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold'>
              LOCKED
            </span>
          )
        )}
      </div>

      <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        {/* Edit button - always available */}
        <button
          onClick={() => onEdit?.(player)}
          className='p-1.5 rounded-lg transition-all duration-200 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
          title='Edit player'
        >
          <Edit2 size={14} />
        </button>

        {isReserve ? (
          // Reserve player actions
          <>
            <button
              onClick={() => togglePlayerReserve(player.id)}
              disabled={isAtCapacity}
              className={clsx(
                'p-1.5 rounded-lg transition-all duration-200',
                isAtCapacity
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
              )}
              title={
                isAtCapacity
                  ? 'Teams are at full capacity'
                  : 'Promote to active player'
              }
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => removePlayer(player.id)}
              className='p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                       rounded-lg transition-all duration-200'
              title='Remove player'
            >
              <X size={14} />
            </button>
          </>
        ) : (
          // Active player actions
          <>
            {reservePlayersEnabled && (
              <button
                onClick={() => togglePlayerReserve(player.id)}
                className='p-1.5 rounded-lg transition-all duration-200 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                title='Move to reserves'
              >
                <UserX size={14} />
              </button>
            )}
            <button
              onClick={() => togglePlayerLock(player.id)}
              className={clsx(
                'p-1.5 rounded-lg transition-all duration-200',
                player.locked
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
              title={player.locked ? 'Unlock player' : 'Lock player'}
            >
              {player.locked ? (
                <Lock size={14} />
              ) : (
                <Unlock size={14} />
              )}
            </button>
            <button
              onClick={() => removePlayer(player.id)}
              className='p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                       rounded-lg transition-all duration-200 disabled:opacity-50'
              disabled={player.locked}
              title='Remove player'
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
