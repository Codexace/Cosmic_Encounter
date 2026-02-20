import { useGameStore } from '../../store/game-store.js';
import type { PlayerId } from '@cosmic/shared';
import { ALIEN_CATALOG } from '@cosmic/shared';

interface Props {
  playerId: PlayerId;
  isMe?: boolean;
}

export default function PlayerArea({ playerId, isMe }: Props) {
  const player = useGameStore((s) => s.gameState?.players[playerId]);
  const activePlayerId = useGameStore((s) => s.gameState?.activePlayerId);

  if (!player) return null;

  const colorVar = `var(--player-${player.color.toLowerCase()})`;
  const isActive = playerId === activePlayerId;
  const alien = player.alienId ? ALIEN_CATALOG[player.alienId] : null;

  return (
    <div style={{
      ...styles.container,
      borderColor: isActive ? colorVar : 'var(--border-color)',
      ...(isMe ? styles.meContainer : {}),
    }}>
      <div style={styles.header}>
        <div style={{ ...styles.colorDot, background: colorVar }} />
        <span style={styles.name}>{player.name}</span>
        {isActive && <span style={styles.activeBadge}>OFFENSE</span>}
      </div>

      {alien && (
        <div style={styles.alienInfo}>
          <span style={styles.alienName}>{alien.name}</span>
          {!player.alienActive && <span style={styles.lostPower}>POWER LOST</span>}
        </div>
      )}

      <div style={styles.stats}>
        <span>Ships in hand: {player.handSize}</span>
        <span>Colonies: {player.foreignColonies}/5</span>
        <span>Home: {player.homeColonies}/5</span>
      </div>

      {/* Planet display */}
      <div style={styles.planets}>
        {player.planets.map((planet) => (
          <div key={planet.id} style={styles.planet}>
            <div style={{ ...styles.planetCircle, borderColor: colorVar }}>
              {planet.colonies.map((colony) => (
                <span
                  key={colony.playerColor}
                  style={{
                    ...styles.shipCount,
                    color: `var(--player-${colony.playerColor.toLowerCase()})`,
                  }}
                >
                  {colony.shipCount}
                </span>
              ))}
              {planet.colonies.length === 0 && (
                <span style={styles.emptyPlanet}>-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--bg-surface)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 10px',
    fontSize: '0.78rem',
    minWidth: '160px',
    maxWidth: '220px',
  },
  meContainer: {
    maxWidth: 'none',
    minWidth: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  name: {
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  activeBadge: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--accent-gold)',
    marginLeft: 'auto',
  },
  alienInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  alienName: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    color: 'var(--accent-purple)',
  },
  lostPower: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--accent-red)',
  },
  stats: {
    display: 'flex',
    gap: '8px',
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    marginBottom: '6px',
    flexWrap: 'wrap' as const,
  },
  planets: {
    display: 'flex',
    gap: '4px',
  },
  planet: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  planetCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-elevated)',
    gap: '1px',
    fontSize: '0.65rem',
    fontWeight: 700,
  },
  shipCount: {
    fontWeight: 700,
  },
  emptyPlanet: {
    color: 'var(--text-muted)',
  },
};
