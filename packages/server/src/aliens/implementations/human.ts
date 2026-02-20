import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId, Phase } from '@cosmic/shared';

export const HumanHooks: AlienHooks = {
  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.ALLIANCE) return;
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    // Human draws 1 extra card at the start of the alliance phase
    const cardId = ctx.drawCard();
    if (cardId) {
      ctx.getPlayer(ctx.alienOwnerId).hand.push(cardId);

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.HUMAN,
        description: 'Human draws 1 extra card during the alliance phase',
      });
    }
  },

  modifyMaxShipsInGate(ctx: AlienContext) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return 4; // default max

    // Human may commit 1 extra ship beyond the normal maximum
    const normalMax = 4;
    const humanMax = normalMax + 1;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.HUMAN,
      description: `Human may commit up to ${humanMax} ships (1 extra)`,
    });

    return humanMax;
  },
};
