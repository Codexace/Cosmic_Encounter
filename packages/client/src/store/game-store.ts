import { create } from 'zustand';
import type { ClientGameState, CosmicCard, PlayerId, Phase, ClientPlayerState } from '@cosmic/shared';

interface GameStore {
  gameState: ClientGameState | null;
  setGameState: (state: ClientGameState) => void;
  clearGameState: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  setGameState: (state) => set({ gameState: state }),
  clearGameState: () => set({ gameState: null }),
}));

// Selector hooks
export function useMyPlayerId(): PlayerId | null {
  return useGameStore((s) => s.gameState?.yourPlayerId ?? null);
}

export function usePhase(): Phase | null {
  return useGameStore((s) => s.gameState?.phase ?? null);
}

export function useMyHand(): CosmicCard[] {
  return useGameStore((s) => s.gameState?.yourHand ?? []);
}

export function useAmIOffense(): boolean {
  return useGameStore(
    (s) => s.gameState?.activePlayerId === s.gameState?.yourPlayerId
  );
}

export function usePlayer(playerId: PlayerId | null): ClientPlayerState | null {
  return useGameStore((s) => {
    if (!playerId || !s.gameState) return null;
    return s.gameState.players[playerId] ?? null;
  });
}
