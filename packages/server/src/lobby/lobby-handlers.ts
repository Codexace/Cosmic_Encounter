import type { Server, Socket } from 'socket.io';
import type { AlienId } from '@cosmic/shared';
import type { LobbyManager } from './lobby-manager.js';
import type { SessionManager } from '../middleware/session.js';
import { GameManager } from '../game/game-manager.js';

const gameManager = new GameManager();

export function setupLobbyHandlers(
  io: Server,
  socket: Socket,
  lobbyManager: LobbyManager,
  sessionManager: SessionManager
): void {
  // Create a new session
  socket.on('createSession', (data: { playerName: string }, callback) => {
    const { sessionToken, playerId } = sessionManager.createSession(data.playerName);
    sessionManager.authenticate(sessionToken, socket.id);
    callback({ sessionToken, playerId });
  });

  // Reconnect with existing session
  socket.on('authenticate', (data: { sessionToken: string }, callback) => {
    const session = sessionManager.authenticate(data.sessionToken, socket.id);
    if (!session) {
      callback({ error: 'Invalid or expired session' });
      return;
    }

    // Rejoin room if in one
    if (session.roomId) {
      socket.join(session.roomId);
      const room = lobbyManager.getRoom(session.roomId);
      if (room) {
        callback({ playerId: session.playerId, roomId: session.roomId });
        socket.emit('lobbyUpdate', { room });
      }

      // If in game, send current game state
      const engine = gameManager.getGame(session.roomId);
      if (engine) {
        socket.emit('gameStateUpdate', engine.getClientState(session.playerId));
      }
    } else {
      callback({ playerId: session.playerId });
    }
  });

  // Create room
  socket.on('lobbyCreate', (_data, callback) => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session) {
      callback({ error: 'Not authenticated' });
      return;
    }

    const room = lobbyManager.createRoom(session.playerId, session.playerName);
    sessionManager.setRoomBySocketId(socket.id, room.id);
    socket.join(room.id);
    callback({ roomCode: room.id });
    io.to(room.id).emit('lobbyUpdate', { room });
  });

  // Join room
  socket.on('lobbyJoin', (data: { roomCode: string }, callback) => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session) {
      callback({ error: 'Not authenticated' });
      return;
    }

    const result = lobbyManager.joinRoom(data.roomCode, session.playerId, session.playerName);
    if (typeof result === 'string') {
      callback({ error: result });
      return;
    }

    sessionManager.setRoomBySocketId(socket.id, result.id);
    socket.join(result.id);
    callback({ roomCode: result.id });
    io.to(result.id).emit('lobbyUpdate', { room: result });
  });

  // Toggle ready
  socket.on('lobbyReady', (data: { ready: boolean }) => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session?.roomId) return;

    const room = lobbyManager.setReady(session.roomId, session.playerId, data.ready);
    if (room) {
      io.to(session.roomId).emit('lobbyUpdate', { room });
    }
  });

  // Start game (host only)
  socket.on('lobbyStartGame', () => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session?.roomId) return;

    const room = lobbyManager.getRoom(session.roomId);
    if (!room) return;
    if (room.hostId !== session.playerId) return;
    if (!lobbyManager.canStartGame(session.roomId)) return;

    const updatedRoom = lobbyManager.startAlienSelection(session.roomId);
    if (updatedRoom) {
      // Send personalized alien choices to each player
      for (const player of updatedRoom.players) {
        const playerSocket = getSocketByPlayerId(io, sessionManager, player.id);
        if (playerSocket) {
          playerSocket.emit('alienChoices', {
            choices: player.alienChoices,
          });
        }
      }
      io.to(session.roomId).emit('lobbyUpdate', { room: updatedRoom });
    }
  });

  // Select alien
  socket.on('lobbySelectAlien', (data: { alienId: AlienId }) => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session?.roomId) return;

    const result = lobbyManager.selectAlien(session.roomId, session.playerId, data.alienId);
    if (typeof result === 'string') {
      socket.emit('error', { message: result });
      return;
    }

    io.to(session.roomId).emit('lobbyUpdate', { room: result });

    // Check if all have selected
    if (lobbyManager.allAliensSelected(session.roomId)) {
      // Create the game
      const room = lobbyManager.getRoom(session.roomId)!;
      const engine = gameManager.createGame(room);
      lobbyManager.setRoomStatus(session.roomId, 'IN_GAME');

      // Send initial game state to each player
      for (const player of room.players) {
        const playerSocket = getSocketByPlayerId(io, sessionManager, player.id);
        if (playerSocket) {
          playerSocket.emit('gameStarted', {});
          playerSocket.emit('gameStateUpdate', engine.getClientState(player.id));
        }
      }

      // Set up game action handlers for all connected sockets in the room
      for (const player of room.players) {
        const playerSocket = getSocketByPlayerId(io, sessionManager, player.id);
        if (playerSocket) {
          setupGameActionHandler(io, playerSocket, gameManager, sessionManager, session.roomId);
        }
      }
    }
  });

  // Game action handler (for players already in a game on reconnect)
  const existingSession = sessionManager.getSessionBySocketId(socket.id);
  if (existingSession?.roomId) {
    const engine = gameManager.getGame(existingSession.roomId);
    if (engine) {
      setupGameActionHandler(io, socket, gameManager, sessionManager, existingSession.roomId);
    }
  }
}

function setupGameActionHandler(
  io: Server,
  socket: Socket,
  gameManager: GameManager,
  sessionManager: SessionManager,
  _roomId: string
): void {
  // Avoid duplicate listeners
  if ((socket as any).__gameActionBound) return;
  (socket as any).__gameActionBound = true;

  socket.on('playerAction', (action) => {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (!session?.roomId) return;

    const engine = gameManager.getGame(session.roomId);
    if (!engine) return;

    const result = engine.applyAction(session.playerId, action);

    if (!result.success) {
      socket.emit('serverEvent', {
        type: 'ERROR',
        message: result.error ?? 'Invalid action',
        code: 'INVALID_ACTION',
      });
      return;
    }

    // Broadcast events
    if (result.events) {
      for (const event of result.events) {
        io.to(session.roomId).emit('serverEvent', event);
      }
    }

    // Send updated state to all players
    const playerIds = engine.getPlayerIds();
    for (const playerId of playerIds) {
      const playerSocket = getSocketByPlayerId(io, sessionManager, playerId);
      if (playerSocket) {
        playerSocket.emit('gameStateUpdate', engine.getClientState(playerId));
      }
    }
  });
}

function getSocketByPlayerId(io: Server, sessionManager: SessionManager, playerId: string): Socket | null {
  for (const [, socket] of io.sockets.sockets) {
    const session = sessionManager.getSessionBySocketId(socket.id);
    if (session?.playerId === playerId) {
      return socket;
    }
  }
  return null;
}
