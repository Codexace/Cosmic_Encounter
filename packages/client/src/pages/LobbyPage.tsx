import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../socket.js';
import { useLobbyStore } from '../store/lobby-store.js';
import { useGameStore } from '../store/game-store.js';
import type { LobbyRoom, AlienDefinition, AlienId } from '@cosmic/shared';

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { playerId, room, setRoom, alienChoices, setAlienChoices } = useLobbyStore();
  const { setGameState } = useGameStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on('lobbyUpdate', (data: { room: LobbyRoom }) => {
      setRoom(data.room);
    });

    socket.on('alienChoices', (data: { choices: AlienDefinition[] }) => {
      setAlienChoices(data.choices);
    });

    socket.on('gameStarted', () => {
      navigate(`/game/${roomCode}`);
    });

    socket.on('gameStateUpdate', (state: any) => {
      setGameState(state);
      navigate(`/game/${roomCode}`);
    });

    socket.on('lobbyKicked', () => {
      setRoom(null);
      navigate('/');
    });

    return () => {
      socket.off('lobbyUpdate');
      socket.off('alienChoices');
      socket.off('gameStarted');
      socket.off('gameStateUpdate');
      socket.off('lobbyKicked');
    };
  }, [roomCode, navigate, setRoom, setAlienChoices, setGameState]);

  const handleReady = () => {
    const socket = getSocket();
    const currentPlayer = room?.players.find((p) => p.id === playerId);
    socket.emit('lobbyReady', { ready: !currentPlayer?.ready });
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('lobbyStartGame');
  };

  const handleSelectAlien = (alienId: AlienId) => {
    const socket = getSocket();
    socket.emit('lobbySelectAlien', { alienId });
    setAlienChoices(null);
  };

  const handleKick = (targetPlayerId: string) => {
    const socket = getSocket();
    socket.emit('lobbyKick', { targetPlayerId }, (res: any) => {
      if (res?.error) {
        console.error('Kick failed:', res.error);
      }
    });
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!room) {
    return (
      <div style={styles.container}>
        <p>Connecting to room...</p>
      </div>
    );
  }

  const isHost = room.hostId === playerId;
  const allReady = room.players.length >= room.config.minPlayers && room.players.every((p) => p.ready);
  const currentPlayer = room.players.find((p) => p.id === playerId);

  // Alien selection phase
  if (room.status === 'ALIEN_SELECT' && alienChoices) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Choose Your Alien</h2>
          <div style={styles.alienChoices}>
            {alienChoices.map((alien) => (
              <button
                key={alien.id}
                style={styles.alienCard}
                onClick={() => handleSelectAlien(alien.id)}
              >
                <h3 style={styles.alienName}>{alien.name}</h3>
                <p style={styles.alienShort}>{alien.shortDescription}</p>
                <p style={styles.alienPower}>{alien.powerText}</p>
                <span style={{
                  ...styles.skillBadge,
                  background: alien.skillLevel === 'GREEN' ? 'var(--accent-green)' :
                    alien.skillLevel === 'YELLOW' ? 'var(--player-yellow)' : 'var(--accent-red)',
                  color: alien.skillLevel === 'YELLOW' ? '#000' : '#fff',
                }}>
                  {alien.skillLevel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (room.status === 'ALIEN_SELECT') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Waiting for others to choose...</h2>
          <p style={styles.textMuted}>
            {room.players.filter((p) => p.selectedAlien).length} / {room.players.length} selected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Game Lobby</h2>

        <div style={styles.codeRow}>
          <span style={styles.codeLabel}>Room Code:</span>
          <span style={styles.code}>{roomCode}</span>
          <button className="btn btn-secondary" onClick={handleCopyCode} style={{ fontSize: '0.8rem' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div style={styles.playerList}>
          <h3 style={styles.subheading}>
            Players ({room.players.length}/{room.config.maxPlayers})
          </h3>
          {room.players.map((player) => (
            <div key={player.id} style={styles.playerRow}>
              <span>{player.name}</span>
              <span style={{
                color: player.ready ? 'var(--accent-green)' : 'var(--text-muted)',
                fontWeight: 600,
              }}>
                {player.ready ? 'Ready' : 'Not Ready'}
              </span>
              {player.id === room.hostId && (
                <span style={styles.hostBadge}>HOST</span>
              )}
              {isHost && player.id !== playerId && room.status === 'WAITING' && (
                <button
                  style={styles.kickButton}
                  onClick={() => handleKick(player.id)}
                  title={`Remove ${player.name} from lobby`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          <button
            className={`btn ${currentPlayer?.ready ? 'btn-danger' : 'btn-success'} btn-lg`}
            onClick={handleReady}
            style={{ flex: 1 }}
          >
            {currentPlayer?.ready ? 'Unready' : 'Ready Up'}
          </button>

          {isHost && (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStartGame}
              disabled={!allReady}
              style={{ flex: 1, opacity: allReady ? 1 : 0.5 }}
            >
              Start Game
            </button>
          )}
        </div>

        {room.players.length < room.config.minPlayers && (
          <p style={styles.textMuted}>
            Need {room.config.minPlayers - room.players.length} more player(s) to start
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border-color)',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.4rem',
    marginBottom: '24px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
    padding: '12px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
  },
  codeLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  code: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 900,
    letterSpacing: '0.2em',
    color: 'var(--accent-gold)',
  },
  playerList: {
    marginBottom: '24px',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '6px',
  },
  hostBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--accent-gold)',
    background: 'rgba(212, 168, 67, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: 'auto',
  },
  kickButton: {
    marginLeft: 'auto',
    background: 'transparent',
    border: '1px solid var(--accent-red, #e74c3c)',
    color: 'var(--accent-red, #e74c3c)',
    borderRadius: '4px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
    lineHeight: 1,
    padding: 0,
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  textMuted: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '12px',
  },
  alienChoices: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  alienCard: {
    background: 'var(--bg-elevated)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    maxWidth: '220px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'var(--text-primary)',
    position: 'relative' as const,
  },
  alienName: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    marginBottom: '4px',
  },
  alienShort: {
    color: 'var(--accent-gold)',
    fontSize: '0.8rem',
    marginBottom: '8px',
  },
  alienPower: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  skillBadge: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
  },
};
