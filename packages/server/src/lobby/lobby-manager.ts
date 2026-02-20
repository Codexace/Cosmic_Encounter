import type { PlayerId, RoomId, AlienId, AlienDefinition, LobbyRoom, LobbyPlayer } from '@cosmic/shared';
import { ALIEN_CATALOG } from '@cosmic/shared';
import { generateRoomCode } from '../utils/id-generator.js';

export class LobbyManager {
  private rooms = new Map<RoomId, LobbyRoom>();

  createRoom(hostId: PlayerId, hostName: string): LobbyRoom {
    const roomCode = generateRoomCode();
    const room: LobbyRoom = {
      id: roomCode,
      hostId: hostId,
      players: [
        {
          id: hostId,
          name: hostName,
          ready: false,
          selectedAlien: null,
          alienChoices: null,
        },
      ],
      status: 'WAITING',
      config: { minPlayers: 3, maxPlayers: 5 },
    };
    this.rooms.set(roomCode, room);
    return room;
  }

  joinRoom(roomCode: string, playerId: PlayerId, playerName: string): LobbyRoom | string {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return 'Room not found';
    if (room.status !== 'WAITING') return 'Game already in progress';
    if (room.players.length >= room.config.maxPlayers) return 'Room is full';
    if (room.players.some((p) => p.id === playerId)) return 'Already in room';

    room.players.push({
      id: playerId,
      name: playerName,
      ready: false,
      selectedAlien: null,
      alienChoices: null,
    });
    return room;
  }

  leaveRoom(roomCode: string, playerId: PlayerId): LobbyRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    // Transfer host if needed
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }

    return room;
  }

  setReady(roomCode: string, playerId: PlayerId, ready: boolean): LobbyRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.ready = ready;
    }
    return room;
  }

  canStartGame(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    return (
      room.players.length >= room.config.minPlayers &&
      room.players.every((p) => p.ready)
    );
  }

  startAlienSelection(roomCode: string): LobbyRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.status = 'ALIEN_SELECT';

    // Shuffle all aliens and deal 2 to each player
    const alienIds = Object.keys(ALIEN_CATALOG) as AlienId[];
    const shuffled = shuffle(alienIds);

    room.players.forEach((player, i) => {
      const choice1 = ALIEN_CATALOG[shuffled[i * 2]];
      const choice2 = ALIEN_CATALOG[shuffled[i * 2 + 1]];
      player.alienChoices = [choice1, choice2];
      player.selectedAlien = null;
    });

    return room;
  }

  selectAlien(roomCode: string, playerId: PlayerId, alienId: AlienId): LobbyRoom | string {
    const room = this.rooms.get(roomCode);
    if (!room) return 'Room not found';
    if (room.status !== 'ALIEN_SELECT') return 'Not in alien selection phase';

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return 'Player not found';
    if (!player.alienChoices?.some((a) => a.id === alienId)) return 'Invalid alien choice';

    player.selectedAlien = alienId;
    return room;
  }

  allAliensSelected(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    return room.players.every((p) => p.selectedAlien !== null);
  }

  /**
   * Kick a player from the lobby. Only the host can kick, and only while WAITING.
   * Returns the updated room, or an error string.
   */
  kickPlayer(roomCode: string, hostId: PlayerId, targetId: PlayerId): LobbyRoom | string {
    const room = this.rooms.get(roomCode);
    if (!room) return 'Room not found';
    if (room.status !== 'WAITING') return 'Cannot kick after game has started';
    if (room.hostId !== hostId) return 'Only the host can kick players';
    if (hostId === targetId) return 'Cannot kick yourself';
    if (!room.players.some((p) => p.id === targetId)) return 'Player not in room';

    room.players = room.players.filter((p) => p.id !== targetId);
    return room;
  }

  getRoom(roomCode: string): LobbyRoom | null {
    return this.rooms.get(roomCode.toUpperCase()) ?? null;
  }

  setRoomStatus(roomCode: string, status: LobbyRoom['status']): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.status = status;
    }
  }

  deleteRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
  }
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
