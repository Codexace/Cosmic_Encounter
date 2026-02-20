import { useState } from 'react';
import { useGameStore, usePhase, useAmIOffense, useMyPlayerId, useMyHand } from '../../store/game-store.js';
import { getSocket } from '../../socket.js';
import { Phase, CardType, isEncounterCard } from '@cosmic/shared';
import type { PlayerAction, CosmicCard } from '@cosmic/shared';

export default function ActionPanel() {
  const phase = usePhase();
  const isOffense = useAmIOffense();
  const myId = useMyPlayerId();
  const hand = useMyHand();
  const gameState = useGameStore((s) => s.gameState);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const sendAction = (action: PlayerAction) => {
    getSocket().emit('playerAction', action);
    setSelectedCardId(null);
  };

  if (!gameState || !myId) return null;

  const phaseData = gameState.phaseData as any;

  switch (phase) {
    case Phase.START_TURN:
      if (isOffense) {
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Your turn begins</p>
            {phaseData.mustDrawNewHand && (
              <p style={styles.warning}>You need encounter cards — drawing new hand...</p>
            )}
          </div>
        );
      }
      return <Waiting text="Waiting for offense..." />;

    case Phase.REGROUP:
      if (isOffense) {
        const warpCount = gameState.warp[gameState.players[myId].color] ?? 0;
        if (warpCount === 0) {
          return (
            <div style={styles.panel}>
              <p style={styles.info}>No ships in warp to retrieve</p>
              <button className="btn btn-primary" onClick={() => sendAction({ type: 'REGROUP_RETRIEVE', destination: '' })}>
                Continue
              </button>
            </div>
          );
        }
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Retrieve a ship from the warp</p>
            <p style={styles.hint}>Click a planet to send the ship there</p>
            {gameState.players[myId].planets.map((planet) => (
              <button
                key={planet.id}
                className="btn btn-secondary"
                onClick={() => sendAction({ type: 'REGROUP_RETRIEVE', destination: planet.id })}
                style={{ fontSize: '0.8rem', margin: '2px' }}
              >
                Planet {planet.id.split('_')[1]}
              </button>
            ))}
          </div>
        );
      }
      return <Waiting text="Offense is regrouping..." />;

    case Phase.DESTINY:
      if (isOffense) {
        if (!phaseData.drawnCard) {
          return (
            <div style={styles.panel}>
              <button className="btn btn-primary btn-lg" onClick={() => sendAction({ type: 'DESTINY_DRAW' })}>
                Draw Destiny Card
              </button>
            </div>
          );
        }
        // Card drawn — might need to make a choice
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Destiny card drawn</p>
            {phaseData.drawnCard?.destinyType === 'WILD' && (
              <div>
                <p style={styles.hint}>Choose a player to encounter</p>
                {gameState.turnOrder.filter((id) => id !== myId).map((pid) => (
                  <button
                    key={pid}
                    className="btn btn-secondary"
                    onClick={() => sendAction({ type: 'DESTINY_CHOOSE_WILD', targetPlayerId: pid })}
                    style={{ margin: '2px' }}
                  >
                    {gameState.players[pid].name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
      return <Waiting text="Destiny card being drawn..." />;

    case Phase.LAUNCH:
      if (isOffense) {
        if (!phaseData.targetPlanetId) {
          const targetColor = phaseData.targetSystemColor;
          const targetPlayer = Object.values(gameState.players).find((p) => p.color === targetColor);
          return (
            <div style={styles.panel}>
              <p style={styles.info}>Aim the hyperspace gate</p>
              {targetPlayer?.planets.map((planet) => (
                <button
                  key={planet.id}
                  className="btn btn-secondary"
                  onClick={() => sendAction({ type: 'LAUNCH_AIM', targetPlanetId: planet.id })}
                  style={{ margin: '2px', fontSize: '0.8rem' }}
                >
                  Planet {planet.id.split('_')[1]}
                </button>
              ))}
            </div>
          );
        }
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Commit ships to the gate (1-4)</p>
            {gameState.players[myId].planets.map((planet) => {
              const myColony = planet.colonies.find((c) => c.playerColor === gameState.players[myId].color);
              if (!myColony || myColony.shipCount === 0) return null;
              return (
                <button
                  key={planet.id}
                  className="btn btn-secondary"
                  onClick={() => sendAction({
                    type: 'LAUNCH_COMMIT',
                    ships: [{ planetId: planet.id, count: Math.min(myColony.shipCount, 4) }],
                  })}
                  style={{ margin: '2px', fontSize: '0.8rem' }}
                >
                  {planet.id.split('_')[1]}: {myColony.shipCount} ships
                </button>
              );
            })}
          </div>
        );
      }
      return <Waiting text="Offense is launching..." />;

    case Phase.ALLIANCE:
      if (isOffense) {
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Invite allies (or skip)</p>
            <button
              className="btn btn-primary"
              onClick={() => sendAction({ type: 'ALLIANCE_INVITE_OFFENSE', invitedPlayerIds: gameState.turnOrder.filter((id) => id !== myId && id !== phaseData.defensePlayerId) })}
            >
              Invite All
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => sendAction({ type: 'ALLIANCE_INVITE_OFFENSE', invitedPlayerIds: [] })}
            >
              Skip
            </button>
          </div>
        );
      }
      if (myId === phaseData.defensePlayerId) {
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Invite allies (or skip)</p>
            <button
              className="btn btn-primary"
              onClick={() => sendAction({ type: 'ALLIANCE_INVITE_DEFENSE', invitedPlayerIds: gameState.turnOrder.filter((id) => id !== myId && id !== gameState.activePlayerId) })}
            >
              Invite All
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => sendAction({ type: 'ALLIANCE_INVITE_DEFENSE', invitedPlayerIds: [] })}
            >
              Skip
            </button>
          </div>
        );
      }
      if (phaseData.currentResponderId === myId) {
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Choose a side</p>
            <button className="btn btn-primary" onClick={() => sendAction({ type: 'ALLIANCE_RESPOND', response: 'offense', shipCount: 1, shipSources: [] })}>
              Join Offense
            </button>
            <button className="btn btn-secondary" onClick={() => sendAction({ type: 'ALLIANCE_RESPOND', response: 'defense', shipCount: 1, shipSources: [] })}>
              Join Defense
            </button>
            <button className="btn btn-danger" onClick={() => sendAction({ type: 'ALLIANCE_RESPOND', response: 'decline' })}>
              Decline
            </button>
          </div>
        );
      }
      return <Waiting text="Alliances being formed..." />;

    case Phase.PLANNING:
      if (isOffense || myId === phaseData.defensePlayerId) {
        const encounterCards = hand.filter(isEncounterCard);
        return (
          <div style={styles.panel}>
            <p style={styles.info}>Select an encounter card</p>
            <div style={styles.cardList}>
              {encounterCards.map((card) => (
                <button
                  key={card.id}
                  className={`btn ${selectedCardId === card.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    sendAction({ type: 'PLANNING_SELECT_CARD', cardId: card.id });
                  }}
                  style={{ fontSize: '0.8rem', margin: '2px' }}
                >
                  {card.type === CardType.ATTACK ? `ATK ${card.value}` :
                   card.type === CardType.NEGOTIATE ? 'Negotiate' : 'Morph'}
                </button>
              ))}
            </div>
          </div>
        );
      }
      return <Waiting text="Main players selecting cards..." />;

    case Phase.REVEAL:
      return (
        <div style={styles.panel}>
          <p style={styles.info}>
            Offense: {phaseData.offenseTotal} vs Defense: {phaseData.defenseTotal}
          </p>
          {hand.some((c) => c.type === CardType.REINFORCEMENT) && (
            <div>
              <p style={styles.hint}>Play reinforcements?</p>
              {hand.filter((c) => c.type === CardType.REINFORCEMENT).map((card) => (
                <button
                  key={card.id}
                  className="btn btn-secondary"
                  onClick={() => sendAction({
                    type: 'REVEAL_PLAY_REINFORCEMENT',
                    cardId: card.id,
                    side: isOffense ? 'offense' : 'defense',
                  })}
                  style={{ fontSize: '0.8rem', margin: '2px' }}
                >
                  +{card.type === CardType.REINFORCEMENT ? card.value : '?'}
                </button>
              ))}
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={() => sendAction({ type: 'REVEAL_PASS_REINFORCEMENT' })}
          >
            Pass
          </button>
        </div>
      );

    case Phase.RESOLUTION:
      if (phaseData.canHaveSecondEncounter && isOffense) {
        return (
          <div style={styles.panel}>
            <p style={styles.info}>You won! Have a second encounter?</p>
            <button className="btn btn-primary" onClick={() => sendAction({ type: 'SECOND_ENCOUNTER_DECISION', proceed: true })}>
              Second Encounter
            </button>
            <button className="btn btn-secondary" onClick={() => sendAction({ type: 'SECOND_ENCOUNTER_DECISION', proceed: false })}>
              End Turn
            </button>
          </div>
        );
      }
      return (
        <div style={styles.panel}>
          <p style={styles.info}>Encounter resolved</p>
        </div>
      );

    default:
      return null;
  }
}

function ArtifactFlareButtons() {
  const hand = useMyHand();
  const myId = useMyPlayerId();
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState || !myId) return null;

  const artifacts = hand.filter((c) => c.type === CardType.ARTIFACT);
  const flares = hand.filter((c) => c.type === CardType.FLARE);

  if (artifacts.length === 0 && flares.length === 0) return null;

  const sendAction = (action: PlayerAction) => {
    getSocket().emit('playerAction', action);
  };

  return (
    <div style={styles.specialCards}>
      {artifacts.map((card) => (
        <button
          key={card.id}
          className="btn btn-secondary"
          onClick={() => sendAction({ type: 'PLAY_ARTIFACT', cardId: card.id })}
          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          title={card.type === CardType.ARTIFACT ? (card as any).artifactType : ''}
        >
          🔮 {card.type === CardType.ARTIFACT ? (card as any).artifactType : 'Artifact'}
        </button>
      ))}
      {flares.map((card) => (
        <button
          key={card.id}
          className="btn btn-secondary"
          onClick={() => sendAction({ type: 'PLAY_FLARE', cardId: card.id, mode: 'wild' })}
          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          title="Play as wild flare"
        >
          ⚡ Flare
        </button>
      ))}
    </div>
  );
}

function Waiting({ text }: { text: string }) {
  return (
    <div style={styles.panel}>
      <p style={styles.waiting}>{text}</p>
      <ArtifactFlareButtons />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  info: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  hint: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  warning: {
    fontSize: '0.78rem',
    color: 'var(--accent-gold)',
  },
  waiting: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  cardList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
  },
  specialCards: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '3px',
    marginTop: '4px',
    paddingTop: '4px',
    borderTop: '1px solid var(--border-color)',
  },
};
