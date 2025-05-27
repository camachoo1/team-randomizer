import { useEffect, useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  UserPlus,
  Hash,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  Award,
  ToggleLeft,
  ToggleRight,
  Settings,
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';
import AddPlayersModal from '../modals/AddPlayersModal';
import SkillSettingsModal from '../modals/SkillSettingsModal';

const PlayerManager: React.FC = () => {
  const {
    players,
    removePlayer,
    togglePlayerLock,
    teamSize,
    setTeamSize,
    clearTeams,
    skillBalancingEnabled,
    toggleSkillBalancing,
    skillCategories,
    teamCompositionRules,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSkillSettings, setShowSkillSettings] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearConfirm) {
        setShowClearConfirm(false);
      }
    };

    if (showClearConfirm) {
      document.addEventListener('keydown', handleEscape);
      return () =>
        document.removeEventListener('keydown', handleEscape);
    }
  }, [showClearConfirm]);

  const handleClearAllPlayers = () => {
    players.forEach((p) => removePlayer(p.id));
    clearTeams();
    setShowClearConfirm(false);
  };

  const getSkillCategoryInfo = (skillCategoryId?: string) => {
    return skillCategories.find((cat) => cat.id === skillCategoryId);
  };

  const getSkillCategoryCounts = () => {
    return skillCategories.map((category) => ({
      ...category,
      count: players.filter((p) => p.skillLevel === category.id)
        .length,
    }));
  };

  return (
    <>
      <div
        className='card animate-fade-in'
        style={{ animationDelay: '0.1s' }}
      >
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <UserPlus className='text-primary' size={22} />
          </div>
          <h2 className='text-xl font-bold'>Players</h2>
          <div className='ml-auto flex gap-2'>
            <button
              onClick={() => setShowAddModal(true)}
              className='btn-primary flex items-center gap-2 px-4'
            >
              <Plus size={16} />
              Add Players
            </button>
            {players.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className='p-2 rounded-lg transition-all duration-200 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600'
                title='Clear all players'
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Skill Balancing Toggle - Simplified */}
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Award size={20} className='text-blue-600' />
              <div>
                <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                  Skill Balancing
                </h3>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {skillBalancingEnabled
                    ? `Enabled with ${skillCategories.length} categories`
                    : 'Standard randomization'}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              {skillBalancingEnabled && (
                <button
                  onClick={() => setShowSkillSettings(true)}
                  className='p-2 rounded-lg transition-all duration-200 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  title='Configure skill settings'
                >
                  <Settings size={18} />
                </button>
              )}
              <button
                onClick={toggleSkillBalancing}
                className={clsx(
                  'p-1 rounded-lg transition-all duration-200',
                  skillBalancingEnabled
                    ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title={
                  skillBalancingEnabled
                    ? 'Disable skill balancing'
                    : 'Enable skill balancing'
                }
              >
                {skillBalancingEnabled ? (
                  <ToggleRight size={32} />
                ) : (
                  <ToggleLeft size={32} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Team Size */}
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
                setTeamSize(parseInt(e.target.value) || 1)
              }
              className='input-field w-24 text-center font-bold text-lg rounded-lg'
            />
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              players per team
            </span>
          </div>
        </div>

        {/* Current Distribution */}
        {skillBalancingEnabled &&
          players.length > 0 &&
          skillCategories.length > 0 && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl'>
              <div className='flex items-center gap-2 mb-3'>
                <Award size={16} className='text-blue-600' />
                <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                  Current Distribution
                </h3>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {getSkillCategoryCounts().map((category) => (
                  <div
                    key={category.id}
                    className='text-center p-3 bg-white dark:bg-gray-800 rounded-lg'
                  >
                    <div
                      className='w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold shadow-sm'
                      style={{ backgroundColor: category.color }}
                    >
                      {category.count}
                    </div>
                    <p
                      className='text-xs text-gray-600 dark:text-gray-400 font-medium truncate mb-1'
                      title={category.name}
                    >
                      {category.name}
                    </p>
                    {teamCompositionRules[category.id] && (
                      <p className='text-xs text-blue-600 font-semibold'>
                        {teamCompositionRules[category.id]} per team
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Player List */}
        <div className='space-y-2 max-h-80 overflow-y-auto scrollbar-custom pr-2'>
          {players.length === 0 ? (
            <div className='text-center py-12 text-gray-400'>
              <Users size={48} className='mx-auto mb-3 opacity-30' />
              <p className='font-medium'>No players added yet</p>
              <p className='text-sm mt-1'>
                Click "Add Players" to get started
              </p>
            </div>
          ) : (
            players.map((player, index) => {
              const skillInfo =
                skillBalancingEnabled && player.skillLevel
                  ? getSkillCategoryInfo(player.skillLevel)
                  : null;

              return (
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
                    {skillInfo && (
                      <div
                        className='w-3 h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: skillInfo.color }}
                        title={skillInfo.name}
                      />
                    )}
                    <span
                      className={clsx(
                        'font-medium',
                        player.locked && 'text-primary font-semibold'
                      )}
                    >
                      {player.name}
                    </span>
                    {skillInfo && (
                      <span
                        className='text-xs px-2 py-0.5 rounded-full font-medium text-white'
                        style={{
                          backgroundColor: skillInfo.color + '80',
                        }}
                      >
                        {skillInfo.name}
                      </span>
                    )}
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
                        player.locked
                          ? 'Unlock player'
                          : 'Lock player'
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
              );
            })
          )}
        </div>

        {/* Stats */}
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4'>
            <div className='flex gap-3 mb-4'>
              <AlertCircle
                className='text-red-600 flex-shrink-0 mt-0.5'
                size={20}
              />
              <div>
                <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                  Clear all players?
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  This will remove all {players.length} players and
                  clear all teams.
                </p>
              </div>
            </div>
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='btn-ghost'
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllPlayers}
                className='btn-danger'
              >
                Clear Players
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPlayersModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <SkillSettingsModal
        isOpen={showSkillSettings}
        onClose={() => setShowSkillSettings(false)}
      />
    </>
  );
};

export default PlayerManager;
