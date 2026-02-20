import type {
  GameState,
  PlayerId,
  CardId,
  CosmicCard,
  ArtifactCard,
  PlayerState,
  AllianceData,
  RevealData,
  PlanningData,
} from '@cosmic/shared';
import {
  ArtifactType,
  CardType,
  Phase,
  GAME_CONFIG,
} from '@cosmic/shared';
import type { ServerEvent } from '@cosmic/shared';
import { DeckManager } from './deck-manager.js';

export interface ArtifactResult {
  success: boolean;
  error?: string;
  events: ServerEvent[];
  /** When true the current encounter should be cancelled (Ionic Gas). */
  cancelEncounter?: boolean;
}

/**
 * Handles playing artifact cards.
 *
 * Each artifact type has:
 *  - A timing window (validPhases on the card definition)
 *  - An effect (implemented below)
 *  - Optional targets (another player or another card)
 */
export class ArtifactHandler {
  constructor(private deckManager: DeckManager) {}

  /**
   * Main entry point -- validate and apply an artifact card.
   *
   * @param state     Current game state (mutated in-place).
   * @param playerId  The player who is playing the artifact.
   * @param cardId    The artifact card id from the player's hand.
   * @param target    Optional target -- a PlayerId or CardId depending on the artifact.
   */
  playArtifact(
    state: GameState,
    playerId: PlayerId,
    cardId: CardId,
    target?: PlayerId | CardId,
  ): ArtifactResult {
    const events: ServerEvent[] = [];

    // ---- Validate card is in hand ----
    const player = state.players[playerId];
    if (!player) {
      return { success: false, error: 'Player not found', events };
    }

    if (!player.hand.includes(cardId)) {
      return { success: false, error: 'Card not in hand', events };
    }

    const card = state.allCards[cardId];
    if (!card || card.type !== CardType.ARTIFACT) {
      return { success: false, error: 'Card is not an artifact', events };
    }

    const artifact = card as ArtifactCard;

    // ---- Validate timing ----
    if (!artifact.validPhases.includes(state.phase as Phase)) {
      return {
        success: false,
        error: `Cannot play ${artifact.artifactType} during ${state.phase}`,
        events,
      };
    }

    // ---- Remove card from hand and discard ----
    player.hand = player.hand.filter((id) => id !== cardId);
    state.cosmicDiscard.push(cardId);

    // Emit the ARTIFACT_PLAYED event
    events.push({ type: 'ARTIFACT_PLAYED', playerId, artifact });

    // ---- Dispatch to the correct effect handler ----
    let cancelEncounter = false;

    switch (artifact.artifactType) {
      case ArtifactType.COSMIC_ZAP:
        if (!target) {
          return this.rollback(state, player, cardId, 'COSMIC_ZAP requires a target player', events);
        }
        this.applyCosmicZap(state, target as PlayerId, events);
        break;

      case ArtifactType.CARD_ZAP:
        if (!target) {
          return this.rollback(state, player, cardId, 'CARD_ZAP requires a target card', events);
        }
        this.applyCardZap(state, target as CardId, events);
        break;

      case ArtifactType.MOBIUS_TUBES:
        this.applyMobiusTubes(state, playerId, events);
        break;

      case ArtifactType.PLAGUE:
        if (!target) {
          return this.rollback(state, player, cardId, 'PLAGUE requires a target player', events);
        }
        this.applyPlague(state, target as PlayerId, events);
        break;

      case ArtifactType.FORCE_FIELD:
        this.applyForceField(state, events);
        break;

      case ArtifactType.EMOTION_CONTROL:
        if (!target) {
          return this.rollback(state, player, cardId, 'EMOTION_CONTROL requires a target player', events);
        }
        this.applyEmotionControl(state, target as PlayerId, events);
        break;

      case ArtifactType.IONIC_GAS:
        this.applyIonicGas(state, events);
        cancelEncounter = true;
        break;

      case ArtifactType.QUASH:
        // Quash is defined in the enum but has no implementation yet.
        break;

      default: {
        // Exhaustiveness guard -- if a new artifact type is added this will
        // produce a compile-time error when its handler is missing.
        const _exhaustive: never = artifact.artifactType;
        return { success: false, error: `Unknown artifact type: ${_exhaustive}`, events };
      }
    }

    return { success: true, events, cancelEncounter };
  }

