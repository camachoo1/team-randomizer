// Updated TeamDisplay.tsx with smart randomization for manual mode

import { useState } from 'react';
import {
  RefreshCw,
  Trophy,
  Plus,
  Users,
  Shuffle,
} from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';
import EmptyTeamsState from './EmptyTeamState';
import SkillLegend from './SkillLegend';
import UnassignedPlayersPool from './UnassignedPlayersPool';
import { GlobalValidationSummary } from './validations';
import DeleteTeamConfirmModal from '../../modals/DeleteTeamConfirmModal';
import { EnhancedTeamCard } from './EnhancedTeamCard';

export default function TeamDisplay() {
  const {
    teams,
    players,
    randomizeTeams,
    updateTeamName,
    movePlayerToTeam,
    skillBalancingEnabled,
    skillCategories,
    manualTeamMode,
    setManualMode,
    createEmptyTeam,
    removeTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    fillRemainingTeams, // New action for partial randomization
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
  const [teamToDelete, setTeamToDelete] = useState<number | null>(
    null
  );
  const [showDeleteTeamModal, setShowDeleteTeamModal] =
    useState(false);

  const handleRandomize = () => {
    setIsRandomizing(true);
    setTimeout(() => {
      randomizeTeams();
      setIsRandomizing(false);
    }, 800);
  };

  const handleSmartRandomize = () => {
    setIsRandomizing(true);
    setTimeout(() => {
      if (manualTeamMode) {
        fillRemainingTeams();
      } else {
        randomizeTeams();
      }
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
      if (manualTeamMode) {
        const targetTeam = teams[teamIndex];
        if (targetTeam) {
          assignPlayerToTeam(draggedPlayerId, targetTeam.id);
        }
      } else {
        movePlayerToTeam(draggedPlayerId, teamIndex);
      }
    }
    setDraggedPlayerId(null);
  };

  // Handle drop on unassigned area
  const handleUnassignedDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (draggedPlayerId !== null && manualTeamMode) {
      removePlayerFromTeam(draggedPlayerId);
    }
    setDraggedPlayerId(null);
  };

  const handleUnassignedDragEnter = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDragOverTeam(-1);
  };

  const handleTeamNameEdit = (teamId: number, newName: string) => {
    updateTeamName(teamId, newName || `Team ${teamId}`);
    setEditingTeamId(null);
  };

  const handleRemoveTeam = (teamId: number) => {
    setTeamToDelete(teamId);
    setShowDeleteTeamModal(true);
  };

  const confirmRemoveTeam = () => {
    if (teamToDelete !== null) {
      removeTeam(teamToDelete);
      setTeamToDelete(null);
      setShowDeleteTeamModal(false);
    }
  };

  const activePlayers = players.filter((p) => !p.isReserve);
  const unassignedPlayers = activePlayers.filter(
    (p) => p.teamId === null
  );
  const hasUnassignedPlayers = unassignedPlayers.length > 0;
  const hasExistingTeams = teams.length > 0;

  return (
    <div
      className='card animate-fade-in min-h-[600px]'
      style={{ animationDelay: '0.2s' }}
      data-tour='generate-teams'
    >
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <Trophy className='text-primary' size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-bold'>Teams</h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-0.5'>
              {manualTeamMode
                ? hasUnassignedPlayers
                  ? hasExistingTeams
                    ? 'Fill remaining spots or create new teams'
                    : 'Create teams and assign unassigned players'
                  : 'Create teams manually and drag players to assign them'
                : teams.length > 0
                ? 'Drag players to rearrange teams'
                : 'Click randomize to create teams'}
            </p>
          </div>
        </div>

        <div className='flex gap-2'>
          {/* Mode Toggle */}
          <button
            onClick={() => setManualMode(!manualTeamMode)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              manualTeamMode
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {manualTeamMode ? 'Manual Mode' : 'Auto Mode'}
          </button>

          {/* Action Buttons */}
          {manualTeamMode ? (
            <div className='flex gap-2'>
              <button
                onClick={() => createEmptyTeam()}
                className='btn-primary flex items-center justify-center gap-2'
              >
                <Plus size={18} />
                Add Team
              </button>

              {/* Fill Remaining Button - only show if there are unassigned players */}
              {hasUnassignedPlayers && (
                <button
                  onClick={handleSmartRandomize}
                  className={clsx(
                    'btn-secondary flex items-center justify-center gap-2 min-w-[140px]',
                    'bg-green-500 hover:bg-green-600 text-white',
                    isRandomizing && 'animate-pulse'
                  )}
                  disabled={isRandomizing}
                  title={`Assign ${
                    unassignedPlayers.length
                  } unassigned players to ${
                    hasExistingTeams
                      ? 'existing teams or create new ones'
                      : 'new teams'
                  }`}
                >
                  <Shuffle
                    size={18}
                    className={clsx(isRandomizing && 'animate-spin')}
                  />
                  {isRandomizing ? 'Assigning...' : 'Fill Remaining'}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleRandomize}
              className={clsx(
                'btn-primary flex items-center justify-center gap-2 min-w-[180px]',
                isRandomizing && 'animate-pulse'
              )}
              disabled={activePlayers.length === 0 || isRandomizing}
            >
              <RefreshCw
                size={18}
                className={clsx(isRandomizing && 'animate-spin')}
              />
              {isRandomizing ? 'Randomizing...' : 'Randomize Teams'}
            </button>
          )}
        </div>
      </div>

      {/* Unassigned Players Alert (Manual Mode) */}
      {manualTeamMode && hasUnassignedPlayers && (
        <div className='mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-amber-100 dark:bg-amber-800 rounded-lg'>
                <Users
                  className='text-amber-600 dark:text-amber-400'
                  size={16}
                />
              </div>
              <div>
                <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                  {unassignedPlayers.length} players need team
                  assignments
                </p>
                <p className='text-xs text-amber-700 dark:text-amber-300 mt-1'>
                  {hasExistingTeams
                    ? 'These players will fill existing teams first, then create new teams as needed'
                    : 'Click "Fill Remaining" to automatically create teams for these players'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSmartRandomize}
              className={clsx(
                'px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2',
                isRandomizing && 'animate-pulse cursor-not-allowed'
              )}
              disabled={isRandomizing}
            >
              <Shuffle
                size={14}
                className={clsx(isRandomizing && 'animate-spin')}
              />
              {isRandomizing ? 'Assigning...' : 'Auto-assign'}
            </button>
          </div>
        </div>
      )}

      {/* Skill Legend */}
      <SkillLegend
        skillBalancingEnabled={skillBalancingEnabled}
        skillCategories={skillCategories}
        showLegend={teams.length > 0}
      />

      {/* Main Content */}
      {teams.length === 0 && !manualTeamMode ? (
        <EmptyTeamsState
          skillBalancingEnabled={skillBalancingEnabled}
        />
      ) : (
        <div className='space-y-6'>
          {/* Global Validation Summary */}
          <GlobalValidationSummary />

          {/* Unassigned Players Pool (Manual Mode Only) */}
          {manualTeamMode && hasUnassignedPlayers && (
            <UnassignedPlayersPool
              players={unassignedPlayers}
              dragOverTeam={dragOverTeam}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={handleUnassignedDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleUnassignedDrop}
            />
          )}

          {/* Teams Grid */}
          {teams.length === 0 && manualTeamMode ? (
            <div className='text-center py-12'>
              <Trophy
                size={48}
                className='mx-auto mb-4 text-gray-300 opacity-50'
              />
              <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                {hasUnassignedPlayers
                  ? 'Ready to create teams'
                  : 'No teams created yet'}
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-6'>
                {hasUnassignedPlayers
                  ? `You have ${unassignedPlayers.length} players ready to be assigned. Click "Add Team" to create teams manually, or "Fill Remaining" to auto-create teams.`
                  : 'Click "Add Team" to create your first team, then drag players to assign them.'}
              </p>
              <div className='flex justify-center gap-3'>
                <button
                  onClick={() => createEmptyTeam()}
                  className='btn-primary flex items-center gap-2'
                >
                  <Plus size={18} />
                  Add Team
                </button>
                {hasUnassignedPlayers && (
                  <button
                    onClick={handleSmartRandomize}
                    className='btn-secondary bg-green-500 hover:bg-green-600 text-white flex items-center gap-2'
                    disabled={isRandomizing}
                  >
                    <Shuffle
                      size={18}
                      className={clsx(
                        isRandomizing && 'animate-spin'
                      )}
                    />
                    {isRandomizing
                      ? 'Creating...'
                      : 'Auto-create Teams'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {teams.map((team, teamIndex) => (
                <EnhancedTeamCard
                  key={team.id}
                  team={team}
                  teamIndex={teamIndex}
                  dragOverTeam={dragOverTeam}
                  editingTeamId={editingTeamId}
                  manualTeamMode={manualTeamMode}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onTeamNameEdit={handleTeamNameEdit}
                  onRemoveTeam={handleRemoveTeam}
                  onEditTeam={setEditingTeamId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <DeleteTeamConfirmModal
        isOpen={showDeleteTeamModal}
        onConfirm={confirmRemoveTeam}
        onClose={() => {
          setShowDeleteTeamModal(false);
          setTeamToDelete(null);
        }}
        teamId={teamToDelete || 0}
      />
    </div>
  );
}
