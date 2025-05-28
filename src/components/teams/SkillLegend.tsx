import { Award } from 'lucide-react';
import { SkillCategory } from '../../types';

interface SkillLegendProps {
  skillBalancingEnabled: boolean;
  skillCategories: SkillCategory[];
  showLegend: boolean;
}

export default function SkillLegend({
  skillBalancingEnabled,
  skillCategories,
  showLegend,
}: SkillLegendProps) {
  if (
    !skillBalancingEnabled ||
    skillCategories.length === 0 ||
    !showLegend
  ) {
    return null;
  }

  return (
    <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
      <div className='flex items-center gap-2 mb-3'>
        <Award size={16} className='text-blue-600' />
        <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
          Skill Categories Legend
        </h3>
      </div>
      <div className='flex flex-wrap gap-3'>
        {skillCategories.map((category) => (
          <div
            key={category.id}
            className='flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full'
          >
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: category.color }}
            />
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
