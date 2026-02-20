import { usePhase, useAmIOffense, useGameStore } from '../../store/game-store.js';
import { Phase } from '@cosmic/shared';

const PHASE_LABELS: Record<string, string> = {
  [Phase.START_TURN]: 'Start Turn',
  [Phase.REGROUP]: 'Regroup',
  [Phase.DESTINY]: 'Destiny',
  [Phase.LAUNCH]: 'Launch',
  [Phase.ALLIANCE]: 'Alliance',
  [Phase.PLANNING]: 'Planning',
  [Phase.REVEAL]: 'Reveal',
  [Phase.RESOLUTION]: 'Resolution',
};

const PHASE_ORDER = [
  Phase.REGROUP,
  Phase.DESTINY,
  Phase.LAUNCH,
  Phase.ALLIANCE,
  Phase.PLANNING,
  Phase.REVEAL,
  Phase.RESOLUTION,
];

export default function PhaseIndicator() {
  const phase = usePhase();
  const isOffense = useAmIOffense();
  const activeName = useGameStore((s) => {
    if (!s.gameState) return '';
    return s.gameState.players[s.gameState.activePlayerId]?.name ?? '';
  });

  return (
    <div style={styles.container}>
      <span style={styles.turnLabel}>
        {isOffense ? "Your Turn" : `${activeName}'s Turn`}
      </span>
      <div style={styles.phases}>
        {PHASE_ORDER.map((p) => (
          <span
            key={p}
            style={{
              ...styles.phase,
              ...(p === phase ? styles.activePhase : {}),
            }}
          >
            {PHASE_LABELS[p]}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  turnLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--accent-gold)',
    whiteSpace: 'nowrap' as const,
  },
  phases: {
    display: 'flex',
    gap: '2px',
  },
  phase: {
    fontSize: '0.7rem',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    background: 'transparent',
    transition: 'all 0.2s',
  },
  activePhase: {
    background: 'var(--accent-blue)',
    color: 'white',
    fontWeight: 600,
  },
};
