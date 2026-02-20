import type { AlienHooks, AlienContext } from '../alien-base.js';

export const MirrorHooks: AlienHooks = {
  modifyAttackTotal(ctx: AlienContext, side: 'offense' | 'defense', currentTotal: number, shipCount: number, cardValue: number): number {
    const ownerId = ctx.alienOwnerId;
    const isOffense = ctx.isOffense(ownerId);
    const isDefense = ctx.isDefense(ownerId);

    // Mirror reverses the OPPONENT's card value
    // If Mirror is offense, reverse defense's card value
    // If Mirror is defense, reverse offense's card value
    if (side === 'defense' && isOffense) {
      // Reverse defense's card value: 40 - cardValue
      const reversed = 40 - cardValue;
      const diff = reversed - cardValue;
      const player = ctx.getPlayer(ownerId);
      ctx.log(`${player.name} (Mirror) reverses opponent's card from ${cardValue} to ${reversed}`);
      return currentTotal + diff;
    }

    if (side === 'offense' && isDefense) {
      // Reverse offense's card value: 40 - cardValue
      const reversed = 40 - cardValue;
      const diff = reversed - cardValue;
      const player = ctx.getPlayer(ownerId);
      ctx.log(`${player.name} (Mirror) reverses opponent's card from ${cardValue} to ${reversed}`);
      return currentTotal + diff;
    }

    return currentTotal;
  },
};
