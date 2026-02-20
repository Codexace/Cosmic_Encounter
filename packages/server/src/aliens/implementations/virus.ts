import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const VirusHooks: AlienHooks = {
  modifyAttackTotal(ctx: AlienContext, side, currentTotal, shipCount, cardValue) {
    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    const alienSide = isOffense ? 'offense' : isDefense ? 'defense' : null;
    if (alienSide !== side) return currentTotal;

    // Normal total = shipCount + cardValue (plus any reinforcements already included).
    // Virus multiplies instead: total = shipCount * cardValue (plus reinforcements).
    // reinforcements = currentTotal - (shipCount + cardValue)
    const reinforcements = currentTotal - (shipCount + cardValue);
    const newTotal = shipCount * cardValue + reinforcements;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.VIRUS,
      description: `Virus multiplies: ${shipCount} ships × ${cardValue} card = ${shipCount * cardValue}`,
    });

    return newTotal;
  },
};
