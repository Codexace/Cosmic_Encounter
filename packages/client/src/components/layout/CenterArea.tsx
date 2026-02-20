import { useGameStore } from '../../store/game-store.js';

export default function CenterArea() {
  const gameState = useGameStore((s) => s.gameState);
  if (!gameState) return null;

  return (
    <div style={styles.container}>
      {/* Warp */}
      <div style={styles.warp}>
        <h3 style={styles.sectionTitle}>THE WARP</h3>
        <div style={styles.warpShips}>
          {Object.entries(gameState.warp).map(([color, count]) => (
            count > 0 && (
              <span key={color} style={{
                ...styles.warpEntry,
                color: `var(--player-${color.toLowerCase()})`,
              }}>
                {count}
              </span>
            )
          ))}
          {Object.values(gameState.warp).every((c) => c === 0) && (
            <span style={styles.empty}>Empty</span>
          )}
        </div>
      </div>

      {/* Deck info */}
      <div style={styles.decks}>
        <div style={styles.deckPile}>
          <span style={styles.deckCount}>{gameState.cosmicDeckSize}</span>
          <span style={styles.deckLabel}>Cosmic Deck</span>
        </div>
        <div style={styles.deckPile}>
          <span style={styles.deckCount}>{gameState.destinyDeckSize}</span>
          <span style={styles.deckLabel}>Destiny Deck</span>
        </div>
      </div>

      {/* Encounter info */}
      <div style={styles.encounterInfo}>
        <span style={styles.encounterLabel}>
          Encounter {gameState.encounterNumber} of 2
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
  },
  warp: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '12px 20px',
    textAlign: 'center',
    minWidth: '200px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    color: 'var(--accent-red)',
    letterSpacing: '0.15em',
    marginBottom: '8px',
  },
  warpShips: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  warpEntry: {
    fontWeight: 700,
    fontSize: '1.2rem',
  },
  empty: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  decks: {
    display: 'flex',
    gap: '20px',
  },
  deckPile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  deckCount: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--accent-blue)',
  },
  deckLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  encounterInfo: {
    padding: '6px 16px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
  },
  encounterLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
};
