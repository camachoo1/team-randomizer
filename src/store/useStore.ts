import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppStore,
  Team,
  HistoryEntry,
  ExportData,
  SkillCategory,
} from '../types';

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

      // Actions
      setEventInfo: (eventName: string, organizerName: string) =>
        set({ eventName, organizerName }),

      addPlayer: (playerName: string, skillLevel?: string) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: Date.now() + Math.random(),
              name: playerName,
              locked: false,
              teamId: null,
              skillLevel: skillLevel || undefined,
            },
          ],
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

      // Toggle skill balancing mode
      toggleSkillBalancing: () =>
        set((state) => ({
          skillBalancingEnabled: !state.skillBalancingEnabled,
        })),

      // Add new skill category
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

      // Remove skill category
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

      // Update skill category name
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

        let newTeams: Team[] = [];

        if (
          state.skillBalancingEnabled &&
          state.skillCategories.length > 0
        ) {
          // Skill-balanced randomization with composition rules
          const rules = state.teamCompositionRules;
          const hasRules = Object.keys(rules).length > 0;

          // Group players by skill level
          const skillGroups: { [key: string]: typeof state.players } =
            {};
          state.skillCategories.forEach((category) => {
            skillGroups[category.id] = state.players
              .filter(
                (p) => p.skillLevel === category.id && !p.locked
              )
              .sort(() => Math.random() - 0.5); // Shuffle each group
          });

          // Add unassigned players
          skillGroups['unassigned'] = state.players
            .filter((p) => !p.skillLevel && !p.locked)
            .sort(() => Math.random() - 0.5);

          // Calculate number of teams
          let numTeams: number;
          if (hasRules) {
            // Calculate based on the most restrictive rule
            const maxTeamsPerCategory = Object.entries(rules)
              .map(([categoryId, count]) => {
                const availablePlayers =
                  skillGroups[categoryId]?.length || 0;
                return count > 0
                  ? Math.floor(availablePlayers / count)
                  : Infinity;
              })
              .filter((count) => count !== Infinity);

            numTeams =
              maxTeamsPerCategory.length > 0
                ? Math.min(
                    ...maxTeamsPerCategory,
                    Math.ceil(state.players.length / state.teamSize)
                  )
                : Math.ceil(state.players.length / state.teamSize);
          } else {
            // Fallback to original calculation
            const maxGroupSize = Math.max(
              ...Object.values(skillGroups).map(
                (group) => group.length
              )
            );
            numTeams = Math.max(
              1,
              Math.ceil(
                maxGroupSize /
                  Math.max(
                    1,
                    Math.floor(
                      state.teamSize / state.skillCategories.length
                    )
                  )
              )
            );
          }

          // Create empty teams with temporary names
          newTeams = Array.from({ length: numTeams }, (_, i) => ({
            id: Date.now() + i,
            name: `Team ${i + 1}`, // Temporary name, will be updated later if custom naming is enabled
            players: [],
          }));

          // Apply composition rules if they exist
          if (hasRules) {
            // First pass: fill required spots according to rules
            Object.entries(rules).forEach(
              ([categoryId, requiredCount]) => {
                if (requiredCount > 0 && skillGroups[categoryId]) {
                  const playersInCategory = skillGroups[categoryId];

                  for (
                    let teamIndex = 0;
                    teamIndex < numTeams;
                    teamIndex++
                  ) {
                    for (
                      let i = 0;
                      i < requiredCount &&
                      playersInCategory.length > 0;
                      i++
                    ) {
                      const player = playersInCategory.shift();
                      if (player) {
                        newTeams[teamIndex].players.push({
                          ...player,
                          teamId: teamIndex,
                        });
                      }
                    }
                  }
                }
              }
            );

            // Second pass: fill remaining spots with any available players
            const remainingPlayers =
              Object.values(skillGroups).flat();
            remainingPlayers.forEach((player) => {
              // Find team with fewest players
              const teamIndex = newTeams.reduce(
                (minIdx, team, idx) =>
                  team.players.length <
                  newTeams[minIdx].players.length
                    ? idx
                    : minIdx,
                0
              );

              if (
                newTeams[teamIndex].players.length < state.teamSize
              ) {
                newTeams[teamIndex].players.push({
                  ...player,
                  teamId: teamIndex,
                });
              }
            });
          } else {
            // Original balanced distribution without specific rules
            Object.values(skillGroups).forEach((skillGroup) => {
              skillGroup.forEach((player, index) => {
                const teamIndex = index % numTeams;
                newTeams[teamIndex].players.push({
                  ...player,
                  teamId: teamIndex,
                });
              });
            });
          }

          // Add locked players to their existing teams if possible
          const lockedPlayers = state.players.filter((p) => p.locked);
          lockedPlayers.forEach((player) => {
            if (player.teamId !== null && player.teamId < numTeams) {
              newTeams[player.teamId].players.push(player);
            } else {
              // If locked player's team doesn't exist, add to first team
              newTeams[0].players.push({ ...player, teamId: 0 });
            }
          });
        } else {
          // Standard randomization (existing logic)
          const unlockedPlayers = state.players.filter(
            (p) => !p.locked
          );
          const lockedPlayers = state.players.filter((p) => p.locked);
          const shuffled = [...unlockedPlayers].sort(
            () => Math.random() - 0.5
          );
          const numTeams = Math.ceil(
            state.players.length / state.teamSize
          );

          newTeams = Array.from({ length: numTeams }, (_, i) => ({
            id: Date.now() + i,
            name: `Team ${i + 1}`, // Temporary name, will be updated later if custom naming is enabled
            players: [],
          }));

          // Place locked players first
          lockedPlayers.forEach((player) => {
            if (player.teamId !== null && player.teamId < numTeams) {
              newTeams[player.teamId].players.push(player);
            }
          });

          // Distribute unlocked players evenly
          shuffled.forEach((player) => {
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
        }

        // Apply custom team naming if enabled
        if (
          state.teamNamingCategoryId &&
          state.skillBalancingEnabled
        ) {
          newTeams = newTeams.map((team, index) => {
            // Find the first player in the team with the selected skill category
            const namingPlayer = team.players.find((player) => {
              const playerData = state.players.find(
                (p) => p.id === player.id
              );
              return (
                playerData?.skillLevel === state.teamNamingCategoryId
              );
            });

            if (namingPlayer) {
              return {
                ...team,
                name: `Team ${namingPlayer.name}`,
              };
            } else {
              // Fallback to standard naming if no player from the selected category is found
              return {
                ...team,
                name: `Team ${index + 1}`,
              };
            }
          });
        }

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
          const allPlayers = entry.teams.flatMap((t) => t.players);
          const uniquePlayers = allPlayers.filter(
            (player, idx, arr) =>
              arr.findIndex((p) => p.id === player.id) === idx
          );
          set({
            players: uniquePlayers,
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
