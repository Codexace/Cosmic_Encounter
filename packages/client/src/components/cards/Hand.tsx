import { useMyHand } from '../../store/game-store.js';
import CardFace from './CardFace.js';
import type { CosmicCard } from '@cosmic/shared';

export default function Hand() {
  const hand = useMyHand();

  return (
    <div style={styles.container}>
      {hand.map((card, index) => (
        <div
          key={card.id}
          style={{
            ...styles.cardWrapper,
            transform: `translateX(${index * -8}px)`,
            zIndex: index,
          }}
        >
          <CardFace card={card} />
        </div>
      ))}
      {hand.length === 0 && (
        <span style={styles.empty}>No cards in hand</span>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'auto',
    padding: '4px 8px',
  },
  cardWrapper: {
    flexShrink: 0,
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  empty: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
};
