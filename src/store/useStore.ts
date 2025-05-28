import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppStore,
  Team,
  HistoryEntry,
  ExportData,
  SkillCategory,
  Player,
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

        // Filter out reserve players from team assignment
        const activePlayers = state.players.filter(
          (p) => !p.isReserve
        );

        if (activePlayers.length === 0) return;

        let newTeams: Team[] = [];
        let numTeams: number;

        // Calculate number of teams based on maxTeams setting
        if (state.maxTeams > 0) {
          // Use the specified max teams
          numTeams = state.maxTeams;

          // Ensure we don't create more teams than we have players for
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
          // Original calculation
          numTeams = Math.ceil(activePlayers.length / state.teamSize);
        }

        if (
          state.skillBalancingEnabled &&
          state.skillCategories.length > 0
        ) {
          // Skill-balanced randomization (only for active players)
          const rules = state.teamCompositionRules;
          const hasRules = Object.keys(rules).length > 0;

          // Group active players by skill level
          const skillGroups: { [key: string]: typeof activePlayers } =
            {};
          state.skillCategories.forEach((category) => {
            skillGroups[category.id] = activePlayers
              .filter(
                (p) => p.skillLevel === category.id && !p.locked
              )
              .sort(() => Math.random() - 0.5);
          });

          skillGroups['unassigned'] = activePlayers
            .filter((p) => !p.skillLevel && !p.locked)
            .sort(() => Math.random() - 0.5);

          // Recalculate teams if composition rules would create more teams than maxTeams
          if (hasRules && state.maxTeams > 0) {
            const maxTeamsPerCategory = Object.entries(rules)
              .map(([categoryId, count]) => {
                const availablePlayers =
                  skillGroups[categoryId]?.length || 0;
                return count > 0
                  ? Math.floor(availablePlayers / count)
                  : Infinity;
              })
              .filter((count) => count !== Infinity);

            if (maxTeamsPerCategory.length > 0) {
              const calculatedTeams = Math.min(
                ...maxTeamsPerCategory
              );
              if (calculatedTeams < numTeams) {
                numTeams = Math.max(1, calculatedTeams);
              }
            }
          }

          // Create empty teams
          newTeams = Array.from({ length: numTeams }, (_, i) => ({
            id: Date.now() + i,
            name: `Team ${i + 1}`,
            players: [],
          }));

          // Apply composition rules or balanced distribution
          if (hasRules) {
            // Apply composition rules
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

            // Fill remaining spots
            const remainingPlayers =
              Object.values(skillGroups).flat();
            remainingPlayers.forEach((player) => {
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
            // Balanced distribution
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

          // Add locked active players
          const lockedActivePlayers = activePlayers.filter(
            (p) => p.locked
          );
          lockedActivePlayers.forEach((player) => {
            if (player.teamId !== null && player.teamId < numTeams) {
              newTeams[player.teamId].players.push(player);
            } else {
              newTeams[0].players.push({ ...player, teamId: 0 });
            }
          });
        } else {
          // Standard randomization (only for active players)
          const unlockedActivePlayers = activePlayers.filter(
            (p) => !p.locked
          );
          const lockedActivePlayers = activePlayers.filter(
            (p) => p.locked
          );
          const shuffled = [...unlockedActivePlayers].sort(
            () => Math.random() - 0.5
          );

          newTeams = Array.from({ length: numTeams }, (_, i) => ({
            id: Date.now() + i,
            name: `Team ${i + 1}`,
            players: [],
          }));

          // Place locked players first
          lockedActivePlayers.forEach((player) => {
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

        // Apply custom team naming
        if (
          state.teamNamingCategoryId &&
          state.skillBalancingEnabled
        ) {
          newTeams = newTeams.map((team, index) => {
            const namingPlayer = team.players.find((player) => {
              const playerData = state.players.find(
                (p) => p.id === player.id
              );
              return (
                playerData?.skillLevel === state.teamNamingCategoryId
              );
            });

            return {
              ...team,
              name: namingPlayer
                ? `Team ${namingPlayer.name}`
                : `Team ${index + 1}`,
            };
          });
        }

        // Update player teamIds (including reserves)
        const updatedPlayers = state.players.map((player) => {
          if (player.isReserve) {
            return { ...player, teamId: null }; // Keep reserves unassigned
          }

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
          players: updatedPlayers,
          teams: JSON.parse(JSON.stringify(newTeams)),
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
          // Use the saved players array if available (new format)
          // Fall back to extracting from teams for backward compatibility
          let playersToRestore: Player[];

          if (entry.players) {
            // New format: use saved players array (includes reserves)
            playersToRestore = entry.players;
          } else {
            // Old format: extract players from teams (backward compatibility)
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
            // Restore additional settings if available
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
