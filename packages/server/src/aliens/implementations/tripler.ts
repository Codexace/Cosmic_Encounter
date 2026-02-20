import type { AlienHooks, AlienContext } from '../alien-base.js';

export const TriplerHooks: AlienHooks = {
  modifyAttackTotal(ctx: AlienContext, side: 'offense' | 'defense', currentTotal: number, shipCount: number, cardValue: number): number {
    const ownerId = ctx.alienOwnerId;
    const isOffense = ctx.isOffense(ownerId);
    const isDefense = ctx.isDefense(ownerId);

    // Only apply when on the matching side
    if (side === 'offense' && !isOffense) return currentTotal;
    if (side === 'defense' && !isDefense) return currentTotal;

    // Triple the card value (not ships or reinforcements)
    // currentTotal = cardValue + shipCount + reinforcements
    // New total = cardValue * 3 + shipCount + reinforcements
    const reinforcements = currentTotal - cardValue - shipCount;
    const newTotal = cardValue * 3 + shipCount + reinforcements;

    const player = ctx.getPlayer(ownerId);
    ctx.log(`${player.name} (Tripler) triples card value from ${cardValue} to ${cardValue * 3}`);

    return newTotal;
  },
};
