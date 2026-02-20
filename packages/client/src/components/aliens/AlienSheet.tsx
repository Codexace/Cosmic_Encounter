import { ALIEN_CATALOG } from '@cosmic/shared';
import type { AlienId } from '@cosmic/shared';
import { useGameStore, useMyPlayerId } from '../../store/game-store.js';

interface Props {
  alienId?: AlienId | null;
  compact?: boolean;
}

export default function AlienSheet({ alienId, compact }: Props) {
  const myId = useMyPlayerId();
  const gameState = useGameStore((s) => s.gameState);

  const resolvedAlienId = alienId ?? (myId ? gameState?.players[myId]?.alienId : null);
  if (!resolvedAlienId) return null;

  const alien = ALIEN_CATALOG[resolvedAlienId];
  if (!alien) return null;

  const isActive = myId ? gameState?.players[myId]?.alienActive ?? true : true;

  if (compact) {
    return (
      <div style={styles.compact}>
        <span style={{
          ...styles.compactName,
          opacity: isActive ? 1 : 0.5,
          textDecoration: isActive ? 'none' : 'line-through',
        }}>
          {alien.name}
        </span>
        <span style={styles.compactSkill}>
          {alien.skillLevel === 'GREEN' ? '🟢' : alien.skillLevel === 'YELLOW' ? '🟡' : '🔴'}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.sheet,
      opacity: isActive ? 1 : 0.6,
    }}>
      <div style={styles.header}>
        <h3 style={styles.name}>{alien.name}</h3>
        <div style={styles.badges}>
          <span style={styles.skillBadge}>
            {alien.skillLevel === 'GREEN' ? '🟢' : alien.skillLevel === 'YELLOW' ? '🟡' : '🔴'}
            {' '}{alien.skillLevel}
          </span>
          <span style={styles.typeBadge}>
            {alien.powerType}
          </span>
        </div>
      </div>
      <p style={styles.shortDesc}>{alien.shortDescription}</p>
      <p style={styles.powerText}>{alien.powerText}</p>
      {!isActive && (
        <p style={styles.inactive}>Power inactive (fewer than 3 home colonies)</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sheet: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    transition: 'opacity 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    margin: 0,
    color: 'var(--accent-gold)',
  },
  badges: {
    display: 'flex',
    gap: '6px',
  },
  skillBadge: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
  },
  typeBadge: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
  },
  shortDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    margin: '0 0 8px 0',
    fontStyle: 'italic',
  },
  powerText: {
    fontSize: '0.75rem',
    color: 'var(--text-primary)',
    lineHeight: 1.5,
    margin: 0,
  },
  inactive: {
    fontSize: '0.7rem',
    color: 'var(--accent-red, #ff6b6b)',
    fontWeight: 600,
    marginTop: '8px',
  },
  compact: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  compactName: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.75rem',
    color: 'var(--accent-gold)',
  },
  compactSkill: {
    fontSize: '0.6rem',
  },
};
