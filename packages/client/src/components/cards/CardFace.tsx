import type { CosmicCard } from '@cosmic/shared';
import { CardType } from '@cosmic/shared';

interface Props {
  card: CosmicCard;
  small?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export default function CardFace({ card, small, onClick, selected }: Props) {
  const size = small ? 'small' : 'normal';

  let label = '';
  let color = 'var(--text-primary)';
  let bgColor = 'var(--bg-elevated)';

  switch (card.type) {
    case CardType.ATTACK:
      label = `ATK ${String(card.value).padStart(2, '0')}`;
      bgColor = '#2a1a1a';
      color = '#ff6b6b';
      break;
    case CardType.NEGOTIATE:
      label = 'NEGOTIATE';
      bgColor = '#1a2a1a';
      color = '#6bff6b';
      break;
    case CardType.MORPH:
      label = 'MORPH';
      bgColor = '#2a1a2a';
      color = '#d4a8ff';
      break;
    case CardType.REINFORCEMENT:
      label = `+${card.value}`;
      bgColor = '#1a1a2a';
      color = '#6b9bff';
      break;
    case CardType.ARTIFACT:
      label = card.artifactType.replace(/_/g, ' ');
      bgColor = '#2a2a1a';
      color = '#ffd700';
      break;
    case CardType.FLARE:
      label = `FLARE`;
      bgColor = '#1a2a2a';
      color = '#6bffff';
      break;
  }

  return (
    <div
      style={{
        ...styles.card,
        ...(size === 'small' ? styles.small : {}),
        background: bgColor,
        borderColor: selected ? 'var(--accent-gold)' : 'var(--border-color)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <span style={{ ...styles.label, color }}>{label}</span>
      <span style={styles.type}>{card.type}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '70px',
    height: '100px',
    borderRadius: '6px',
    border: '2px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '4px',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  small: {
    width: '50px',
    height: '72px',
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    fontWeight: 700,
    textAlign: 'center',
  },
  type: {
    fontSize: '0.55rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
};
