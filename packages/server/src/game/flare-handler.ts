import type {
  GameState,
  PlayerId,
  CardId,
  FlareCard,
} from '@cosmic/shared';
import { CardType } from '@cosmic/shared';
import type { ServerEvent } from '@cosmic/shared';
import type { AlienRegistry } from '../aliens/alien-registry.js';

export interface FlareResult {
  success: boolean;
  error?: string;
  events: ServerEvent[];
}

/**
 * Handles playing flare cards.
 *
 * Flares have two modes:
 * - Wild: Any player can use (basic effect)
 * - Super: Only the alien's owner can use (stronger effect)
 *
 * Rules:
 * - Max 1 flare per encounter per player
 * - After use, flare is discarded
 */
export class FlareHandler {
  constructor(private alienRegistry: AlienRegistry) {}

  playFlare(
    state: GameState,
    playerId: PlayerId,
    cardId: CardId,
    mode: 'wild' | 'super',
  ): FlareResult {
    const events: ServerEvent[] = [];
    const player = state.players[playerId];

    if (!player) {
      return { success: false, error: 'Player not found', events };
    }

    // Validate card is in hand and is a flare
    if (!player.hand.includes(cardId)) {
      return { success: false, error: 'Card not in hand', events };
    }

    const card = state.allCards[cardId];
    if (!card || card.type !== CardType.FLARE) {
      return { success: false, error: 'Card is not a flare', events };
    }

    const flare = card as FlareCard;

    // Check if player has already played a flare this encounter
    if (player.alienData._flarePlayedThisEncounter) {
      return { success: false, error: 'Already played a flare this encounter', events };
    }

    // If mode is 'super', validate the player owns the matching alien
    if (mode === 'super') {
      if (player.alienId !== flare.alienId) {
        return {
          success: false,
          error: 'Only the matching alien owner can play a super flare',
          events,
        };
      }
    }

    // Remove from hand and discard
    player.hand = player.hand.filter((id) => id !== cardId);
    state.cosmicDiscard.push(cardId);

    // Mark that this player has played a flare this encounter
    player.alienData._flarePlayedThisEncounter = true;

    // Emit the FLARE_PLAYED event
    events.push({ type: 'FLARE_PLAYED', playerId, flare, mode });

    // Dispatch to alien registry's flare hooks
    const hooks = this.alienRegistry.getHooks(flare.alienId);
    if (hooks) {
      const ctx = this.alienRegistry.buildContext(state, playerId, playerId, events);
      if (mode === 'wild' && hooks.onFlareWild) {
        hooks.onFlareWild(ctx, playerId);
      } else if (mode === 'super' && hooks.onFlareSuper) {
        hooks.onFlareSuper(ctx, playerId);
      }
    }

    // Log
    const entry = {
      timestamp: Date.now(),
      message: `${player.name} plays the ${flare.alienId} flare (${mode})!`,
      phase: state.phase,
    };
    state.gameLog.push(entry);
    events.push({ type: 'GAME_LOG', entry });

    return { success: true, events };
  }
}
