import React from 'react';
import { Lock } from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface Player {
  id: number;
  name: string;
  skillLevel?: string;
}

interface PlayerCardProps {
  player: Player;
  playerIndex: number;
  isDraggable: boolean;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    playerId: number
  ) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function PlayerCard({
  player,
  playerIndex,
  isDraggable,
  onDragStart,
  onDragEnd,
}: PlayerCardProps) {
  const { players, skillBalancingEnabled, skillCategories } =
    useStore();

  // Get full player data from store
  const playerData = players.find((p) => p.id === player.id);
  if (!playerData) return null;

  // Get skill category info if skill balancing is enabled
  const getSkillCategoryInfo = (skillCategoryId?: string) => {
    return skillCategories.find((cat) => cat.id === skillCategoryId);
  };

  const skillInfo =
    skillBalancingEnabled && playerData.skillLevel
      ? getSkillCategoryInfo(playerData.skillLevel)
      : null;

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, player.id)}
      onDragEnd={onDragEnd}
      className={clsx(
        'p-3.5 rounded-xl transition-all duration-200 transform animate-slide-up',
        playerData.locked
          ? 'bg-gradient-to-r from-primary to-rose-500 text-white shadow-lg cursor-not-allowed'
          : 'bg-white dark:bg-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-move'
      )}
      style={{
        animationDelay: `${Math.min(playerIndex * 0.05, 0.3)}s`,
      }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          {/* Skill Level Indicator */}
          {skillInfo && (
            <div
              className='w-3 h-3 rounded-full flex-shrink-0 border border-white/20'
              style={{ backgroundColor: skillInfo.color }}
              title={skillInfo.name}
            />
          )}

          {/* Player Name */}
          <span className='font-medium select-none truncate'>
            {player.name}
          </span>

          {/* Skill Level Badge (for unlocked players when space allows) */}
          {skillInfo && !playerData.locked && (
            <span
              className='text-xs px-2 py-0.5 rounded-full font-medium text-white flex-shrink-0 hidden sm:inline-block'
              style={{ backgroundColor: skillInfo.color + '90' }}
            >
              {skillInfo.name}
            </span>
          )}
        </div>

        {/* Lock Icon */}
        {playerData.locked && (
          <Lock size={14} className='ml-2 flex-shrink-0' />
        )}
      </div>
    </div>
  );
}
