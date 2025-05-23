import React from 'react';
import { X, Lock, Unlock, UserPlus, Hash, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface PlayerForm {
  playerName: string;
}

const PlayerManager: React.FC = () => {
  const {
    players,
    addPlayer,
    removePlayer,
    togglePlayerLock,
    teamSize,
    setTeamSize,
  } = useStore();

  const { register, handleSubmit, reset } = useForm<PlayerForm>();

  const onSubmit = (data: PlayerForm) => {
    if (data.playerName.trim()) {
      addPlayer(data.playerName.trim());
      reset();
    }
  };

  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.1s' }}
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <UserPlus className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Players</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='mb-6'>
        <div className='flex gap-2'>
          <input
            {...register('playerName', { required: true })}
            className='input-field flex-1'
            placeholder='Enter player name'
          />
          <button type='submit' className='btn-primary px-8'>
            Add
          </button>
        </div>
      </form>

      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
        <label className='flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300'>
          <Hash size={16} />
          Team Size
        </label>
        <div className='flex items-center gap-4'>
          <input
            type='number'
            min='1'
            max='10'
            value={teamSize}
            onChange={(e) =>
              setTeamSize(parseInt(e.target.value) || 2)
            }
            className='input-field w-24 text-center font-bold text-lg'
          />
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            players per team
          </span>
        </div>
      </div>

      <div className='space-y-2 max-h-80 overflow-y-auto scrollbar-custom pr-2'>
        {players.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            <Users size={48} className='mx-auto mb-3 opacity-30' />
            <p className='font-medium'>No players added yet</p>
            <p className='text-sm mt-1'>
              Add players to start creating teams
            </p>
          </div>
        ) : (
          players.map((player, index) => (
            <div
              key={player.id}
              className={clsx(
                'flex items-center justify-between p-3.5 rounded-xl group transition-all duration-200 animate-slide-up',
                player.locked
                  ? 'bg-gradient-to-r from-primary/10 to-rose-500/10 border border-primary/20'
                  : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              style={{
                animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
              }}
            >
              <div className='flex items-center gap-3'>
                <span className='text-sm font-bold text-gray-400 dark:text-gray-500 w-8'>
                  #{index + 1}
                </span>
                <span
                  className={clsx(
                    'font-medium',
                    player.locked && 'text-primary font-semibold'
                  )}
                >
                  {player.name}
                </span>
                {player.locked && (
                  <span className='text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold'>
                    LOCKED
                  </span>
                )}
              </div>

              <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  onClick={() => togglePlayerLock(player.id)}
                  className={clsx(
                    'p-2 rounded-lg transition-all duration-200',
                    player.locked
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                  title={
                    player.locked ? 'Unlock player' : 'Lock player'
                  }
                >
                  {player.locked ? (
                    <Lock size={16} />
                  ) : (
                    <Unlock size={16} />
                  )}
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                           rounded-lg transition-all duration-200 disabled:opacity-50'
                  disabled={player.locked}
                  title='Remove player'
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {players.length > 0 && (
        <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Total Players
            </p>
            <p className='text-2xl font-bold'>{players.length}</p>
          </div>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Locked Players
            </p>
            <p className='text-2xl font-bold text-primary'>
              {players.filter((p) => p.locked).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
