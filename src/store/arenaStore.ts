import { create } from "zustand";

interface PlayerState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isWaving: boolean;
  isTalking: boolean;
  color: string;
}

interface ArenaState {
  players: Record<string, PlayerState>;
  addPlayer: (player: PlayerState) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<PlayerState>) => void;
  setPlayers: (players: PlayerState[]) => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
  players: {},
  addPlayer: (player) =>
    set((state) => ({
      players: { ...state.players, [player.id]: player },
    })),
  removePlayer: (id) =>
    set((state) => {
      const newPlayers = { ...state.players };
      delete newPlayers[id];
      return { players: newPlayers };
    }),
  updatePlayer: (id, updates) =>
    set((state) => ({
      players: {
        ...state.players,
        [id]: { ...state.players[id], ...updates },
      },
    })),
  setPlayers: (players) =>
    set(() => {
      const newPlayers: Record<string, PlayerState> = {};
      players.forEach((p) => {
        newPlayers[p.id] = p;
      });
      return { players: newPlayers };
    }),
}));
