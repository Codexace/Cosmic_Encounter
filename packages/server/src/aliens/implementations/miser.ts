import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const MiserHooks: AlienHooks = {
  initAlienData() {
    return { _miserHoard: [] as string[] };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.START_TURN) return;
    // At start of the Miser's own turn, retrieve all hoarded cards back to hand
    if (ctx.alienOwnerId !== ctx.state.activePlayerId) return;
    const player = ctx.getPlayer(ctx.alienOwnerId);
    const hoard = (player.alienData._miserHoard ?? []) as string[];
    if (hoard.length > 0) {
      player.hand.push(...hoard);
      player.alienData._miserHoard = [];
      ctx.log(`${player.name} retrieves ${hoard.length} card(s) from their hoard`);
    }
  },
};