  // ------------------------------------------------------------------
  // Individual artifact effect implementations
  // ------------------------------------------------------------------

  /**
   * COSMIC_ZAP -- Cancel one alien power for the rest of the encounter.
   */
  private applyCosmicZap(
    state: GameState,
    targetPlayerId: PlayerId,
    events: ServerEvent[],
  ): void {
    const target = state.players[targetPlayerId];
    if (!target) return;

    target.alienData._zappedUntilEndOfEncounter = true;

    events.push({
      type: 'ALIEN_POWER_ZAPPED',
      playerId: targetPlayerId,
      alienId: target.alienId!,
    });

    this.addLog(state, events, `${target.name}'s alien power is zapped for this encounter!`);
  }

  /**
   * CARD_ZAP -- Cancel an artifact, flare, or reinforcement card that was
   * just played.  The cancelled card is discarded with no effect.
   *
   * Because the target card has already been played and moved to discard,
   * we simply undo its most recent effect (if possible).  For reinforcements
   * we remove them from the reveal data.
   */
  private applyCardZap(
    state: GameState,
    targetCardId: CardId,
    events: ServerEvent[],
  ): void {
    const card = state.allCards[targetCardId];
    if (!card) return;

    // If the zapped card is a reinforcement that's in the current reveal data,
    // remove its contribution.
    if (card.type === CardType.REINFORCEMENT && state.phase === Phase.REVEAL) {
      const revealData = state.phaseData as RevealData;
      const idx = revealData.reinforcements.findIndex((r) => r.cardId === targetCardId);
      if (idx !== -1) {
        revealData.reinforcements.splice(idx, 1);
      }
    }

    // The cancelled card is already in the discard pile (played before being
    // zapped), so no further movement is needed.

    this.addLog(state, events, `A card has been zapped and its effect negated!`);
  }

  /**
   * MOBIUS_TUBES -- Return all of your ships from the warp to your colonies.
   */
  private applyMobiusTubes(
    state: GameState,
    playerId: PlayerId,
    events: ServerEvent[],
  ): void {
    const player = state.players[playerId];
    if (!player) return;

    const shipsInWarp = state.warp[player.color] ?? 0;
    if (shipsInWarp === 0) return;

    // Find the first home colony to return ships to
    const homeColony = this.getFirstHomeColony(state, player);
    if (!homeColony) return;

    homeColony.shipCount += shipsInWarp;
    state.warp[player.color] = 0;

    events.push({
      type: 'SHIPS_RETRIEVED',
      playerId,
      count: shipsInWarp,
      destination: homeColony.planetId,
    });

    this.addLog(
      state,
      events,
      `${player.name} uses Mobius Tubes to retrieve ${shipsInWarp} ship(s) from the warp!`,
    );
  }

  /**
   * PLAGUE -- Force one player to discard their entire hand and draw a new
   * hand of 8 cards.
   */
  private applyPlague(
    state: GameState,
    targetPlayerId: PlayerId,
    events: ServerEvent[],
  ): void {
    const target = state.players[targetPlayerId];
    if (!target) return;

    // Discard entire hand
    for (const cid of target.hand) {
      state.cosmicDiscard.push(cid);
    }
    const discardedCount = target.hand.length;
    target.hand = [];

    // Draw a fresh hand
    for (let i = 0; i < GAME_CONFIG.HAND_SIZE; i++) {
      const drawn = this.deckManager.drawFromCosmicDeck(state);
      if (drawn) {
        target.hand.push(drawn);
      }
    }

    events.push({
      type: 'CARDS_DRAWN',
      playerId: targetPlayerId,
      count: GAME_CONFIG.HAND_SIZE,
    });

    this.addLog(
      state,
      events,
      `${target.name} is hit by Plague! Discards ${discardedCount} card(s) and draws a new hand.`,
    );
  }

