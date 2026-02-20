import { v4 as uuidv4 } from 'uuid';
import type { PlayerId, RoomId } from '@cosmic/shared';

export interface SessionData {
  playerId: PlayerId;
  playerName: string;
  roomId: RoomId | null;
  socketId: string | null;
  connectedAt: number;
  disconnectedAt: number | null;
}

const RECONNECT_GRACE_MS = 5 * 60 * 1000; // 5 minutes

export class SessionManager {
  private sessions = new Map<string, SessionData>(); // token -> session
  private socketToToken = new Map<string, string>(); // socketId -> token

  createSession(playerName: string): { sessionToken: string; playerId: PlayerId } {
    const sessionToken = uuidv4();
    const playerId = uuidv4();
    this.sessions.set(sessionToken, {
      playerId,
      playerName,
      roomId: null,
      socketId: null,
      connectedAt: Date.now(),
      disconnectedAt: null,
    });
    return { sessionToken, playerId };
  }

  authenticate(sessionToken: string, socketId: string): SessionData | null {
    const session = this.sessions.get(sessionToken);
    if (!session) return null;

    // Check if reconnecting within grace period
    if (session.disconnectedAt) {
      const elapsed = Date.now() - session.disconnectedAt;
      if (elapsed > RECONNECT_GRACE_MS) {
        this.sessions.delete(sessionToken);
        return null;
      }
    }

    // Clean up old socket mapping
    if (session.socketId) {
      this.socketToToken.delete(session.socketId);
    }

    session.socketId = socketId;
    session.disconnectedAt = null;
    session.connectedAt = Date.now();
    this.socketToToken.set(socketId, sessionToken);
    return session;
  }

  handleDisconnect(socketId: string): void {
    const token = this.socketToToken.get(socketId);
    if (!token) return;

    const session = this.sessions.get(token);
    if (session) {
      session.socketId = null;
      session.disconnectedAt = Date.now();
    }
    this.socketToToken.delete(socketId);
  }

  getSession(sessionToken: string): SessionData | null {
    return this.sessions.get(sessionToken) ?? null;
  }

  getSessionBySocketId(socketId: string): SessionData | null {
    const token = this.socketToToken.get(socketId);
    if (!token) return null;
    return this.sessions.get(token) ?? null;
  }

  setRoom(sessionToken: string, roomId: RoomId | null): void {
    const session = this.sessions.get(sessionToken);
    if (session) {
      session.roomId = roomId;
    }
  }

  getPlayerIdBySocket(socketId: string): PlayerId | null {
    const session = this.getSessionBySocketId(socketId);
    return session?.playerId ?? null;
  }

  getTokenBySocketId(socketId: string): string | null {
    return this.socketToToken.get(socketId) ?? null;
  }

  setRoomBySocketId(socketId: string, roomId: RoomId | null): void {
    const token = this.socketToToken.get(socketId);
    if (token) {
      this.setRoom(token, roomId);
    }
  }

  /** Find session data by playerId (iterates all sessions). */
  getSessionByPlayerId(playerId: PlayerId): SessionData | null {
    for (const session of this.sessions.values()) {
      if (session.playerId === playerId) return session;
    }
    return null;
  }
}
