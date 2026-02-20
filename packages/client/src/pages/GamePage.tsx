import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../socket.js';
import { useGameStore } from '../store/game-store.js';
import { useLobbyStore } from '../store/lobby-store.js';
import GameBoard from '../components/layout/GameBoard.js';
import type { ClientGameState, ServerEvent } from '@cosmic/shared';

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { gameState, setGameState } = useGameStore();
  const sessionToken = useLobbyStore((s) => s.sessionToken);
  const [connected, setConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('gameStateUpdate', (state: ClientGameState) => {
      setGameState(state);
      setReconnecting(false);
      setConnected(true);
    });

    socket.on('serverEvent', (event: ServerEvent) => {
      if (event.type === 'ERROR') {
        setErrorMsg((event as any).message ?? 'An error occurred');
        setTimeout(() => setErrorMsg(null), 4000);
      }
    });

    socket.on('connect', () => {
      setConnected(true);
      // Re-authenticate on reconnect
      if (sessionToken) {
        socket.emit('authenticate', { sessionToken }, (resp: any) => {
          if (resp?.error) {
            setErrorMsg('Failed to reconnect: ' + resp.error);
          }
        });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setReconnecting(true);
    });

    socket.on('reconnect_attempt', () => {
      setReconnecting(true);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('serverEvent');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
    };
  }, [setGameState, sessionToken]);

  if (!gameState) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading game...</p>
          {roomCode && (
            <p style={styles.roomCode}>Room: {roomCode}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <GameBoard />

      {/* Connection status banner */}
      {!connected && (
        <div style={styles.connectionBanner}>
          <span style={styles.connectionDot} />
          {reconnecting ? 'Reconnecting...' : 'Disconnected'}
        </div>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div style={styles.errorToast}>
          {errorMsg}
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '40px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--accent-blue)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  roomCode: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  connectionBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '8px 16px',
    background: 'rgba(255, 107, 107, 0.95)',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
    textAlign: 'center',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'white',
    opacity: 0.8,
  },
  errorToast: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    background: 'rgba(255, 107, 107, 0.95)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 500,
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
};
