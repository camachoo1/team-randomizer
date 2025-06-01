import {
  Player,
  SkillCategory,
  Team,
  AppStore,
  HistoryEntry,
  TeamValidation,
} from '../types';

/**
 * Calculates the optimal number of teams based on player count and constraints.
 * If maxTeams is specified, it will be used unless it would result in teams
 * that are too large given the teamSize constraint.
 *
 * @param activePlayerCount - number of active players (does not include reserves)
 * @param teamSize - desired max teams size per team
 * @param maxTeams - max number of teams that need to be created (if 0 - no limit)
 * @returns Optimal number of teams to create
 */
export const calculateOptimalTeamCount = (
  activePlayerCount: number,
  teamSize: number,
  maxTeams: number
): number => {
  let numTeams: number;

  if (maxTeams > 0) {
    numTeams = maxTeams;
    const minTeamsNeeded = Math.ceil(activePlayerCount / teamSize);

    if (numTeams > minTeamsNeeded) {
      console.warn(
        `Reducing teams from ${numTeams} to ${minTeamsNeeded} based on player count`
      );
      numTeams = minTeamsNeeded;
    }
  } else {
    numTeams = Math.ceil(activePlayerCount / teamSize);
  }

  return numTeams;
};

/**
 * Groups players by their skill levels for balanced distribution.
 * Players without skill levels are placed in an 'unassigned' group.
 * Locked players are excluded from the grouping and shuffling.
 *
 * @param players - Array of players to group by skill level
 * @param skillCategories - Available skill categories to group by
 * @returns Object mapping skill category IDs to arrays of shuffled players
 */
export const groupPlayersBySkill = (
  players: Player[],
  skillCategories: SkillCategory[]
): { [key: string]: Player[] } => {
  const skillGroups: { [key: string]: Player[] } = {};

  skillCategories.forEach((category) => {
    skillGroups[category.id] = players
      .filter((p) => p.skillLevel === category.id && !p.locked)
      .sort(() => Math.random() - 0.5);
  });

  skillGroups['unassigned'] = players
    .filter((p) => !p.skillLevel && !p.locked)
    .sort(() => Math.random() - 0.5);

  return skillGroups;
};

/**
 * Adjusts team count based on composition rules constraints.
 * Ensures there are enough players in each skill category to meet
 * the minimum requirements defined in the composition rules.
 *
 * @param rules - Team composition rules mapping category IDs to required counts
 * @param skillGroups - Players grouped by skill categories
 * @param currentTeamCount - The initially calculated team count
 * @param maxTeams - Maximum allowed teams (0 means no limit)
 * @returns Adjusted team count that satisfies composition constraints
 */
export const adjustTeamCountForRules = (
  rules: { [categoryId: string]: number },
  skillGroups: { [key: string]: Player[] },
  currentTeamCount: number,
  maxTeams: number
): number => {
  if (Object.keys(rules).length === 0 || maxTeams === 0) {
    return currentTeamCount;
  }

  const maxTeamsPerCategory = Object.entries(rules)
    .map(([categoryId, count]) => {
      const availablePlayers = skillGroups[categoryId]?.length || 0;
      return count > 0
        ? Math.floor(availablePlayers / count)
        : Infinity;
    })
    .filter((count) => count !== Infinity);

  if (maxTeamsPerCategory.length > 0) {
    const calculatedTeams = Math.min(...maxTeamsPerCategory);
    if (calculatedTeams < currentTeamCount) {
      return Math.max(1, calculatedTeams);
    }
  }

  return currentTeamCount;
};

/**
 * Creates empty team structure with sequential IDs and default names.
 *
 * @param numTeams - Number of empty teams to create
 * @returns Array of empty teams with unique IDs and default names
 */
export const createEmptyTeams = (numTeams: number): Team[] => {
  return Array.from({ length: numTeams }, (_, i) => ({
    id: Date.now() + i,
    name: `Team ${i + 1}`,
    players: [],
  }));
};

/**
 * Distributes players according to composition rules.
 * First applies required counts per skill category, then fills
 * remaining spots with any leftover players.
 *
 * @param teams - Array of teams to populate with players
 * @param rules - Composition rules specifying required players per category
 * @param skillGroups - Players grouped by skill categories
 */
