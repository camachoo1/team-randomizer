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
  performSkillBalancedRandomization,
  performStandardRandomization,
  applyCustomTeamNaming,
  updatePlayerTeamAssignments,
  createHistoryEntry,
  calculateOptimalTeamCount,
  distributePlayersEvenly,
  groupPlayersBySkill,
  addLockedPlayersToPartialTeams,
  distributePlayersByRulesWithDeficits,
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
      manualTeamMode: false,

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

      setManualMode: (enabled: boolean) =>
        set({ manualTeamMode: enabled }),

      setTeamSize: (size: number) => set({ teamSize: size }),

      toggleSkillBalancing: () =>
        set((state) => ({
          skillBalancingEnabled: !state.skillBalancingEnabled,
        })),

      createEmptyTeam: (teamName?: string) =>
        set((state) => ({
          teams: [
            ...state.teams,
            {
              id: Date.now() + Math.random(), // Ensure unique ID
              name: teamName || `Team ${state.teams.length + 1}`,
              players: [],
            },
          ],
        })),

      removeTeam: (teamId: number) =>
        set((state) => {
          const teamToRemove = state.teams.find(
            (t) => t.id === teamId
          );
          if (!teamToRemove) return state;

          // Unassign players from the removed team
          const updatedPlayers = state.players.map((player) => {
            const wasInRemovedTeam = teamToRemove.players.some(
              (p) => p.id === player.id
            );
            return wasInRemovedTeam
              ? { ...player, teamId: null }
              : player;
          });

          return {
            teams: state.teams.filter((t) => t.id !== teamId),
            players: updatedPlayers,
          };
        }),

      assignPlayerToTeam: (playerId: number, teamId: number) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          const targetTeam = state.teams.find((t) => t.id === teamId);

          if (!player || !targetTeam) return state;

          // Remove player from current team if assigned
          const updatedTeams = state.teams.map((t) => ({
            ...t,
            players: t.players.filter((p) => p.id !== playerId),
          }));

          // Add player to new team
          const targetTeamIndex = state.teams.findIndex(
            (t) => t.id === teamId
          );
          if (targetTeamIndex !== -1) {
            updatedTeams[targetTeamIndex].players.push({
              ...player,
              teamId: targetTeamIndex,
            });
          }

          return {
            teams: updatedTeams,
            players: state.players.map((p) =>
              p.id === playerId
                ? { ...p, teamId: targetTeamIndex }
                : p
            ),
          };
        }),

      removePlayerFromTeam: (playerId: number) =>
        set((state) => ({
          teams: state.teams.map((team) => ({
            ...team,
            players: team.players.filter((p) => p.id !== playerId),
          })),
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, teamId: null } : p
          ),
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

        let newTeams: Team[] = [];
        let numTeams: number;

        // Calculate number of teams based on maxTeams setting
        if (state.maxTeams > 0) {
          numTeams = state.maxTeams;
          const minTeamsNeeded = Math.ceil(
            activePlayers.length / state.teamSize
          );
          if (numTeams > minTeamsNeeded) {
            console.warn(
              `Reducing teams from ${numTeams} to ${minTeamsNeeded} based on player count`
            );
            numTeams = minTeamsNeeded;
          }
        } else {
          numTeams = Math.ceil(activePlayers.length / state.teamSize);
        }

        if (
          state.skillBalancingEnabled &&
          state.skillCategories.length > 0
        ) {
          // Use the existing skill-balanced randomization logic
          // (Your existing implementation is fine for full randomization)
          newTeams = performSkillBalancedRandomization(
            activePlayers,
            numTeams,
            state
          );
        } else {
          // Use the existing standard randomization logic
          newTeams = performStandardRandomization(
            activePlayers,
            numTeams
          );
        }

        // Apply custom team naming
        newTeams = applyCustomTeamNaming(
          newTeams,
          state.teamNamingCategoryId,
          state.players
        );

        // Update player team assignments
        const updatedPlayers = updatePlayerTeamAssignments(
          state.players,
          newTeams
        );

        // Create and save history entry
        const historyEntry = createHistoryEntry(
          updatedPlayers,
          newTeams,
          state.eventName,
          state.organizerName
        );

        // Update state
        set({
          teams: newTeams,
          players: updatedPlayers,
          history: [historyEntry, ...state.history].slice(0, 10),
        });
      },

      fillRemainingTeams: () => {
        const state = get();
        if (state.players.length === 0) return;

        // Get only unassigned active players
        const unassignedPlayers = state.players.filter(
          (p) => !p.isReserve && p.teamId === null
        );

        if (unassignedPlayers.length === 0) return;

        // Get all active players (assigned + unassigned) to calculate total team needs
        const allActivePlayers = state.players.filter(
          (p) => !p.isReserve
        );

        // Calculate optimal number of teams based on ALL active players
        const optimalTeamCount = calculateOptimalTeamCount(
          allActivePlayers.length,
          state.teamSize,
          state.maxTeams
        );

        // Start with existing teams (deep copy)
        let updatedTeams = state.teams.map((team) => ({
          ...team,
          players: [...team.players],
        }));

        // Create additional teams if needed to reach optimal count
        while (updatedTeams.length < optimalTeamCount) {
          const newTeam: Team = {
            id: Date.now() + updatedTeams.length + Math.random(),
            name: `Team ${updatedTeams.length + 1}`,
            players: [],
          };
          updatedTeams.push(newTeam);
        }

        // Apply skill balancing or simple distribution to unassigned players only
        if (
          state.skillBalancingEnabled &&
          state.skillCategories.length > 0
        ) {
          // Use skill-balanced approach
          const rules = state.teamCompositionRules;
          const hasRules = Object.keys(rules).length > 0;

          // Group unassigned players by skill
          const skillGroups = groupPlayersBySkill(
            unassignedPlayers,
            state.skillCategories
          );

          if (hasRules) {
            // Apply composition rules to fill team deficits
            distributePlayersByRulesWithDeficits(
              updatedTeams,
              rules,
              skillGroups,
              state
            );
          } else {
            // Simple even distribution by skill
            distributePlayersEvenly(updatedTeams, skillGroups);
          }

          // Handle locked unassigned players
          const lockedUnassigned = unassignedPlayers.filter(
            (p) => p.locked
          );
          addLockedPlayersToPartialTeams(
            updatedTeams,
            lockedUnassigned,
            state.teamSize
          );
        } else {
          // Simple random distribution
          const shuffledUnassigned = [...unassignedPlayers].sort(
            () => Math.random() - 0.5
          );

          shuffledUnassigned.forEach((player) => {
            // Find team with most available space
            const targetTeamIndex = updatedTeams.reduce(
              (bestIndex, team, currentIndex) => {
                const bestSpace =
                  state.teamSize -
                  updatedTeams[bestIndex].players.length;
                const currentSpace =
                  state.teamSize - team.players.length;
                return currentSpace > bestSpace
                  ? currentIndex
                  : bestIndex;
              },
              0
            );

            // Only add if team has space
            if (
              updatedTeams[targetTeamIndex].players.length <
              state.teamSize
            ) {
              updatedTeams[targetTeamIndex].players.push({
                ...player,
                teamId: targetTeamIndex,
              });
            }
          });
        }

        // Apply custom team naming
        updatedTeams = applyCustomTeamNaming(
          updatedTeams,
          state.teamNamingCategoryId,
          state.players
        );

        // Update player team assignments
        const updatedPlayers = updatePlayerTeamAssignments(
          state.players,
          updatedTeams
        );

        // Create history entry
        const historyEntry = createHistoryEntry(
          updatedPlayers,
          updatedTeams,
          state.eventName,
          state.organizerName
        );

        set({
          teams: updatedTeams,
          players: updatedPlayers,
          history: [historyEntry, ...state.history].slice(0, 10),
        });
      },

      smartRandomizeTeams: () => {
        const state = get();

        if (state.manualTeamMode) {
          // In manual mode, only assign unassigned players
          state.fillRemainingTeams();
        } else {
          // In auto mode, do full randomization (existing behavior)
          state.randomizeTeams();
        }
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
