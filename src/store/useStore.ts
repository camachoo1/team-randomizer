import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppStore,
  Team,
  ExportData,
  SkillCategory,
  Player,
} from '../types';
import {
  calculateOptimalTeamCount,
  performSkillBalancedRandomization,
  performStandardRandomization,
  applyCustomTeamNaming,
  updatePlayerTeamAssignments,
  createHistoryEntry,
} from '../utils/helper';

// Default skill categories
const defaultSkillCategories: SkillCategory[] = [
  { id: 'amateur', name: 'Amateur', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#3B82F6' },
  { id: 'advanced', name: 'Advanced', color: '#8B5CF6' },
  { id: 'expert', name: 'Expert', color: '#EF4444' },
];

/**
 * Hook for initializing a Zustand store that persists throughout.
 *
 * Manages global state such as event/organizer name, players, teams,
 * team sizes, team configuration history, skill categories, and UI data such as dark mode.
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
      teamSize: 1,
      history: [],
      darkMode: true,
      skillBalancingEnabled: false,
      skillCategories: defaultSkillCategories,
      teamCompositionRules: {},
      teamNamingCategoryId: null,
      maxTeams: 0, // 0 means no limit
      reservePlayersEnabled: false,

      // Actions
      setEventInfo: (eventName: string, organizerName: string) =>
        set({ eventName, organizerName }),

      setMaxTeams: (count: number) => set({ maxTeams: count }),

      toggleReserveMode: () =>
        set((state) => ({
          reservePlayersEnabled: !state.reservePlayersEnabled,
        })),

      togglePlayerReserve: (playerId: number) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  isReserve: !p.isReserve,
                  teamId: p.isReserve ? p.teamId : null,
                }
              : p
          ),
        })),

      addPlayer: (
        playerName: string,
        skillLevel?: string,
        isReserve: boolean = false
      ) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: Date.now() + Math.random(),
              name: playerName,
              locked: false,
              teamId: null,
              skillLevel: skillLevel || undefined,
              isReserve,
            },
          ],
        })),

      updatePlayer: (
        playerId: number,
        updates: Partial<
          Pick<Player, 'name' | 'skillLevel' | 'isReserve'>
        >
      ) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  ...updates,
                  // If changing to/from reserve, handle teamId appropriately
                  teamId:
                    updates.isReserve !== undefined
                      ? updates.isReserve
                        ? null
                        : p.teamId
                      : p.teamId,
                }
              : p
          ),
        })),

      removePlayer: (playerId: number) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        })),

      clearTeams: () => set({ teams: [] }),

      togglePlayerLock: (playerId: number) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, locked: !p.locked } : p
          ),
        })),

      setTeamSize: (size: number) => set({ teamSize: size }),

      toggleSkillBalancing: () =>
        set((state) => ({
          skillBalancingEnabled: !state.skillBalancingEnabled,
        })),

      addSkillCategory: (name: string, color: string) =>
        set((state) => ({
          skillCategories: [
            ...state.skillCategories,
            {
              id: `skill_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name,
              color,
            },
          ],
        })),

      removeSkillCategory: (categoryId: string) =>
        set((state) => {
          // Don't remove if it's the last category
          if (state.skillCategories.length <= 1) return state;

          return {
            skillCategories: state.skillCategories.filter(
              (cat) => cat.id !== categoryId
            ),
            // Remove skill level from players who had this category
            players: state.players.map((player) => ({
              ...player,
              skillLevel:
                player.skillLevel === categoryId
                  ? undefined
                  : player.skillLevel,
            })),
          };
        }),

      updateSkillCategory: (categoryId: string, newName: string) =>
        set((state) => ({
          skillCategories: state.skillCategories.map((cat) =>
            cat.id === categoryId ? { ...cat, name: newName } : cat
          ),
        })),

      updateTeamNamingCategory: (categoryId: string | null) =>
        set({ teamNamingCategoryId: categoryId }),

      randomizeTeams: () => {
        const state = get();
        if (state.players.length === 0) return;

        // Filter out reserve players from team assignment
        const activePlayers = state.players.filter(
          (p) => !p.isReserve
        );
        if (activePlayers.length === 0) return;

        // Calculate optimal number of teams
        const numTeams = calculateOptimalTeamCount(
          activePlayers.length,
          state.teamSize,
          state.maxTeams
        );

        let newTeams: Team[];

        if (
          state.skillBalancingEnabled &&
          state.skillCategories.length > 0
        ) {
          newTeams = performSkillBalancedRandomization(
            activePlayers,
            numTeams,
            state
          );
        } else {
          newTeams = performStandardRandomization(
            activePlayers,
            numTeams
          );
        }

        newTeams = applyCustomTeamNaming(
          newTeams,
          state.teamNamingCategoryId,
          state.players
        );

        const updatedPlayers = updatePlayerTeamAssignments(
          state.players,
          newTeams
        );

        const historyEntry = createHistoryEntry(
          updatedPlayers,
          newTeams,
          state.eventName,
          state.organizerName
        );

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

          const updatedTeams = state.teams.map((team) => ({
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
          // Use the saved players array if available
          let playersToRestore: Player[];

          if (entry.players) {
            playersToRestore = entry.players;
          } else {
            const allPlayers = entry.teams.flatMap((t) => t.players);
            playersToRestore = allPlayers.filter(
              (player, idx, arr) =>
                arr.findIndex((p) => p.id === player.id) === idx
            );
          }

          set({
            players: playersToRestore,
            teams: JSON.parse(JSON.stringify(entry.teams)), // Deep clone
            eventName: entry.eventName,
            organizerName: entry.organizerName,
            ...(entry.maxTeams !== undefined && {
              maxTeams: entry.maxTeams,
            }),
            ...(entry.reservePlayersEnabled !== undefined && {
              reservePlayersEnabled: entry.reservePlayersEnabled,
            }),
            ...(entry.skillBalancingEnabled !== undefined && {
              skillBalancingEnabled: entry.skillBalancingEnabled,
            }),
            ...(entry.skillCategories && {
              skillCategories: entry.skillCategories,
            }),
            ...(entry.teamCompositionRules && {
              teamCompositionRules: entry.teamCompositionRules,
            }),
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
            teamSize: data.teamSize || 1,
          });

          return true;
        } catch (error) {
          console.error('Failed to import configuration:', error);
          return false;
        }
      },
      updateTeamCompositionRules: (rules: {
        [categoryId: string]: number;
      }) => set({ teamCompositionRules: rules }),
    }),
    {
      name: 'teamify-storage',
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