export const distributePlayersByRules = (
  teams: Team[],
  rules: { [categoryId: string]: number },
  skillGroups: { [key: string]: Player[] }
): void => {
  Object.entries(rules).forEach(([categoryId, requiredCount]) => {
    if (requiredCount > 0 && skillGroups[categoryId]) {
      const playersInCategory = skillGroups[categoryId];

      for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
        for (
          let i = 0;
          i < requiredCount && playersInCategory.length > 0;
          i++
        ) {
          const player = playersInCategory.shift();
          if (player) {
            teams[teamIndex].players.push({
              ...player,
              teamId: teamIndex,
            });
          }
        }
      }
    }
  });

  // Fill remaining spots with any remaining players
  const remainingPlayers = Object.values(skillGroups).flat();
  remainingPlayers.forEach((player) => {
    const teamIndex = teams.reduce(
      (minIdx, team, idx) =>
        team.players.length < teams[minIdx].players.length
          ? idx
          : minIdx,
      0
    );

    teams[teamIndex].players.push({
      ...player,
      teamId: teamIndex,
    });
  });
};

/**
 * Distributes players evenly across teams without specific rules.
 * Uses round-robin distribution to ensure balanced team sizes.
 *
 * @param teams - Array of teams to populate with players
 * @param skillGroups - Players grouped by skill categories
 */
export const distributePlayersEvenly = (
  teams: Team[],
  skillGroups: { [key: string]: Player[] }
): void => {
  Object.values(skillGroups).forEach((skillGroup) => {
    skillGroup.forEach((player, index) => {
      const teamIndex = index % teams.length;
      teams[teamIndex].players.push({
        ...player,
        teamId: teamIndex,
      });
    });
  });
};

/**
 * Adds locked players to their appropriate teams.
 * Places players in their assigned team if valid, otherwise defaults to team 0.
 *
 * @param teams - Array of teams to add locked players to
 * @param lockedPlayers - Players that are locked to specific teams
 */
export const addLockedPlayers = (
  teams: Team[],
  lockedPlayers: Player[]
): void => {
  lockedPlayers.forEach((player) => {
    if (player.teamId !== null && player.teamId < teams.length) {
      teams[player.teamId].players.push(player);
    } else {
      teams[0].players.push({ ...player, teamId: 0 });
    }
  });
};

// Type for the subset of AppStore state needed for randomization
type RandomizationState = Pick<
  AppStore,
  'teamCompositionRules' | 'maxTeams' | 'skillCategories'
>;

/**
 * Performs skill-balanced team randomization.
 * Groups players by skill level and distributes them according to
 * composition rules or evenly if no rules are specified.
 *
 * @param activePlayers - Non-reserve players to assign to teams
 * @param numTeams - Number of teams to create
 * @param state - Application state containing skill categories and rules
 * @returns Array of teams with players assigned based on skill balancing
 */
export const performSkillBalancedRandomization = (
  activePlayers: Player[],
  numTeams: number,
  state: RandomizationState
): Team[] => {
  const rules = state.teamCompositionRules;
  const hasRules = Object.keys(rules).length > 0;

  const skillGroups = groupPlayersBySkill(
    activePlayers,
    state.skillCategories
  );

  const adjustedTeamCount = adjustTeamCountForRules(
    rules,
    skillGroups,
    numTeams,
    state.maxTeams
  );

  const newTeams = createEmptyTeams(adjustedTeamCount);

  if (hasRules) {
    distributePlayersByRules(newTeams, rules, skillGroups);
  } else {
    distributePlayersEvenly(newTeams, skillGroups);
  }

  const lockedActivePlayers = activePlayers.filter((p) => p.locked);
  addLockedPlayers(newTeams, lockedActivePlayers);

  return newTeams;
};

/**
 * Performs standard randomization without skill balancing.
 * Shuffles unlocked players and distributes them evenly across teams,
 * while preserving locked players in their assigned positions.
 *
 * @param activePlayers - Non-reserve players to assign to teams
 * @param numTeams - Number of teams to create
 * @returns Array of teams with randomly distributed players
 */
export const performStandardRandomization = (
  activePlayers: Player[],
  numTeams: number
): Team[] => {
  const unlockedActivePlayers = activePlayers.filter(
    (p) => !p.locked
  );
  const lockedActivePlayers = activePlayers.filter((p) => p.locked);
  const shuffled = [...unlockedActivePlayers].sort(
    () => Math.random() - 0.5
  );

  const newTeams = createEmptyTeams(numTeams);

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

  return newTeams;
};

