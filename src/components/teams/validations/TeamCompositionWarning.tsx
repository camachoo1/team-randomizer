import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';
import { SkillCategory } from '../../../types';

interface TeamCompositionWarningProps {
  violations: string[];
  skillDistribution: {
    [categoryId: string]: {
      actual: number;
      required: number;
      categoryName: string;
    };
  };
  skillCategories: SkillCategory[];
}

export const TeamCompositionWarning = ({
  violations,
  skillDistribution,
  skillCategories,
}: TeamCompositionWarningProps) => {
  if (violations.length === 0) return null;

  return (
    <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
      <div className='flex items-start gap-2'>
        <AlertTriangle
          className='text-red-500 flex-shrink-0 mt-0.5'
          size={16}
        />
        <div className='flex-1'>
          <p className='text-sm font-medium text-red-800 dark:text-red-200 mb-2'>
            Team composition issues:
          </p>

          {/* Detailed breakdown */}
          <div className='space-y-2'>
            {Object.entries(skillDistribution).map(
              ([categoryId, info]) => {
                const category = skillCategories.find(
                  (c) => c.id === categoryId
                );
                const isOver = info.actual > info.required;
                const isUnder = info.actual < info.required;
                const isCorrect = info.actual === info.required;

                return (
                  <div
                    key={categoryId}
                    className='flex items-center justify-between text-xs'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{
                          backgroundColor: category?.color || '#666',
                        }}
                      />
                      <span className='font-medium text-red-700 dark:text-red-300'>
                        {info.categoryName}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        isCorrect &&
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                        isOver &&
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
                        isUnder &&
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                      )}
                    >
                      {info.actual} / {info.required}
                      {isOver && ` (+${info.actual - info.required})`}
                      {isUnder &&
                        ` (-${info.required - info.actual})`}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Summary violations */}
          <div className='mt-2 pt-2 border-t border-red-200 dark:border-red-700'>
            <ul className='text-xs text-red-700 dark:text-red-300 space-y-1'>
              {violations.map((violation, idx) => (
                <li key={idx} className='flex items-center gap-1'>
                  <span className='w-1 h-1 bg-red-500 rounded-full flex-shrink-0' />
                  {violation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
