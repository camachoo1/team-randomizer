import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit3, Check, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface SkillCategoryForm {
  categoryName: string;
  categoryColor: string;
}

interface SkillSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultColors = [
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#6366F1',
  '#84CC16',
  '#F97316',
  '#6B7280',
];

const SkillSettingsModal: React.FC<SkillSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    skillCategories,
    addSkillCategory,
    removeSkillCategory,
    updateSkillCategory,
    teamCompositionRules,
    updateTeamCompositionRules,
    teamSize,
    teamNamingCategoryId,
    updateTeamNamingCategory,
  } = useStore();

  const [editingCategoryId, setEditingCategoryId] = useState<
    string | null
  >(null);

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: categoryErrors },
  } = useForm<SkillCategoryForm>();

  const onCategorySubmit = (data: SkillCategoryForm) => {
    if (data.categoryName.trim()) {
      addSkillCategory(data.categoryName.trim(), data.categoryColor);
      resetCategory();
    }
  };

  const handleEditCategory = (
    categoryId: string,
    newName: string
  ) => {
    if (newName.trim()) {
      updateSkillCategory(categoryId, newName.trim());
    }
    setEditingCategoryId(null);
  };

  const handleCompositionRuleChange = (
    categoryId: string,
    count: number
  ) => {
    const newRules = { ...teamCompositionRules };
    if (count <= 0) {
      delete newRules[categoryId];
    } else {
      newRules[categoryId] = Math.max(0, Math.min(count, teamSize));
    }
    updateTeamCompositionRules(newRules);
  };

  const getRandomColor = () => {
    const usedColors = skillCategories.map((cat) => cat.color);
    const availableColors = defaultColors.filter(
      (color) => !usedColors.includes(color)
    );
    return availableColors.length > 0
      ? availableColors[
          Math.floor(Math.random() * availableColors.length)
        ]
      : defaultColors[
          Math.floor(Math.random() * defaultColors.length)
        ];
  };

  const getTotalRuleCount = () => {
    return Object.values(teamCompositionRules).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const isValidComposition = () => {
    const totalRuleCount = getTotalRuleCount();
    return totalRuleCount <= teamSize;
  };

  const handleClose = useCallback(() => {
    setEditingCategoryId(null);
    resetCategory();
    onClose();
  }, [setEditingCategoryId, resetCategory, onClose]);

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
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-bold'>
            Skill Balancing Settings
          </h2>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-8'>
          {/* Manage Categories */}
          <div>
            <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
              Manage Skill Categories
            </h3>

            <form
              onSubmit={handleSubmitCategory(onCategorySubmit)}
              className='flex gap-2 mb-6'
            >
              <input
                {...registerCategory('categoryName', {
                  required: 'Category name is required',
                  validate: (value) => {
                    const exists = skillCategories.some(
                      (cat) =>
                        cat.name.toLowerCase() === value.toLowerCase()
                    );
                    return !exists || 'Category already exists';
                  },
                })}
                className='input-field flex-1'
                placeholder='New category name (e.g., Professional, Beginner)'
              />
              <input
                {...registerCategory('categoryColor')}
                type='color'
                defaultValue={getRandomColor()}
                className='w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer'
                title='Choose category color'
              />
              <button
                type='submit'
                className='btn-primary px-4 flex items-center gap-2'
              >
                <Plus size={16} />
                Add
              </button>
            </form>

            {categoryErrors.categoryName && (
              <p className='text-red-500 text-sm mb-4'>
                {categoryErrors.categoryName.message}
              </p>
            )}

            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {skillCategories.map((category) => (
                <div
                  key={category.id}
                  className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
                >
                  <div
                    className='w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm'
                    style={{ backgroundColor: category.color }}
                  />
                  {editingCategoryId === category.id ? (
                    <div className='flex-1 flex gap-2'>
                      <input
                        defaultValue={category.name}
                        className='input-field flex-1 py-2'
                        autoFocus
                        onBlur={(e) =>
                          handleEditCategory(
                            category.id,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory(
                              category.id,
                              e.currentTarget.value
                            );
                          } else if (e.key === 'Escape') {
                            setEditingCategoryId(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className='p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors'
                        title='Save changes'
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className='flex-1 font-medium text-gray-900 dark:text-gray-100'>
                        {category.name}
                      </span>
                      <button
                        onClick={() =>
                          setEditingCategoryId(category.id)
                        }
                        className='p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors'
                        title='Edit category name'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          removeSkillCategory(category.id)
                        }
                        className='p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={skillCategories.length <= 1}
                        title={
                          skillCategories.length <= 1
                            ? 'Cannot delete the last category'
                            : 'Delete category'
                        }
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Composition Rules */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Target size={20} className='text-blue-600' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Team Composition Rules
              </h3>
            </div>

            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-sm text-blue-800 dark:text-blue-200 mb-2'>
                <strong>How it works:</strong> Set how many players
                from each skill category should be on each team.
              </p>
              <ul className='text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc'>
                <li>
                  Set to 0 or leave blank for no restriction on that
                  category
                </li>
                <li>
                  Remaining spots will be filled with any available
                  players
                </li>
                <li>
                  Example: 1 Expert + 2 Intermediate + 1 Beginner =
                  4-person teams
                </li>
              </ul>
            </div>

            <div className='space-y-3'>
              {skillCategories.map((category) => (
                <div
                  key={category.id}
                  className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm'
                      style={{ backgroundColor: category.color }}
                    />
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      {category.name}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max={teamSize}
                      value={teamCompositionRules[category.id] || 0}
                      onChange={(e) =>
                        handleCompositionRuleChange(
                          category.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='input-field w-20 text-center py-2'
                      placeholder='0'
                    />
                    <span className='text-sm text-gray-500 dark:text-gray-400 min-w-[60px]'>
                      per team
                    </span>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className='border-t border-gray-200 dark:border-gray-600 pt-4 mt-6'>
                <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Total players specified per team:
                    </span>
                    <span
                      className={clsx(
                        'text-lg font-bold',
                        isValidComposition()
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {getTotalRuleCount()} / {teamSize}
                    </span>
                  </div>

                  {!isValidComposition() && (
                    <div className='mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                      <p className='text-red-700 dark:text-red-300 text-sm font-medium'>
                        ⚠️ Total specified players (
                        {getTotalRuleCount()}) exceeds team size (
                        {teamSize})
                      </p>
                    </div>
                  )}

                  <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                    <p>
                      <strong>Remaining spots per team:</strong>{' '}
                      {Math.max(0, teamSize - getTotalRuleCount())}
                    </p>
                    <p>
                      These will be filled with any available players
                      regardless of skill category.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Naming Options */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Team Naming
            </h3>

            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <label className='flex items-start gap-3 cursor-pointer'>
                  <input
                    type='radio'
                    name='teamNaming'
                    checked={!teamNamingCategoryId}
                    onChange={() => updateTeamNamingCategory(null)}
                    className='mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2'
                  />
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Standard naming
                    </span>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Teams will be named "Team 1", "Team 2", etc.
                    </p>
                  </div>
                </label>
              </div>

              <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <label className='flex items-start gap-3 cursor-pointer mb-3'>
                  <input
                    type='radio'
                    name='teamNaming'
                    checked={!!teamNamingCategoryId}
                    onChange={() => {
                      if (
                        !teamNamingCategoryId &&
                        skillCategories.length > 0
                      ) {
                        updateTeamNamingCategory(
                          skillCategories[0].id
                        );
                      }
                    }}
                    className='mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2'
                  />
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Name after skill category
                    </span>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Teams will be named after a player from the
                      selected category
                    </p>
                  </div>
                </label>

                {teamNamingCategoryId && (
                  <div className='ml-7 space-y-2'>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Select category for team naming:
                    </p>
                    <div className='grid grid-cols-1 gap-2'>
                      {skillCategories.map((category) => (
                        <label
                          key={category.id}
                          className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='namingCategory'
                            checked={
                              teamNamingCategoryId === category.id
                            }
                            onChange={() =>
                              updateTeamNamingCategory(category.id)
                            }
                            className='w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2'
                          />
                          <div
                            className='w-4 h-4 rounded-full flex-shrink-0'
                            style={{
                              backgroundColor: category.color,
                            }}
                          />
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                      <p className='text-xs text-blue-700 dark:text-blue-300'>
                        <strong>Example:</strong> If you select
                        "Professional" and John is the first
                        professional player on a team, the team will
                        be named "Team John".
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <button onClick={handleClose} className='btn-ghost px-6'>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSettingsModal;