/**
 * Applies custom team naming based on skill categories.
 * Names teams after players from the specified skill category,
 * falling back to default names if no matching player is found.
 *
 * @param teams - Array of teams to apply naming to
 * @param teamNamingCategoryId - Skill category ID to use for naming
 * @param allPlayers - Complete player list for skill level lookup
 * @returns Array of teams with updated names
 */
export const applyCustomTeamNaming = (
  teams: Team[],
  teamNamingCategoryId: string | null,
  allPlayers: Player[]
): Team[] => {
  if (!teamNamingCategoryId) {
    return teams;
  }

  return teams.map((team, index) => {
    const namingPlayer = team.players.find((player) => {
      const playerData = allPlayers.find((p) => p.id === player.id);
      return playerData?.skillLevel === teamNamingCategoryId;
    });

    return {
      ...team,
      name: namingPlayer
        ? `Team ${namingPlayer.name}`
        : `Team ${index + 1}`,
    };
  });
};

/**
 * Updates player team assignments based on final team composition.
 * Reserve players are kept unassigned, while active players are
 * assigned to their respective teams.
 *
 * @param allPlayers - Complete list of players to update
 * @param finalTeams - Final team assignments after randomization
 * @returns Updated player list with correct team assignments
 */
export const updatePlayerTeamAssignments = (
  allPlayers: Player[],
  finalTeams: Team[]
): Player[] => {
  return allPlayers.map((player) => {
    if (player.isReserve) {
      return { ...player, teamId: null };
    }

    const team = finalTeams.find((t) =>
      t.players.some((p) => p.id === player.id)
    );
    return {
      ...player,
      teamId: team ? finalTeams.indexOf(team) : null,
    };
  });
};

/**
 * Creates a history entry for the team randomization.
 * Captures the current state including players, teams, and event info
 * for later retrieval and replay.
 *
 * @param updatedPlayers - Player list with updated team assignments
 * @param finalTeams - Final team composition after randomization
 * @param eventName - Name of the current event
 * @param organizerName - Name of the event organizer
 * @returns History entry object with timestamp and deep-copied data
 */
export const createHistoryEntry = (
  updatedPlayers: Player[],
  finalTeams: Team[],
  eventName: string,
  organizerName: string
): HistoryEntry => {
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    players: updatedPlayers,
    teams: JSON.parse(JSON.stringify(finalTeams)),
    eventName,
    organizerName,
  };
};

/**
 * Validates team composition against skill balancing rules.
 * Checks if each team meets the required number of players per skill category
 * and identifies any violations or imbalances.
 *
 * @param team - The team to validate
 * @param players - Complete list of players for skill level lookup
 * @param skillCategories - Available skill categories with names and colors
 * @param teamCompositionRules - Required number of players per skill category
 * @param skillBalancingEnabled - Whether skill balancing validation is active
 * @returns Validation result with status, violations, and skill distribution
 */
export const validateTeamComposition = (
  team: Team,
  players: Player[],
  skillCategories: SkillCategory[],
  teamCompositionRules: { [categoryId: string]: number },
  skillBalancingEnabled: boolean
): TeamValidation => {
  const result: TeamValidation = {
    isValid: true,
    violations: [],
    skillDistribution: {},
  };

  // Skip validation if skill balancing is disabled or no rules set
  if (
    !skillBalancingEnabled ||
    Object.keys(teamCompositionRules).length === 0
  ) {
    return result;
  }

  const teamPlayerData = team.players
    .map((p) => players.find((player) => player.id === p.id))
    .filter(Boolean) as Player[];

  Object.entries(teamCompositionRules).forEach(
    ([categoryId, requiredCount]) => {
      if (requiredCount > 0) {
        const categoryPlayers = teamPlayerData.filter(
          (p) => p.skillLevel === categoryId
        );
        const actualCount = categoryPlayers.length;
        const categoryName =
          skillCategories.find((c) => c.id === categoryId)?.name ||
          categoryId;

        result.skillDistribution[categoryId] = {
          actual: actualCount,
          required: requiredCount,
          categoryName,
        };

        if (actualCount < requiredCount) {
          result.violations.push(
            `Needs ${
              requiredCount - actualCount
            } more ${categoryName} player(s)`
          );
          result.isValid = false;
        } else if (actualCount > requiredCount) {
          result.violations.push(
            `Has ${
              actualCount - requiredCount
            } too many ${categoryName} player(s)`
          );
          result.isValid = false;
        }
      }
    }
  );

  return result;
};