  /**
   * FORCE_FIELD -- As a main player or ally, prevent all allies on BOTH
   * sides from participating.  Allied ships return to their colonies.
   */
  private applyForceField(
    state: GameState,
    events: ServerEvent[],
  ): void {
    if (state.phase !== Phase.ALLIANCE) return;

    const data = state.phaseData as AllianceData;

    // Return offensive allies' ships
    for (const [allyId, allyInfo] of Object.entries(data.offensiveAllies)) {
      this.returnAllyShips(state, allyId as PlayerId, allyInfo.sources);
    }

    // Return defensive allies' ships
    for (const [allyId, allyInfo] of Object.entries(data.defensiveAllies)) {
      this.returnAllyShips(state, allyId as PlayerId, allyInfo.sources);
    }

    // Clear alliance data
    data.offensiveAllies = {};
    data.defensiveAllies = {};

    // Mark all non-main-player responses as 'decline' so the phase can advance
    for (const pid of Object.keys(data.responses)) {
      data.responses[pid as PlayerId] = 'decline';
    }

    // Also clear encounter state allies if already populated
    if (state.encounterState) {
      state.encounterState.offensiveAllies = {};
      state.encounterState.defensiveAllies = {};
    }

    this.addLog(state, events, 'Force Field activated! All alliances are cancelled.');
  }

  /**
   * EMOTION_CONTROL -- Force one main player to play a Negotiate card (if
   * they have one) instead of their selected card.
   */
  private applyEmotionControl(
    state: GameState,
    targetPlayerId: PlayerId,
    events: ServerEvent[],
  ): void {
    const target = state.players[targetPlayerId];
    if (!target) return;

    // Verify target is a main player
    const isMainPlayer =
      targetPlayerId === state.activePlayerId ||
      targetPlayerId === (state.phaseData as PlanningData).defensePlayerId;
    if (!isMainPlayer) return;

    // Find a Negotiate card in the target's hand
    const negotiateCardId = target.hand.find((cid) => {
      const c = state.allCards[cid];
      return c && c.type === CardType.NEGOTIATE;
    });

    if (!negotiateCardId) {
      this.addLog(
        state,
        events,
        `Emotion Control targets ${target.name} but they have no Negotiate card.`,
      );
      return;
    }

    // If they've already selected a card, swap it
    const planningData = state.phaseData as PlanningData;
    if (targetPlayerId === state.activePlayerId && planningData.offenseCardId) {
      // Return the previously selected card to hand
      target.hand.push(planningData.offenseCardId);
      // Remove negotiate from hand
      target.hand = target.hand.filter((id) => id !== negotiateCardId);
      planningData.offenseCardId = negotiateCardId;
    } else if (targetPlayerId === planningData.defensePlayerId && planningData.defenseCardId) {
      target.hand.push(planningData.defenseCardId);
      target.hand = target.hand.filter((id) => id !== negotiateCardId);
      planningData.defenseCardId = negotiateCardId;
    }

    // Mark in alienData so the client knows this player is forced
    target.alienData._emotionControlled = true;

    this.addLog(
      state,
      events,
      `Emotion Control forces ${target.name} to play a Negotiate card!`,
    );
  }

