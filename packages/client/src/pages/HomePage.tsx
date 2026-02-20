import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../socket.js';
import { useLobbyStore } from '../store/lobby-store.js';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession, setPlayerName: storeName, setRoom } = useLobbyStore();

  const ensureSession = (callback: () => void) => {
    setError(null);
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    const socket = connectSocket();

    socket.emit('createSession', { playerName: playerName.trim() }, (res: any) => {
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setSession(res.sessionToken, res.playerId);
      storeName(playerName.trim());
      callback();
    });
  };

  const handleCreate = () => {
    ensureSession(() => {
      const socket = getSocket();
      socket.emit('lobbyCreate', {}, (res: any) => {
        setLoading(false);
        if (res.error) {
          setError(res.error);
          return;
        }
        navigate(`/lobby/${res.roomCode}`);
      });
    });
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    ensureSession(() => {
      const socket = getSocket();
      socket.emit('lobbyJoin', { roomCode: joinCode.trim().toUpperCase() }, (res: any) => {
        setLoading(false);
        if (res.error) {
          setError(res.error);
          return;
        }
        navigate(`/lobby/${res.roomCode}`);
      });
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>COSMIC ENCOUNTER</h1>
        <p style={styles.subtitle}>Online Multiplayer</p>

        <div style={styles.form}>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={styles.input}
            maxLength={20}
          />

          <button
            className="btn btn-primary btn-lg"
            onClick={handleCreate}
            disabled={loading}
            style={styles.createBtn}
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <div style={styles.joinRow}>
            <input
              type="text"
              placeholder="Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ ...styles.input, flex: 1, textTransform: 'uppercase', letterSpacing: '0.2em' }}
              maxLength={4}
            />
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleJoin}
              disabled={loading}
            >
              Join
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>

      <div style={styles.starfield} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  starfield: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0e1a 70%)',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '48px',
    maxWidth: '440px',
    width: '100%',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.8rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #4a90d9, #7c5cbf, #d4a843)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    marginBottom: '40px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    textAlign: 'center',
  },
  createBtn: {
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '8px 0',
  },
  dividerText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    flex: 1,
  },
  joinRow: {
    display: 'flex',
    gap: '12px',
  },
  error: {
    color: 'var(--accent-red)',
    fontSize: '0.9rem',
  },
};
