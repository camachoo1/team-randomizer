import {
  Award,
  UserCheck,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

interface FeatureTogglesProps {
  onShowSkillSettings: () => void;
}

export default function FeatureToggles({
  onShowSkillSettings,
}: FeatureTogglesProps) {
  const {
    players,
    skillBalancingEnabled,
    toggleSkillBalancing,
    skillCategories,
    reservePlayersEnabled,
    toggleReserveMode,
  } = useStore();

  const reservePlayers = players.filter((p) => p.isReserve);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
      {/* Skill Balancing Toggle */}
      <div className='p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Award size={18} className='text-blue-600' />
            <div>
              <h3 className='font-semibold text-blue-900 dark:text-blue-100 text-sm'>
                Skill Balancing
              </h3>
              <p className='text-xs text-blue-700 dark:text-blue-300'>
                {skillBalancingEnabled
                  ? `${skillCategories.length} categories`
                  : 'Disabled'}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            {skillBalancingEnabled && (
              <button
                onClick={onShowSkillSettings}
                className='p-1.5 rounded-lg transition-all duration-200 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                title='Configure skill settings'
              >
                <Settings size={16} />
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
            >
              {skillBalancingEnabled ? (
                <ToggleRight size={24} />
              ) : (
                <ToggleLeft size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reserve Players Toggle */}
      <div className='p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <UserCheck size={18} className='text-green-600' />
            <div>
              <h3 className='font-semibold text-green-900 dark:text-green-100 text-sm'>
                Reserve Players
              </h3>
              <p className='text-xs text-green-700 dark:text-green-300'>
                {reservePlayersEnabled
                  ? `${reservePlayers.length} reserves`
                  : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleReserveMode}
            className={clsx(
              'p-1 rounded-lg transition-all duration-200',
              reservePlayersEnabled
                ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {reservePlayersEnabled ? (
              <ToggleRight size={24} />
            ) : (
              <ToggleLeft size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
