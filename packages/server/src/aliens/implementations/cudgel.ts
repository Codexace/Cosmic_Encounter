import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId, Phase } from '@cosmic/shared';

export const CudgelHooks: AlienHooks = {
  initAlienData() {
    return { _cudgelUsedThisTurn: false };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.START_TURN) return;
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    // Reset usage tracking at start of turn
    ctx.getPlayer(ctx.alienOwnerId).alienData._cudgelUsedThisTurn = false;

    // Force the opponent to discard 2 cards
    const enc = ctx.state.encounterState;
    // At START_TURN there may not be an encounter state yet, so we pick the next likely opponent
    // For now, we target no specific player until the encounter is established.
    // Cudgel triggers at START_TURN, so we look at all other players and pick one with cards
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    if (owner.alienData._cudgelUsedThisTurn) return;

    // Find the player with the most cards (excluding Cudgel owner) as the target
    let targetId: string | null = null;
    let maxCards = 0;
    for (const [pid, player] of Object.entries(ctx.state.players)) {
      if (pid === ctx.alienOwnerId) continue;
      if (player.hand.length > maxCards) {
        maxCards = player.hand.length;
        targetId = pid;
      }
    }

    if (!targetId || maxCards === 0) return;

    const target = ctx.getPlayer(targetId);
    const discardCount = Math.min(2, target.hand.length);
    if (discardCount === 0) return;

    // Discard random cards from target's hand
    for (let i = 0; i < discardCount; i++) {
      if (target.hand.length === 0) break;
      const randomIndex = Math.floor(Math.random() * target.hand.length);
      const discardedCardId = target.hand.splice(randomIndex, 1)[0];
      ctx.state.cosmicDiscard.push(discardedCardId);
    }

    owner.alienData._cudgelUsedThisTurn = true;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.CUDGEL,
      description: `Cudgel forces ${target.name} to discard ${discardCount} card(s)`,
    });
  },
};
