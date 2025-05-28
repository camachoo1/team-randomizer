import { UserCheck } from 'lucide-react';
import PlayerRow from './PlayerRow';
import { Player } from '../../types';

interface ReservePlayersListProps {
  players: Player[];
  onEditPlayer: (player: Player) => void;
}

export default function ReservePlayersList({
  players,
  onEditPlayer,
}: ReservePlayersListProps) {
  return (
    <div>
      <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2'>
        <UserCheck size={18} />
        Reserve Players ({players.length})
      </h3>

      <div className='space-y-2 max-h-60 overflow-y-auto scrollbar-custom pr-2'>
        {players.length === 0 ? (
          <div className='text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg'>
            <UserCheck
              size={32}
              className='mx-auto mb-2 opacity-30'
            />
            <p className='text-sm'>No reserve players</p>
          </div>
        ) : (
          players.map((player, index) => (
            <PlayerRow
              key={player.id}
              player={player}
              index={index}
              type='reserve'
              onEdit={onEditPlayer}
            />
          ))
        )}
      </div>
    </div>
  );
}
