import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';

export const ReincarnatorHooks: AlienHooks = {
  initAlienData() {
    return { _reincarnated: false };
  },

  onColonyLost(ctx: AlienContext, playerId: PlayerId, _planetId: string) {
    if (playerId !== ctx.alienOwnerId) return;
    const player = ctx.getPlayer(ctx.alienOwnerId);
    if (player.alienData._reincarnated) return;

    // Check if all home colonies are lost
    if (player.homeColonies <= 0) {
      player.alienData._reincarnated = true;
      // In a full implementation, we'd draw from an unused alien deck
      // For now, log the transformation trigger
      ctx.log(`${player.name} (Reincarnator) has lost all home colonies and transforms!`);
    }
  },
};
