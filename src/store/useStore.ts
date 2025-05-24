import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStore, Team, HistoryEntry, ExportData } from '../types';

/**
 * Hook for initializing a Zustand store that persists throughout.
 *
 * Manages global state such as event/organizer name, players, teams,
 * team sizes, team configuration history, and UI data such as dark mode.
 *
 * Also, creates actions for manipulating global state such as adding or removing
 * players, team assignments, randomizing teams based on players, and storing
 * historical team creation data with retrieval.
 *
 * @returns { AppStore } - zustand store object with state and actions for managing said state
 */
const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      eventName: '',
      organizerName: '',
      players: [],
      teams: [],
      teamSize: 2,
      history: [],
      darkMode: true,

      // Actions
      setEventInfo: (eventName: string, organizerName: string) =>
        set({ eventName, organizerName }),

      addPlayer: (playerName: string) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: Date.now() + Math.random(),
              name: playerName,
              locked: false,
              teamId: null,
            },
          ],
        })),

      removePlayer: (playerId: number) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        })),

      togglePlayerLock: (playerId: number) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, locked: !p.locked } : p
          ),
        })),

      setTeamSize: (size: number) => set({ teamSize: size }),

      randomizeTeams: () => {
        const state = get();
        if (state.players.length === 0) return;

        const unlockedPlayers = state.players.filter(
          (p) => !p.locked
        );
        const lockedPlayers = state.players.filter((p) => p.locked);

        // Shuffle unlocked players
        const shuffled = [...unlockedPlayers].sort(
          () => Math.random() - 0.5
        );

        // Calculate number of teams
        const numTeams = Math.ceil(
          state.players.length / state.teamSize
        );

        // Create empty teams
        const newTeams: Team[] = Array.from(
          { length: numTeams },
          (_, i) => ({
            id: Date.now() + i,
            name: `Team ${i + 1}`,
            players: [],
          })
        );

        // Place locked players first
        lockedPlayers.forEach((player) => {
          if (player.teamId !== null && player.teamId < numTeams) {
            newTeams[player.teamId].players.push(player);
          }
        });

        // Distribute unlocked players evenly
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        shuffled.forEach((player, idx) => {
          // Find team with fewest players
          const teamIndex = newTeams.reduce(
            (minIdx, team, idx) =>
              team.players.length < newTeams[minIdx].players.length
                ? idx
                : minIdx,
            0
          );

          newTeams[teamIndex].players.push({
            ...player,
            teamId: teamIndex,
          });
        });

        // Update player teamIds
        const updatedPlayers = state.players.map((player) => {
          const team = newTeams.find((t) =>
            t.players.some((p) => p.id === player.id)
          );
          return {
            ...player,
            teamId: team ? newTeams.indexOf(team) : null,
          };
        });

        // Save to history
        const historyEntry: HistoryEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          teams: JSON.parse(JSON.stringify(newTeams)), // Deep clone
          eventName: state.eventName,
          organizerName: state.organizerName,
        };

        set({
          teams: newTeams,
          players: updatedPlayers,
          history: [historyEntry, ...state.history].slice(0, 10),
        });
      },

      updateTeamName: (teamId: number, newName: string) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, name: newName } : t
          ),
        })),

      movePlayerToTeam: (playerId: number, newTeamIndex: number) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          if (!player || player.locked) return state;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const updatedTeams = state.teams.map((team, idx) => ({
            ...team,
            players: team.players.filter((p) => p.id !== playerId),
          }));

          if (newTeamIndex < updatedTeams.length) {
            updatedTeams[newTeamIndex].players.push({
              ...player,
              teamId: newTeamIndex,
            });
          }

          return {
            teams: updatedTeams,
            players: state.players.map((p) =>
              p.id === playerId ? { ...p, teamId: newTeamIndex } : p
            ),
          };
        }),

      loadHistoryEntry: (historyId: number) => {
        const state = get();
        const entry = state.history.find((h) => h.id === historyId);
        if (entry) {
          set({
            teams: JSON.parse(JSON.stringify(entry.teams)), // Deep clone
            eventName: entry.eventName,
            organizerName: entry.organizerName,
          });
        }
      },

      clearAll: () =>
        set({
          eventName: '',
          organizerName: '',
          players: [],
          teams: [],
          teamSize: 2,
        }),

      clearHistory: () => set({ history: [] }),

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
        set({ darkMode: newDarkMode });
      },

      exportConfiguration: () => {
        const state = get();
        const exportData: ExportData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          eventName: state.eventName,
          organizerName: state.organizerName,
          players: state.players,
          teams: state.teams,
          teamSize: state.teamSize,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importConfiguration: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData) as ExportData;

          // Validate the data structure
          if (
            !data.version ||
            !Array.isArray(data.players) ||
            !Array.isArray(data.teams)
          ) {
            return false;
          }

          set({
            eventName: data.eventName || '',
            organizerName: data.organizerName || '',
            players: data.players || [],
            teams: data.teams || [],
            teamSize: data.teamSize || 2,
          });

          return true;
        } catch (error) {
          console.error('Failed to import configuration:', error);
          return false;
        }
      },
    }),
    {
      name: 'team-randomizer-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        }
      },
    }
  )
);

export default useStore;
