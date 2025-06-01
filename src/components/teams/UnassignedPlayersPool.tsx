import { useState } from 'react';
import {
  Users,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  List,
  ScrollText,
} from 'lucide-react';
import clsx from 'clsx';
import { Player } from '../../types';
import PlayerCard from './PlayerCard';

interface UnassignedPlayersPoolProps {
  players: Player[];
  dragOverTeam: number | null;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    playerId: number
  ) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

type LayoutType = 'grid' | 'compact' | 'scrollable';

export default function UnassignedPlayersPool({
  players,
  dragOverTeam,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: UnassignedPlayersPoolProps) {
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [unassignedLayout, setUnassignedLayout] =
    useState<LayoutType>('grid');

  // Compact Player Component for dense layouts
  const CompactPlayerCard = ({ player }: { player: Player }) => (
    <div
      draggable={!player.locked}
      onDragStart={(e) => onDragStart(e, player.id)}
      onDragEnd={onDragEnd}
      className={clsx(
        'px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium',
        'border border-yellow-300 dark:border-yellow-600',
        'cursor-move hover:shadow-md transition-all duration-200',
        'truncate text-center min-w-0',
        player.locked && 'opacity-50 cursor-not-allowed'
      )}
      title={player.name}
    >
      {player.name}
    </div>
  );

  const LayoutToggleButton = ({
    layout,
    currentLayout,
    icon,
    title,
    onClick,
  }: {
    layout: LayoutType;
    currentLayout: LayoutType;
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={clsx(
        'px-2 py-1 rounded text-xs font-medium transition-all',
        currentLayout === layout
          ? 'bg-white dark:bg-gray-800 shadow-sm text-yellow-800 dark:text-yellow-200'
          : 'hover:bg-yellow-300 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-300'
      )}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div
      className={clsx(
        'bg-gradient-to-br from-yellow-50 to-orange-50',
        'dark:from-yellow-900/20 dark:to-orange-900/20',
        'rounded-2xl p-6 border-2 border-dashed border-yellow-300 dark:border-yellow-600',
        'transition-all duration-300',
        dragOverTeam === -1 &&
          'ring-4 ring-yellow-400 ring-opacity-50 scale-[1.01]'
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Users className='text-yellow-600' size={20} />
          <h3 className='font-bold text-lg text-yellow-800 dark:text-yellow-200'>
            Unassigned Players
          </h3>
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setShowUnassigned(!showUnassigned)}
            className='p-1 text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400 transition-colors'
            title={showUnassigned ? 'Collapse' : 'Expand'}
          >
            {showUnassigned ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <span className='text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full font-bold'>
            {players.length} players
          </span>

          {/* Layout Toggle Buttons */}
          {showUnassigned && players.length > 12 && (
            <div className='flex bg-yellow-200 dark:bg-yellow-800 rounded-lg p-1'>
              <LayoutToggleButton
                layout='grid'
                currentLayout={unassignedLayout}
                icon={<Grid3X3 size={12} />}
                title='Grid view'
                onClick={() => setUnassignedLayout('grid')}
              />
              <LayoutToggleButton
                layout='compact'
                currentLayout={unassignedLayout}
                icon={<List size={12} />}
                title='Compact view'
                onClick={() => setUnassignedLayout('compact')}
              />
              <LayoutToggleButton
                layout='scrollable'
                currentLayout={unassignedLayout}
                icon={<ScrollText size={12} />}
                title='Scrollable view'
                onClick={() => setUnassignedLayout('scrollable')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {showUnassigned && (
        <>
          {players.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-yellow-600 dark:text-yellow-400'>
              <p className='text-sm font-medium'>
                All players are assigned to teams
              </p>
            </div>
          ) : (
            <>
              {/* Grid Layout (Default) */}
              {unassignedLayout === 'grid' && (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100 dark:scrollbar-thumb-yellow-600 dark:scrollbar-track-yellow-900'>
                  {players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      playerIndex={0}
                      isDraggable={!player.locked}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                </div>
              )}

              {/* Compact Name List */}
              {unassignedLayout === 'compact' && (
                <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100 dark:scrollbar-thumb-yellow-600 dark:scrollbar-track-yellow-900'>
                  {players.map((player) => (
                    <CompactPlayerCard
                      key={player.id}
                      player={player}
                    />
                  ))}
                </div>
              )}

              {/* Scrollable Horizontal List */}
              {unassignedLayout === 'scrollable' && (
                <div className='overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100 dark:scrollbar-thumb-yellow-600 dark:scrollbar-track-yellow-900'>
                  <div className='flex gap-2 min-w-max'>
                    {players.map((player) => (
                      <div key={player.id} className='flex-shrink-0'>
                        <PlayerCard
                          player={player}
                          playerIndex={0}
                          isDraggable={!player.locked}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Collapsed State */}
      {!showUnassigned && players.length > 0 && (
        <div className='py-4 text-center'>
          <p className='text-sm text-yellow-700 dark:text-yellow-300'>
            {players.length} unassigned players (click arrow to
            expand)
          </p>
        </div>
      )}
    </div>
  );
}