type TeamState = Pick<AppStore, 'players' | 'teams' | 'teamSize'>;

/**
 * Distributes players according to composition rules while considering existing team assignments.
 * Calculates deficits for each team and fills them using round-robin distribution to ensure
 * balanced skill allocation across all teams. Prioritizes teams with the greatest need.
 *
 * @param teams - Array of teams to populate with players (may already contain some players)
 * @param rules - Composition rules specifying required players per skill category
 * @param skillGroups - Players grouped by skill categories, available for assignment
 * @param state - Application state containing team size limits and player data
 */
export const distributePlayersByRulesWithDeficits = (
  teams: Team[],
  rules: { [categoryId: string]: number },
  skillGroups: { [key: string]: Player[] },
  state: TeamState
): void => {
  Object.entries(rules).forEach(([categoryId, requiredCount]) => {
    if (
      requiredCount > 0 &&
      skillGroups[categoryId] &&
      skillGroups[categoryId].length > 0
    ) {
      const playersInCategory = [...skillGroups[categoryId]];

      const teamDeficits = teams.map((team, index) => {
        const currentCount = team.players.filter((p) => {
          const playerData = state.players!.find(
            (pd) => pd.id === p.id
          );
          return playerData?.skillLevel === categoryId;
        }).length;

        const deficit = Math.max(0, requiredCount - currentCount);
        const hasSpace = team.players.length < state.teamSize;

        return {
          teamIndex: index,
          deficit,
          currentCount,
          hasSpace,
          teamName: team.name,
        };
      });

      let round = 0;
      while (playersInCategory.length > 0 && round < requiredCount) {
        let assignedThisRound = false;

        teamDeficits.forEach((teamInfo) => {
          if (
            playersInCategory.length > 0 &&
            teamInfo.deficit > round &&
            teamInfo.hasSpace &&
            teams[teamInfo.teamIndex].players.length < state.teamSize
          ) {
            const player = playersInCategory.shift()!;
            teams[teamInfo.teamIndex].players.push({
              ...player,
              teamId: teamInfo.teamIndex,
            });

            // Update space tracking
            teamInfo.hasSpace =
              teams[teamInfo.teamIndex].players.length <
              state.teamSize;
            assignedThisRound = true;

            console.log(
              `Round ${round}: Assigned ${player.name} (${categoryId}) to ${teamInfo.teamName}`
            );
          }
        });

        if (!assignedThisRound) break;
        round++;
      }

      // Remove assigned players from the skill group
      skillGroups[categoryId] = playersInCategory;
    }
  });

  const remainingPlayers = Object.values(skillGroups).flat();

  remainingPlayers.forEach((player, index) => {
    const teamsWithSpace = teams.filter(
      (team) => team.players.length < state.teamSize
    );

    if (teamsWithSpace.length > 0) {
      const targetTeamIndex = teams.findIndex(
        (team) =>
          team.id === teamsWithSpace[index % teamsWithSpace.length].id
      );

      if (
        targetTeamIndex !== -1 &&
        teams[targetTeamIndex].players.length < state.teamSize
      ) {
        teams[targetTeamIndex].players.push({
          ...player,
          teamId: targetTeamIndex,
        });
      }
    }
  });
};

/**
 * Adds locked players to teams while respecting team size limits.
 * Attempts to place players in their preferred team if it has space,
 * otherwise finds the first available team with capacity.
 *
 * @param teams - Array of teams to add locked players to
 * @param lockedPlayers - Players that are locked and need team assignment
 * @param teamSize - Maximum number of players allowed per team
 */
export const addLockedPlayersToPartialTeams = (
  teams: Team[],
  lockedPlayers: Player[],
  teamSize: number
): void => {
  lockedPlayers.forEach((player) => {
    let targetTeamIndex = 0;

    if (
      player.teamId !== null &&
      player.teamId < teams.length &&
      teams[player.teamId].players.length < teamSize
    ) {
      targetTeamIndex = player.teamId;
    } else {
      const teamWithSpace = teams.findIndex(
        (team) => team.players.length < teamSize
      );
      targetTeamIndex = teamWithSpace !== -1 ? teamWithSpace : 0;
    }

    if (teams[targetTeamIndex].players.length < teamSize) {
      teams[targetTeamIndex].players.push({
        ...player,
        teamId: targetTeamIndex,
      });
    }
  });
};
