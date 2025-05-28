import { useCallback, useEffect } from 'react';
import { X, Save, Award, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import clsx from 'clsx';
import { Player } from '../types';

interface EditPlayerForm {
  playerName: string;
  skillLevel: string;
  isReserve: boolean;
}

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
}

export default function EditPlayerModal({
  isOpen,
  onClose,
  player,
}: EditPlayerModalProps) {
  const {
    updatePlayer,
    skillBalancingEnabled,
    skillCategories,
    reservePlayersEnabled,
    players,
    teamSize,
    maxTeams,
  } = useStore();

  const { register, handleSubmit, reset, watch } =
    useForm<EditPlayerForm>({
      defaultValues: {
        playerName: '',
        skillLevel: '',
        isReserve: false,
      },
    });

  const selectedSkillLevel = watch('skillLevel');
  const isReserveChecked = watch('isReserve');

  // Calculate capacity
  const activePlayers = players.filter((p) => !p.isReserve);
  const maxActiveSlots =
    maxTeams > 0 ? maxTeams * teamSize : Infinity;
  const currentCapacity = activePlayers.length;

  // Check if promoting this specific player would exceed capacity
  const wouldExceedCapacity =
    player?.isReserve &&
    !isReserveChecked &&
    currentCapacity >= maxActiveSlots;

  // Reset form when player changes or modal opens
  useEffect(() => {
    if (isOpen && player) {
      reset({
        playerName: player.name,
        skillLevel: player.skillLevel || '',
        isReserve: player.isReserve || false,
      });
    }
  }, [isOpen, player, reset]);

  const onSubmit = (data: EditPlayerForm) => {
    if (player && data.playerName.trim()) {
      // Check capacity before allowing reserve to active promotion
      if (
        player.isReserve &&
        !data.isReserve &&
        wouldExceedCapacity
      ) {
        alert(
          'Cannot promote player: Teams are at full capacity. Remove an active player first.'
        );
        return;
      }

      updatePlayer(player.id, {
        name: data.playerName.trim(),
        skillLevel:
          skillBalancingEnabled && data.skillLevel
            ? data.skillLevel
            : undefined,
        isReserve: reservePlayersEnabled ? data.isReserve : false,
      });
      onClose();
    }
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

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

  if (!isOpen || !player) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-bold'>Edit Player</h2>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='p-6 space-y-6'
        >
          {/* Player Name */}
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
              Player Name
            </label>
            <input
              {...register('playerName', { required: true })}
              className='input-field w-full'
              placeholder='Enter player name'
              autoFocus
            />
          </div>

          {/* Skill Category */}
          {skillBalancingEnabled && skillCategories.length > 0 && (
            <div>
              <label className='block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300'>
                <Award size={16} className='inline mr-1' />
                Skill Category
              </label>
              <div className='space-y-2'>
                {/* No Skill Level Option */}
                <label className='cursor-pointer'>
                  <input
                    {...register('skillLevel')}
                    type='radio'
                    value=''
                    className='sr-only'
                  />
                  <div
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium',
                      selectedSkillLevel === ''
                        ? 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    )}
                  >
                    No skill category
                  </div>
                </label>

                {/* Skill Categories */}
                <div className='grid grid-cols-1 gap-2'>
                  {skillCategories.map((category) => (
                    <label
                      key={category.id}
                      className='cursor-pointer'
                    >
                      <input
                        {...register('skillLevel')}
                        type='radio'
                        value={category.id}
                        className='sr-only'
                      />
                      <div
                        className={clsx(
                          'p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2',
                          selectedSkillLevel === category.id
                            ? 'text-white border-transparent shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        )}
                        style={
                          selectedSkillLevel === category.id
                            ? { backgroundColor: category.color }
                            : {}
                        }
                      >
                        <div
                          className='w-3 h-3 rounded-full flex-shrink-0'
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reserve Status */}
          {reservePlayersEnabled && (
            <div className='p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <UserCheck size={16} className='text-orange-600' />
                  <span className='text-sm font-medium text-orange-900 dark:text-orange-100'>
                    Reserve Player
                  </span>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    {...register('isReserve')}
                    type='checkbox'
                    className='sr-only peer'
                    disabled={wouldExceedCapacity}
                  />
                  <div
                    className={clsx(
                      'w-11 h-6 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600',
                      wouldExceedCapacity
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:bg-orange-600'
                    )}
                  />
                </label>
              </div>
              <p className='text-xs text-orange-700 dark:text-orange-300 mt-2'>
                Reserve players won't be assigned to teams
                automatically.
              </p>
              {wouldExceedCapacity && (
                <div className='mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300'>
                  ⚠️ Cannot promote: Teams are at full capacity (
                  {currentCapacity}/{maxActiveSlots} slots used)
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              className='btn-primary flex-1 flex items-center justify-center gap-2'
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              type='button'
              onClick={handleClose}
              className='btn-ghost px-6'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