  /**
   * IONIC_GAS -- Cancel the current encounter entirely.  All ships return
   * to their previous positions and the turn advances.
   *
   * The caller (GameEngine) is responsible for actually ending the encounter
   * when it receives `cancelEncounter: true` in the result.
   */
  private applyIonicGas(
    state: GameState,
    events: ServerEvent[],
  ): void {
    const enc = state.encounterState;
    if (!enc) return;

    // Return offense ships from the gate to their source colonies
    const offensePlayer = state.players[state.activePlayerId];
    if (offensePlayer && enc.offenseShipSources) {
      for (const source of enc.offenseShipSources) {
        const planet = this.findPlanetById(state, source.planetId);
        if (!planet) continue;
        const colony = planet.colonies.find((c) => c.playerColor === offensePlayer.color);
        if (colony) {
          colony.shipCount += source.count;
        } else {
          planet.colonies.push({ playerColor: offensePlayer.color, shipCount: source.count });
        }
      }
    }

    // Return offensive allies' ships
    for (const [allyId, allyInfo] of Object.entries(enc.offensiveAllies)) {
      this.returnAllyShips(state, allyId as PlayerId, allyInfo.sources);
    }

    // Return defensive allies' ships
    for (const [allyId, allyInfo] of Object.entries(enc.defensiveAllies)) {
      this.returnAllyShips(state, allyId as PlayerId, allyInfo.sources);
    }

    // Return any planning-phase cards to hands
    if (state.phase === Phase.PLANNING || state.phase === Phase.REVEAL) {
      if (enc.offenseCardId) {
        offensePlayer.hand.push(enc.offenseCardId);
      }
      const defensePlayer = state.players[enc.defensePlayerId];
      if (defensePlayer && enc.defenseCardId) {
        defensePlayer.hand.push(enc.defenseCardId);
      }
    }

    this.addLog(state, events, 'Ionic Gas! The encounter is cancelled entirely.');
  }

  // ------------------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------------------

  /**
   * Roll back the artifact play if a required target is missing.
   * Re-inserts the card into the player's hand and removes it from discard.
   */
  private rollback(
    state: GameState,
    player: PlayerState,
    cardId: CardId,
    error: string,
    events: ServerEvent[],
  ): ArtifactResult {
    player.hand.push(cardId);
    state.cosmicDiscard = state.cosmicDiscard.filter((id) => id !== cardId);
    // Remove any ARTIFACT_PLAYED event we already pushed
    const idx = events.findIndex(
      (e) => e.type === 'ARTIFACT_PLAYED' && (e as { playerId: PlayerId }).playerId === player.id,
    );
    if (idx !== -1) events.splice(idx, 1);

    return { success: false, error, events };
  }

  /**
   * Return a set of ally ships to their source colonies.
   */
  private returnAllyShips(
    state: GameState,
    allyId: PlayerId,
    sources: Array<{ planetId: string; count: number }>,
  ): void {
    const allyPlayer = state.players[allyId];
    if (!allyPlayer) return;

    for (const source of sources) {
      const planet = this.findPlanetById(state, source.planetId);
      if (!planet) continue;
      const colony = planet.colonies.find((c) => c.playerColor === allyPlayer.color);
      if (colony) {
        colony.shipCount += source.count;
      } else {
        planet.colonies.push({ playerColor: allyPlayer.color, shipCount: source.count });
      }
    }
  }

  /**
   * Get the first home-system colony for a player (for returning ships).
   */
  private getFirstHomeColony(
    state: GameState,
    player: PlayerState,
  ): { shipCount: number; planetId: string } | null {
    for (const planet of player.planets) {
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (colony) {
        return { shipCount: colony.shipCount, planetId: planet.id };
      }
    }
    // Fallback: check other players' planets for a foreign colony
    for (const otherPlayer of Object.values(state.players)) {
      if (otherPlayer.id === player.id) continue;
      for (const planet of otherPlayer.planets) {
        const colony = planet.colonies.find((c) => c.playerColor === player.color);
        if (colony) {
          return { shipCount: colony.shipCount, planetId: planet.id };
        }
      }
    }
    return null;
  }

  /**
   * Find a planet by its ID across all players.
   */
  private findPlanetById(
    state: GameState,
    planetId: string,
  ): import('@cosmic/shared').PlanetState | null {
    for (const p of Object.values(state.players)) {
      const found = p.planets.find((pl) => pl.id === planetId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Add a message to the game log and emit a GAME_LOG event.
   */
  private addLog(state: GameState, events: ServerEvent[], message: string): void {
    const entry: import('@cosmic/shared').GameLogEntry = {
      timestamp: Date.now(),
      message,
      phase: state.phase as Phase,
    };
    state.gameLog.push(entry);
    events.push({ type: 'GAME_LOG', entry });
  }
}
