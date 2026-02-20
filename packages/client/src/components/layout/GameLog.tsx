import { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/game-store.js';

export default function GameLog() {
  const log = useGameStore((s) => s.gameState?.gameLog ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Game Log</h3>
      <div style={styles.entries}>
        {log.map((entry, i) => (
          <div key={i} style={styles.entry}>
            <span style={styles.message}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border-color)',
    letterSpacing: '0.1em',
  },
  entries: {
    flex: 1,
    overflow: 'auto',
    padding: '8px',
  },
  entry: {
    padding: '4px 6px',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(42, 50, 80, 0.3)',
  },
  message: {},
};
