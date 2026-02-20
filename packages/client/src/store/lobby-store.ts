import { create } from 'zustand';
import type { LobbyRoom, AlienDefinition, PlayerId } from '@cosmic/shared';

interface LobbyStore {
  sessionToken: string | null;
  playerId: PlayerId | null;
  playerName: string | null;
  room: LobbyRoom | null;
  alienChoices: AlienDefinition[] | null;

  setSession: (token: string, playerId: PlayerId) => void;
  setPlayerName: (name: string) => void;
  setRoom: (room: LobbyRoom | null) => void;
  setAlienChoices: (choices: AlienDefinition[] | null) => void;
  clearAll: () => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  sessionToken: null,
  playerId: null,
  playerName: null,
  room: null,
  alienChoices: null,

  setSession: (token, playerId) => set({ sessionToken: token, playerId }),
  setPlayerName: (name) => set({ playerName: name }),
  setRoom: (room) => set({ room }),
  setAlienChoices: (choices) => set({ alienChoices: choices }),
  clearAll: () =>
    set({
      sessionToken: null,
      playerId: null,
      playerName: null,
      room: null,
      alienChoices: null,
    }),
}));
