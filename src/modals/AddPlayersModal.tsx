import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface PlayerForm {
  playerName: string;
  skillLevel: string;
}

interface BulkPlayerForm {
  playerList: string;
  defaultSkillLevel: string;
}

interface AddPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPlayersModal({
  isOpen,
  onClose,
}: AddPlayersModalProps) {
  const {
    players,
    addPlayer,
    skillBalancingEnabled,
    skillCategories,
    reservePlayersEnabled,
  } = useStore();

  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [addAsReserve, setAddAsReserve] = useState(false);

  const { register, handleSubmit, reset, watch } =
    useForm<PlayerForm>({
      defaultValues: { skillLevel: skillCategories[0]?.id || '' },
    });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { errors: bulkErrors },
  } = useForm<BulkPlayerForm>({
    defaultValues: {
      defaultSkillLevel: skillCategories[0]?.id || '',
    },
  });

  const selectedSkillLevel = watch('skillLevel');

  const onSubmit = (data: PlayerForm) => {
    if (data.playerName.trim()) {
      if (skillBalancingEnabled && data.skillLevel) {
        addPlayer(
          data.playerName.trim(),
          data.skillLevel,
          addAsReserve
        );
      } else {
        addPlayer(data.playerName.trim(), undefined, addAsReserve);
      }
      reset({ playerName: '', skillLevel: data.skillLevel });
      onClose();
    }
  };

  const onBulkSubmit = (data: BulkPlayerForm) => {
    const playerNames = data.playerList
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (playerNames.length > 0) {
      playerNames.forEach((name) => {
        if (
          !players.some(
            (player) =>
              player.name.toLowerCase() === name.toLowerCase()
          )
        ) {
          if (skillBalancingEnabled && data.defaultSkillLevel) {
            addPlayer(name, data.defaultSkillLevel, addAsReserve);
          } else {
            addPlayer(name, undefined, addAsReserve);
          }
        }
      });
      resetBulk();
      onClose();
    }
  };

  const handleClose = useCallback(() => {
    reset();
    resetBulk();
    setAddAsReserve(false);
    onClose();
  }, [reset, resetBulk, onClose]);

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
          <h2 className='text-xl font-bold'>Add Players</h2>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6'>
          {/* Mode Toggle */}
          <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6'>
            <button
              onClick={() => setAddMode('single')}
              className={clsx(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                addMode === 'single'
                  ? 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              Single Player
            </button>
            <button
              onClick={() => setAddMode('bulk')}
              className={clsx(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                addMode === 'bulk'
                  ? 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              Bulk Add
            </button>
          </div>

          {/* Reserve Player Toggle */}
          {reservePlayersEnabled && (
            <div className='mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <UserCheck size={16} className='text-orange-600' />
                  <span className='text-sm font-medium text-orange-900 dark:text-orange-100'>
                    Add as Reserve Player
                  </span>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={addAsReserve}
                    onChange={(e) =>
                      setAddAsReserve(e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600'></div>
                </label>
              </div>
              <p className='text-xs text-orange-700 dark:text-orange-300 mt-2'>
                Reserve players won't be assigned to teams
                automatically and can be promoted later.
              </p>
            </div>
          )}

          {addMode === 'single' ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-4'
            >
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

              {skillBalancingEnabled &&
                skillCategories.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                      Skill Category
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
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
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            )}
                            style={
                              selectedSkillLevel === category.id
                                ? { backgroundColor: category.color }
                                : {}
                            }
                          >
                            <div
                              className='w-3 h-3 rounded-full flex-shrink-0'
                              style={{
                                backgroundColor: category.color,
                              }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              <div className='flex gap-3 pt-4'>
                <button
                  type='submit'
                  className='btn-primary flex-1 flex items-center justify-center gap-2'
                >
                  <Plus size={16} />
                  Add Player
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
          ) : (
            <form
              onSubmit={handleSubmitBulk(onBulkSubmit)}
              className='space-y-4'
            >
              <div>
                <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                  Player Names
                </label>
                <textarea
                  {...registerBulk('playerList', {
                    required: 'Please enter at least one player name',
                    validate: (value) => {
                      const names = value
                        .split('\n')
                        .filter((name) => name.trim().length > 0);
                      return (
                        names.length > 0 ||
                        'Please enter at least one player name'
                      );
                    },
                  })}
                  className='input-field w-full min-h-[150px] resize-none'
                  placeholder='Enter player names (one per line)&#10;John Doe&#10;Jane Smith&#10;Mike Johnson'
                  autoFocus
                />
                {bulkErrors.playerList && (
                  <p className='text-red-500 text-sm mt-1'>
                    {bulkErrors.playerList.message}
                  </p>
                )}
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                  Enter one player name per line. Duplicate names will
                  be skipped.
                </p>
              </div>

              {skillBalancingEnabled &&
                skillCategories.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                      Default Skill Category
                    </label>
                    <select
                      {...registerBulk('defaultSkillLevel')}
                      className='input-field w-full'
                    >
                      {skillCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                      All players will be assigned this skill
                      category.
                    </p>
                  </div>
                )}

              <div className='flex gap-3 pt-4'>
                <button
                  type='submit'
                  className='btn-primary flex-1 flex items-center justify-center gap-2'
                >
                  <Plus size={16} />
                  Add All Players
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
          )}
        </div>
      </div>
    </div>
  );
}
