import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const WarpishHooks: AlienHooks = {
  modifyRegroupCount(ctx: AlienContext) {
    if (!ctx.isOffense(ctx.alienOwnerId)) return 1;

    const owner = ctx.getPlayer(ctx.alienOwnerId);

    // Count foreign colonies: colonies on planets NOT owned by Warpish
    const foreignColonyCount = Object.values(ctx.state.players)
      .flatMap(p => p.planets)
      .filter(planet => planet.ownerColor !== owner.color)
      .flatMap(planet => planet.colonies)
      .filter(colony => colony.playerColor === owner.color && colony.shipCount > 0)
      .length;

    const extra = Math.max(1, foreignColonyCount);
    const total = 1 + extra;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.WARPISH,
      description: `Warpish retrieves ${total} ship(s) from warp (${foreignColonyCount} foreign colonies)`,
    });

    return total;
  },
};
