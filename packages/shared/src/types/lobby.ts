import type { PlayerId, RoomId } from './phases.js';
import type { AlienId, AlienDefinition } from './aliens.js';

export type LobbyStatus = 'WAITING' | 'ALIEN_SELECT' | 'IN_GAME';

export interface LobbyPlayer {
  id: PlayerId;
  name: string;
  ready: boolean;
  selectedAlien: AlienId | null;
  alienChoices: AlienDefinition[] | null; // Two choices during selection
}

export interface LobbyRoom {
  id: RoomId;
  hostId: PlayerId;
  players: LobbyPlayer[];
  status: LobbyStatus;
  config: LobbyConfig;
}

export interface LobbyConfig {
  minPlayers: number;
  maxPlayers: number;
}

export interface LobbyUpdate {
  room: LobbyRoom;
}
