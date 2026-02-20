import { useGameStore, useMyPlayerId, usePhase, useMyHand, useAmIOffense } from '../../store/game-store.js';
import PhaseIndicator from '../encounters/PhaseIndicator.js';
import PlayerArea from './PlayerArea.js';
import Hand from '../cards/Hand.js';
import GameLog from './GameLog.js';
import CenterArea from './CenterArea.js';
import ActionPanel from '../encounters/ActionPanel.js';
import GameOverOverlay from '../encounters/GameOverOverlay.js';

export default function GameBoard() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useMyPlayerId();

  if (!gameState || !myPlayerId) return null;

  const otherPlayers = gameState.turnOrder.filter((id) => id !== myPlayerId);

  return (
    <div style={styles.board}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <PhaseIndicator />
        <div style={styles.winTrack}>
          {gameState.turnOrder.map((pid) => {
            const p = gameState.players[pid];
            return (
              <span key={pid} style={{
                ...styles.winBadge,
                borderColor: `var(--player-${p.color.toLowerCase()})`,
                fontWeight: pid === gameState.activePlayerId ? 700 : 400,
                opacity: pid === gameState.activePlayerId ? 1 : 0.7,
              }}>
                {p.name}: {p.foreignColonies}/5
              </span>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div style={styles.mainArea}>
        {/* Other players */}
        <div style={styles.opponents}>
          {otherPlayers.map((pid) => (
            <PlayerArea key={pid} playerId={pid} />
          ))}
        </div>

        {/* Center */}
        <CenterArea />
      </div>

      {/* Bottom: my area */}
      <div style={styles.myArea}>
        <div style={styles.myInfo}>
          <PlayerArea playerId={myPlayerId} isMe />
        </div>
        <div style={styles.myHand}>
          <Hand />
        </div>
        <div style={styles.actionPanel}>
          <ActionPanel />
        </div>
      </div>

      {/* Side panel */}
      <div style={styles.sidePanel}>
        <GameLog />
      </div>

      {/* Game Over overlay */}
      <GameOverOverlay />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  board: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: '1fr 260px',
    gap: '0',
    overflow: 'hidden',
  },
  topBar: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
  },
  winTrack: {
    display: 'flex',
    gap: '12px',
  },
  winBadge: {
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '2px solid',
    background: 'var(--bg-surface)',
  },
  mainArea: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '8px',
    gap: '8px',
  },
  opponents: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  myArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
  },
  myInfo: {
    width: '200px',
    flexShrink: 0,
  },
  myHand: {
    flex: 1,
    overflow: 'hidden',
  },
  actionPanel: {
    width: '240px',
    flexShrink: 0,
  },
  sidePanel: {
    gridRow: '2 / 4',
    gridColumn: '2',
    borderLeft: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
};
