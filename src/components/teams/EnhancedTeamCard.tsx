import clsx from 'clsx';
import { Edit2, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { Team, Player } from '../../types';
import { validateTeamComposition } from '../../utils/helper';
import PlayerCard from './PlayerCard';
import {
  ValidationStatus,
  TeamCompositionWarning,
} from './validations';

interface EnhancedTeamCardProps {
  team: Team;
  teamIndex: number;
  dragOverTeam: number | null;
  editingTeamId: number | null;
  manualTeamMode: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (
    e: React.DragEvent<HTMLDivElement>,
    teamIndex: number
  ) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (
    e: React.DragEvent<HTMLDivElement>,
    teamIndex: number
  ) => void;
  onTeamNameEdit: (teamId: number, newName: string) => void;
  onRemoveTeam: (teamId: number) => void;
  onEditTeam: (teamId: number) => void;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    playerId: number
  ) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const EnhancedTeamCard = ({
  team,
  teamIndex,
  dragOverTeam,
  editingTeamId,
  manualTeamMode,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onTeamNameEdit,
  onRemoveTeam,
  onEditTeam,
  onDragStart,
  onDragEnd,
}: EnhancedTeamCardProps) => {
  const {
    players,
    skillCategories,
    teamCompositionRules,
    skillBalancingEnabled,
  } = useStore();

  const validation = validateTeamComposition(
    team,
    players,
    skillCategories,
    teamCompositionRules,
    skillBalancingEnabled
  );

  // Get skill category counts for display
  const getTeamSkillDistribution = (teamPlayers: Player[]) => {
    if (!skillBalancingEnabled || skillCategories.length === 0)
      return null;

    const distribution = skillCategories
      .map((category) => ({
        ...category,
        count: teamPlayers.filter((p) => {
          const playerData = players.find((pd) => pd.id === p.id);
          return playerData?.skillLevel === category.id;
        }).length,
      }))
      .filter((cat) => cat.count > 0);

    return distribution;
  };

  const skillDistribution = getTeamSkillDistribution(team.players);
  const hasValidationIssues =
    !validation.isValid && skillBalancingEnabled;

  return (
    <div
      className={clsx(
        'group relative bg-gradient-to-br transition-all duration-300 rounded-2xl p-6',
        // Validation-based styling
        hasValidationIssues
          ? [
              'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
              'ring-2 ring-red-400 dark:ring-red-600',
              'shadow-red-100 dark:shadow-red-900/20 shadow-lg',
            ]
          : [
              'from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30',
              dragOverTeam === teamIndex
                ? 'ring-4 ring-primary ring-opacity-50 scale-[1.02]'
                : 'hover:shadow-2xl hover:scale-[1.01]',
            ]
      )}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, teamIndex)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, teamIndex)}
    >
      {/* Validation pulse animation overlay for invalid teams */}
      {hasValidationIssues && (
        <div className='absolute inset-0 rounded-2xl border-2 border-red-400 animate-pulse opacity-30 pointer-events-none' />
      )}

      {/* Team Header */}
      <div className='flex items-center justify-between mb-5'>
        {editingTeamId === team.id ? (
          <input
            type='text'
            defaultValue={team.name}
            className={clsx(
              'font-bold text-lg border-2 rounded px-2 py-1 focus:outline-none w-32',
              hasValidationIssues
                ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                : 'bg-white dark:bg-gray-800 border-primary'
            )}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => onTeamNameEdit(team.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onTeamNameEdit(team.id, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                onEditTeam(-1); // Clear editing
              }
            }}
          />
        ) : (
          <h3
            className={clsx(
              'font-bold text-lg flex items-center gap-2 cursor-pointer transition-colors',
              hasValidationIssues
                ? 'text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100'
                : 'hover:text-primary'
            )}
            onClick={() => onEditTeam(team.id)}
          >
            {team.name}
            <Edit2
              size={14}
              className='opacity-0 group-hover:opacity-50'
            />
          </h3>
        )}

        <div className='flex items-center gap-2'>
          {/* Validation Status Indicator */}
          {skillBalancingEnabled &&
            Object.keys(teamCompositionRules).length > 0 && (
              <ValidationStatus
                isValid={validation.isValid}
                violations={validation.violations}
              />
            )}

          <span
            className={clsx(
              'text-xs px-3 py-1 rounded-full font-bold',
              hasValidationIssues
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                : 'bg-primary/10 text-primary'
            )}
          >
            {team.players.length}{' '}
            {team.players.length === 1 ? 'player' : 'players'}
          </span>

          {manualTeamMode && (
            <button
              onClick={() => onRemoveTeam(team.id)}
              className={clsx(
                'p-1 opacity-0 group-hover:opacity-100 transition-all',
                hasValidationIssues
                  ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
                  : 'text-gray-400 hover:text-red-500'
              )}
              title='Remove team'
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Team Composition Warning */}
      {hasValidationIssues && (
        <TeamCompositionWarning
          violations={validation.violations}
          skillDistribution={validation.skillDistribution}
          skillCategories={skillCategories}
        />
      )}

      {/* Skill Distribution */}
      {skillDistribution && skillDistribution.length > 0 && (
        <div className='mb-4 flex flex-wrap gap-1'>
          {skillDistribution.map((skill) => {
            const ruleInfo = validation.skillDistribution[skill.id];
            const hasIssue =
              ruleInfo && ruleInfo.actual !== ruleInfo.required;

            return (
              <div
                key={skill.id}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                  hasIssue
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600'
                    : 'bg-white/50 dark:bg-gray-800/50 border-transparent'
                )}
                title={
                  ruleInfo
                    ? `${skill.name}: ${ruleInfo.actual}/${ruleInfo.required} required`
                    : `${skill.name}: ${skill.count} players`
                }
              >
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: skill.color }}
                />
                <span className='font-medium'>
                  {skill.count}
                  {ruleInfo && (
                    <span
                      className={clsx(
                        'ml-1 text-xs',
                        hasIssue
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500'
                      )}
                    >
                      /{ruleInfo.required}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Players */}
      <div className='space-y-2 min-h-[120px]'>
        {team.players.length === 0 ? (
          <div
            className={clsx(
              'flex items-center justify-center h-[120px] border-2 border-dashed rounded-xl transition-colors',
              hasValidationIssues
                ? 'border-red-300 dark:border-red-600 text-red-400 bg-red-50/50 dark:bg-red-900/10'
                : 'border-gray-300 dark:border-gray-600 text-gray-400'
            )}
          >
            <p className='text-sm font-medium'>
              {manualTeamMode
                ? 'Drag players here'
                : 'Drop players here'}
            </p>
          </div>
        ) : (
          team.players.map((player, playerIndex) => {
            const playerData = players.find(
              (p) => p.id === player.id
            );
            if (!playerData) return null;

            return (
              <PlayerCard
                key={player.id}
                player={player}
                playerIndex={playerIndex}
                isDraggable={!playerData.locked}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
