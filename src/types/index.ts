export interface SkillCategory {
  id: string;
  name: string;
  color: string;
}

export interface Player {
  id: number;
  name: string;
  locked: boolean;
  teamId: number | null;
  skillLevel?: string; // Optional skill category ID
  isReserve?: boolean;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  players: Player[];
  teams: Team[];
  eventName: string;
  organizerName: string;
  maxTeams?: number;
  teamSize?: number;
  reservePlayersEnabled?: boolean;
  skillBalancingEnabled?: boolean;
  skillCategories?: SkillCategory[];
  teamCompositionRules?: { [categoryId: string]: number };
  teamNamingCategoryId?: string | null;
}

export interface AppStore {
  // State
  eventName: string;
  organizerName: string;
  players: Player[];
  teams: Team[];
  teamSize: number;
  maxTeams: number;
  reservePlayersEnabled: boolean;
  history: HistoryEntry[];
  darkMode: boolean;
  skillBalancingEnabled: boolean;
  skillCategories: SkillCategory[];
  teamCompositionRules: { [categoryId: string]: number };
  teamNamingCategoryId: string | null;

  // Actions
  setEventInfo: (eventName: string, organizerName: string) => void;
  addPlayer: (
    playerName: string,
    skillLevel?: string,
    isReserve?: boolean
  ) => void;
  updatePlayer: (
    playerId: number,
    updates: Partial<
      Pick<Player, 'name' | 'skillLevel' | 'isReserve'>
    >
  ) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerLock: (playerId: number) => void;
  setTeamSize: (size: number) => void;
  randomizeTeams: () => void;
  updateTeamName: (teamId: number, newName: string) => void;
  movePlayerToTeam: (playerId: number, newTeamIndex: number) => void;
  loadHistoryEntry: (historyId: number) => void;
  clearAll: () => void;
  clearHistory: () => void;
  clearTeams: () => void;
  toggleDarkMode: () => void;
  exportConfiguration: () => string;
  importConfiguration: (jsonData: string) => boolean;
  toggleSkillBalancing: () => void;
  addSkillCategory: (name: string, color: string) => void;
  removeSkillCategory: (categoryId: string) => void;
  updateSkillCategory: (categoryId: string, newName: string) => void;
  updateTeamCompositionRules: (rules: {
    [categoryId: string]: number;
  }) => void;
  updateTeamNamingCategory: (categoryId: string | null) => void;
  setMaxTeams: (count: number) => void;
  toggleReserveMode: () => void;
  togglePlayerReserve: (playerId: number) => void;
}

// For when users download team data for later use
export interface ExportData {
  version: string;
  exportDate: string;
  eventName: string;
  organizerName: string;
  players: Player[];
  teams: Team[];
  teamSize: number;
}
