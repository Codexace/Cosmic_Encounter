import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const CloneHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    const cloneWon =
      (isOffense && outcome.type === 'OFFENSE_WINS') ||
      (isDefense && outcome.type === 'DEFENSE_WINS');

    if (!cloneWon) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Find the card Clone played this encounter
    const cardId = isOffense ? enc.offenseCardId : enc.defenseCardId;
    if (!cardId) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);

    // Return the card to Clone's hand instead of discarding it
    if (!owner.hand.includes(cardId)) {
      owner.hand.push(cardId);

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.CLONE,
        description: 'Clone keeps the encounter card after winning',
      });
    }
  },
};
