import { useGameStore, useMyPlayerId } from '../../store/game-store.js';

export default function GameOverOverlay() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useMyPlayerId();

  if (!gameState?.winners || gameState.winners.length === 0) return null;

  const iWon = myPlayerId ? gameState.winners.includes(myPlayerId) : false;
  const winnerNames = gameState.winners
    .map((pid) => gameState.players[pid]?.name ?? pid)
    .join(', ');

  const isSharedWin = gameState.winners.length > 1;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={iWon ? styles.victoryIcon : styles.defeatIcon}>
          {iWon ? '🏆' : '💫'}
        </div>
        <h1 style={iWon ? styles.victoryTitle : styles.defeatTitle}>
          {iWon
            ? isSharedWin
              ? 'Shared Victory!'
              : 'You Win!'
            : 'Game Over'}
        </h1>
        <p style={styles.subtitle}>
          {isSharedWin
            ? `${winnerNames} share the win with 5 foreign colonies each!`
            : `${winnerNames} wins with 5 foreign colonies!`}
        </p>
        <div style={styles.scoreboard}>
          {gameState.turnOrder.map((pid) => {
            const p = gameState.players[pid];
            const isWinner = gameState.winners!.includes(pid);
            return (
              <div
                key={pid}
                style={{
                  ...styles.scoreRow,
                  background: isWinner ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                  borderColor: `var(--player-${p.color.toLowerCase()})`,
                }}
              >
                <span style={styles.scoreName}>
                  {isWinner && '⭐ '}
                  {p.name}
                  {pid === myPlayerId && ' (You)'}
                </span>
                <span style={styles.scoreColonies}>
                  {p.foreignColonies} / 5 colonies
                </span>
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => window.location.href = '/'}
          style={{ marginTop: '16px' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border-color)',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '480px',
    width: '90%',
  },
  victoryIcon: {
    fontSize: '4rem',
    marginBottom: '8px',
  },
  defeatIcon: {
    fontSize: '4rem',
    marginBottom: '8px',
  },
  victoryTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: 'var(--accent-gold)',
    margin: '0 0 8px 0',
  },
  defeatTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  scoreboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
  },
  scoreName: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  scoreColonies: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
};
