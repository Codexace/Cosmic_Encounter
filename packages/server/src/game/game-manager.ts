import type { RoomId, LobbyRoom, PlayerId } from '@cosmic/shared';
import { GameEngine } from './game-engine.js';

export class GameManager {
  private games = new Map<RoomId, GameEngine>();

  createGame(room: LobbyRoom): GameEngine {
    const engine = new GameEngine(room);
    this.games.set(room.id, engine);
    return engine;
  }

  getGame(roomId: RoomId): GameEngine | null {
    return this.games.get(roomId) ?? null;
  }

  deleteGame(roomId: RoomId): void {
    this.games.delete(roomId);
  }
}
