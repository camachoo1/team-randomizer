import { Users } from 'lucide-react';
import useStore from '../../store/useStore';
import PlayerRow from './PlayerRow';
import { Player } from '../../types';

interface ActivePlayersListProps {
  players: Player[];
  onEditPlayer: (player: Player) => void;
}

export default function ActivePlayersList({
  players,
  onEditPlayer,
}: ActivePlayersListProps) {
  const { teamSize, maxTeams } = useStore();

  // Calculate capacity
  const maxActiveSlots =
    maxTeams > 0 ? maxTeams * teamSize : Infinity;
  const isAtCapacity = players.length >= maxActiveSlots;

  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
          <Users size={18} />
          Active Players ({players.length})
        </h3>
        {isAtCapacity && maxActiveSlots !== Infinity && (
          <span className='text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full font-medium'>
            At Capacity
          </span>
        )}
      </div>

      <div className='space-y-2 max-h-60 overflow-y-auto scrollbar-custom pr-2'>
        {players.length === 0 ? (
          <div className='text-center py-8 text-gray-400'>
            <Users size={32} className='mx-auto mb-2 opacity-30' />
            <p className='text-sm'>No active players</p>
          </div>
        ) : (
          players.map((player, index) => (
            <PlayerRow
              key={player.id}
              player={player}
              index={index}
              type='active'
              onEdit={onEditPlayer}
            />
          ))
        )}
      </div>
    </div>
  );
}
