import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const TraderHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    // Trader must be offense and must have won
    if (!ctx.isOffense(ctx.alienOwnerId)) return;
    if (outcome.type !== 'OFFENSE_WINS') return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    const traderOwner = ctx.getPlayer(ctx.alienOwnerId);
    const defensePlayer = ctx.getPlayer(enc.defensePlayerId);

    // Swap hands
    const traderHand = [...traderOwner.hand];
    const defenseHand = [...defensePlayer.hand];

    traderOwner.hand = defenseHand;
    defensePlayer.hand = traderHand;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.TRADER,
      description: `Trader swaps hands with ${enc.defensePlayerId} after winning`,
    });
  },
};
