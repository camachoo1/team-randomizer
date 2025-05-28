import { useState } from 'react';
import { UserPlus, Plus, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import AddPlayersModal from '../../modals/AddPlayersModal';
import SkillSettingsModal from '../../modals/SkillSettingsModal';
import EditPlayerModal from '../../modals/EditPlayerModal';
import TournamentSettings from './TournamentSettings';
import FeatureToggles from './FeaturesToggle';
import SkillDistribution from './SkillDistribution';
import PlayerLists from './PlayersList';
import ClearPlayersModal from '../../modals/ClearPlayersModal';
import { Player } from '../../types';

export default function PlayerDisplay() {
  const { players, removePlayer, clearTeams } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSkillSettings, setShowSkillSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(
    null
  );

  const handleClearAllPlayers = () => {
    players.forEach((p) => removePlayer(p.id));
    clearTeams();
    setShowClearConfirm(false);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPlayer(null);
  };

  // Calculate player counts for display
  const activePlayers = players.filter((p) => !p.isReserve);
  const reservePlayers = players.filter((p) => p.isReserve);

  return (
    <>
      <div
        className='card animate-fade-in'
        style={{ animationDelay: '0.1s' }}
      >
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <UserPlus className='text-primary' size={22} />
          </div>
          <div className='flex-1'>
            <h2 className='text-xl font-bold'>Players</h2>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {players.length} total • {activePlayers.length} active •{' '}
              {reservePlayers.length} reserves
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setShowAddModal(true)}
              className='btn-primary flex items-center gap-2 px-4'
            >
              <Plus size={16} />
              Add Players
            </button>
            {players.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className='p-2 rounded-lg transition-all duration-200 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600'
                title='Clear all players'
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tournament Settings */}
        <TournamentSettings />

        {/* Feature Toggles */}
        <FeatureToggles
          onShowSkillSettings={() => setShowSkillSettings(true)}
        />

        {/* Skill Distribution */}
        <SkillDistribution />

        {/* Player Lists */}
        <PlayerLists onEditPlayer={handleEditPlayer} />

        {/* Bottom Stats */}
        {players.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm'>
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-semibold'>{players.length}</span>{' '}
              total players
            </div>
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-semibold text-primary'>
                {players.filter((p) => p.locked).length}
              </span>{' '}
              locked
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddPlayersModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <SkillSettingsModal
        isOpen={showSkillSettings}
        onClose={() => setShowSkillSettings(false)}
      />
      <EditPlayerModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        player={editingPlayer}
      />
      <ClearPlayersModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAllPlayers}
        playerCount={players.length}
      />
    </>
  );
}
