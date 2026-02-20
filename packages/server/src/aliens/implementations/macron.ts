import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const MacronHooks: AlienHooks = {
  modifyAttackTotal(ctx: AlienContext, side, currentTotal, shipCount, _cardValue) {
    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    const alienSide = isOffense ? 'offense' : isDefense ? 'defense' : null;
    if (alienSide !== side) return currentTotal;

    // Each Macron ship counts as 4 instead of 1.
    // Base formula: total = shipCount + cardValue, so the ship contribution was shipCount.
    // Replace that contribution: newTotal = currentTotal - shipCount + (shipCount * 4)
    const newTotal = currentTotal - shipCount + shipCount * 4;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.MACRON,
      description: `Macron counts each ship as 4 (${shipCount} ships = ${shipCount * 4})`,
    });

    return newTotal;
  },
};
