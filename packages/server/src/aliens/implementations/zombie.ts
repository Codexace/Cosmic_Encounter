import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const ZombieHooks: AlienHooks = {
  canShipsGoToWarp(ctx: AlienContext, playerColor, count) {
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    if (playerColor !== owner.color) return true;

    // Zombie's ships return to colonies instead of the warp
    for (const otherPlayer of Object.values(ctx.state.players)) {
      for (const planet of otherPlayer.planets) {
        const colony = planet.colonies.find(c => c.playerColor === owner.color);
        if (colony) {
          colony.shipCount += count;
          ctx.emitEvent({
            type: 'ALIEN_POWER_USED',
            playerId: ctx.alienOwnerId,
            alienId: AlienId.ZOMBIE,
            description: 'Zombie ships return to colonies instead of the warp',
          });
          return false;
        }
      }
    }

    // No colonies found — ships must go to warp
    return true;
  },
};
