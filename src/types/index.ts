export interface Player {
  id: number;
  name: string;
  locked: boolean;
  teamId: number | null;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  teams: Team[];
  eventName: string;
  organizerName: string;
}

export interface AppStore {
  // State
  eventName: string;
  organizerName: string;
  players: Player[];
  teams: Team[];
  teamSize: number;
  history: HistoryEntry[];
  darkMode: boolean;

  // Actions
  setEventInfo: (eventName: string, organizerName: string) => void;
  addPlayer: (playerName: string) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerLock: (playerId: number) => void;
  setTeamSize: (size: number) => void;
  randomizeTeams: () => void;
  updateTeamName: (teamId: number, newName: string) => void;
  movePlayerToTeam: (playerId: number, newTeamIndex: number) => void;
  loadHistoryEntry: (historyId: number) => void;
  clearAll: () => void;
  clearHistory: () => void;
  toggleDarkMode: () => void;
}
