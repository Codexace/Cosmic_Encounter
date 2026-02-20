import type { PlayerColor } from './phases.js';

export interface ColonyState {
  playerColor: PlayerColor;
  shipCount: number;
}

export interface PlanetState {
  id: string; // e.g. "RED_0", "RED_1", ... "RED_4"
  ownerColor: PlayerColor;
  colonies: ColonyState[];
}

export interface ShipSource {
  planetId: string;
  count: number;
}
