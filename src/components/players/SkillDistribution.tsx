import { useState } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import useStore from '../../store/useStore';

export default function SkillDistribution() {
  const {
    players,
    skillBalancingEnabled,
    skillCategories,
    teamCompositionRules,
  } = useStore();

  const [showSkillDistribution, setShowSkillDistribution] =
    useState(false);

  const getSkillCategoryCounts = () => {
    const activePlayers = players.filter((p) => !p.isReserve);
    return skillCategories.map((category) => ({
      ...category,
      count: activePlayers.filter((p) => p.skillLevel === category.id)
        .length,
    }));
  };

  const activePlayers = players.filter((p) => !p.isReserve);

  // Don't render if skill balancing is disabled or no relevant data
  if (
    !skillBalancingEnabled ||
    activePlayers.length === 0 ||
    skillCategories.length === 0
  ) {
    return null;
  }

  return (
    <div className='mb-6'>
      <button
        onClick={() =>
          setShowSkillDistribution(!showSkillDistribution)
        }
        className='w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
      >
        <div className='flex items-center gap-2'>
          <Award size={16} className='text-blue-600' />
          <span className='font-semibold text-blue-900 dark:text-blue-100 text-sm'>
            Skill Distribution
          </span>
        </div>
        {showSkillDistribution ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {showSkillDistribution && (
        <div className='mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {getSkillCategoryCounts().map((category) => (
              <div
                key={category.id}
                className='text-center p-3 bg-white dark:bg-gray-800 rounded-lg'
              >
                <div
                  className='w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold shadow-sm'
                  style={{ backgroundColor: category.color }}
                >
                  {category.count}
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400 font-medium truncate mb-1'>
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
    </div>
  );
}
