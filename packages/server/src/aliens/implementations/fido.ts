import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const FidoHooks: AlienHooks = {
  modifyRegroupCount(ctx: AlienContext) {
    if (!ctx.isOffense(ctx.alienOwnerId)) return 1;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const shipsInWarp = ctx.state.warp[owner.color] ?? 0;

    if (shipsInWarp === 0) return 1;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.FIDO,
      description: `Fido retrieves all ${shipsInWarp} ship(s) from the warp`,
    });

    return shipsInWarp;
  },
};
