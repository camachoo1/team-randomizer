import useStore from '../../store/useStore';
import ActivePlayersList from './ActivePlayersList';
import ReservePlayersList from './ReservePlayersList';
import { Player } from '../../types';

interface PlayerListsProps {
  onEditPlayer: (player: Player) => void;
}

export default function PlayerLists({
  onEditPlayer,
}: PlayerListsProps) {
  const { players, reservePlayersEnabled } = useStore();

  const activePlayers = players.filter((p) => !p.isReserve);
  const reservePlayers = players.filter((p) => p.isReserve);

  return (
    <div className='space-y-6'>
      <ActivePlayersList
        players={activePlayers}
        onEditPlayer={onEditPlayer}
      />

      {reservePlayersEnabled && (
        <ReservePlayersList
          players={reservePlayers}
          onEditPlayer={onEditPlayer}
        />
      )}
    </div>
  );
}
