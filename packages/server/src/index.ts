import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LobbyManager } from './lobby/lobby-manager.js';
import { setupLobbyHandlers } from './lobby/lobby-handlers.js';
import { SessionManager } from './middleware/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
app.use(cors());
app.use(express.json());

// Health check (before static file serving)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), env: NODE_ENV });
});

// Serve client static files in production
if (NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: NODE_ENV === 'development' ? 'http://localhost:5173' : undefined,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const sessionManager = new SessionManager();
const lobbyManager = new LobbyManager();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  setupLobbyHandlers(io, socket, lobbyManager, sessionManager);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    sessionManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Cosmic Encounter server running on port ${PORT} (${NODE_ENV})`);
});
