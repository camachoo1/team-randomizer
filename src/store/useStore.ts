import { create } from 'zustand';
import { AppStore } from '../types';
import { persist } from 'zustand/middleware';

const useStore = create<AppStore>()(
  persist((set, get) => ({
    // Initial State
    eventName: '',
    organizerName: '',
    players: [],
    teams: [],
    teamSize: 2,
    history: [],
    darkMode: false,

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
  }))
);
