import { useState } from 'react';
import {
  RefreshCw,
  Users,
  Trophy,
  Sparkles,
  Edit2,
  Award,
} from 'lucide-react';
import useStore from '../store/useStore';
import { Player } from '../types';
import clsx from 'clsx';
import PlayerCard from './PlayerCard';

export default function TeamDisplay() {
  const {
    teams,
    players,
    randomizeTeams,
    updateTeamName,
    movePlayerToTeam,
    skillBalancingEnabled,
    skillCategories,
  } = useStore();

  const [isRandomizing, setIsRandomizing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(
    null
  );
  const [dragOverTeam, setDragOverTeam] = useState<number | null>(
    null
  );
  const [draggedPlayerId, setDraggedPlayerId] = useState<
    number | null
  >(null);

  const handleRandomize = () => {
    setIsRandomizing(true);
    setTimeout(() => {
      randomizeTeams();
      setIsRandomizing(false);
    }, 800);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    playerId: number
  ) => {
    setDraggedPlayerId(playerId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
    setDragOverTeam(null);
    setDraggedPlayerId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    teamIndex: number
  ) => {
    e.preventDefault();
    setDragOverTeam(teamIndex);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTeam(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    teamIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTeam(null);

    if (draggedPlayerId !== null) {
      movePlayerToTeam(draggedPlayerId, teamIndex);
    }
    setDraggedPlayerId(null);
  };

  const handleTeamNameEdit = (teamId: number, newName: string) => {
    updateTeamName(teamId, newName || `Team ${teamId}`);
    setEditingTeamId(null);
  };

  // Get skill category counts for a team
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

  return (
    <div
      className='card animate-fade-in min-h-[600px]'
      style={{ animationDelay: '0.2s' }}
    >
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <Trophy className='text-primary' size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-bold'>Teams</h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-0.5'>
              {teams.length > 0
                ? 'Drag players to rearrange teams'
                : 'Click randomize to create teams'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRandomize}
          className={clsx(
            'btn-primary flex items-center justify-center gap-2 min-w-[180px]',
            isRandomizing && 'animate-pulse'
          )}
          disabled={players.length === 0 || isRandomizing}
        >
          <RefreshCw
            size={18}
            className={clsx(isRandomizing && 'animate-spin')}
          />
          {isRandomizing ? 'Randomizing...' : 'Randomize Teams'}
        </button>
      </div>

      {/* Skill Balancing Info */}
      {skillBalancingEnabled &&
        skillCategories.length > 0 &&
        teams.length > 0 && (
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
        )}

      {teams.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24'>
          <div className='relative mb-6'>
            <Users
              size={80}
              className='text-gray-300 dark:text-gray-700'
            />
            <Sparkles
              size={32}
              className='absolute -top-4 -right-4 text-primary animate-pulse-subtle'
            />
          </div>
          <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            No teams created yet
          </h3>
          <p className='text-gray-500 dark:text-gray-400 text-center max-w-md'>
            Add some players and click "Randomize Teams" to
            automatically create{' '}
            {skillBalancingEnabled ? 'skill-balanced' : 'balanced'}{' '}
            teams
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {teams.map((team, teamIndex) => {
            const skillDistribution = getTeamSkillDistribution(
              team.players
            );

            return (
              <div
                key={team.id}
                className={clsx(
                  'group relative bg-gradient-to-br from-gray-50 to-gray-100',
                  'dark:from-gray-800/30 dark:to-gray-900/30',
                  'rounded-2xl p-6 transition-all duration-300',
                  dragOverTeam === teamIndex
                    ? 'ring-4 ring-primary ring-opacity-50 scale-[1.02]'
                    : 'hover:shadow-2xl hover:scale-[1.01]'
                )}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, teamIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, teamIndex)}
              >
                <div className='flex items-center justify-between mb-5'>
                  {editingTeamId === team.id ? (
                    <input
                      type='text'
                      defaultValue={team.name}
                      className='font-bold text-lg bg-white dark:bg-gray-800 border-2 border-primary 
                               rounded px-2 py-1 focus:outline-none w-32'
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) =>
                        handleTeamNameEdit(team.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTeamNameEdit(
                            team.id,
                            e.currentTarget.value
                          );
                        } else if (e.key === 'Escape') {
                          setEditingTeamId(null);
                        }
                      }}
                    />
                  ) : (
                    <h3
                      className='font-bold text-lg flex items-center gap-2 cursor-pointer
                               hover:text-primary transition-colors'
                      onClick={() => setEditingTeamId(team.id)}
                    >
                      {team.name}
                      <Edit2
                        size={14}
                        className='opacity-0 group-hover:opacity-50'
                      />
                    </h3>
                  )}
                  <span className='text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold'>
                    {team.players.length}{' '}
                    {team.players.length === 1 ? 'player' : 'players'}
                  </span>
                </div>

                {/* Skill Distribution for Team */}
                {skillDistribution &&
                  skillDistribution.length > 0 && (
                    <div className='mb-4 flex flex-wrap gap-1'>
                      {skillDistribution.map((skill) => (
                        <div
                          key={skill.id}
                          className='flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs'
                        >
                          <div
                            className='w-2 h-2 rounded-full'
                            style={{ backgroundColor: skill.color }}
                          />
                          <span className='font-medium'>
                            {skill.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                <div className='space-y-2 min-h-[120px]'>
                  {team.players.length === 0 ? (
                    <div
                      className='flex items-center justify-center h-[120px] 
                                  border-2 border-dashed border-gray-300 dark:border-gray-600 
                                  rounded-xl text-gray-400'
                    >
                      <p className='text-sm font-medium'>
                        Drop players here
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
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
