import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId, Phase } from '@cosmic/shared';

export const WarriorHooks: AlienHooks = {
  initAlienData() {
    return { tokens: 0 };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.RESOLUTION) return;

    // Accumulate one token each time an encounter reaches resolution
    const tokens = ((ctx.getPlayer(ctx.alienOwnerId).alienData.tokens as number) ?? 0) + 1;
    ctx.getPlayer(ctx.alienOwnerId).alienData.tokens = tokens;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.WARRIOR,
      description: `Warrior accumulates a token (total: ${tokens})`,
    });
  },

  modifyAttackTotal(ctx: AlienContext, side, currentTotal, _shipCount, _cardValue) {
    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    const alienSide = isOffense ? 'offense' : isDefense ? 'defense' : null;
    if (alienSide !== side) return currentTotal;

    const tokens = (ctx.getPlayer(ctx.alienOwnerId).alienData.tokens as number) ?? 0;
    if (tokens === 0) return currentTotal;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.WARRIOR,
      description: `Warrior adds ${tokens} token(s) to attack total`,
    });

    return currentTotal + tokens;
  },
};
