import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const WillHooks: AlienHooks = {
  initAlienData() {
    return { _willDoubleOrNothing: false };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.REVEAL) return;
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    // Auto-activate double or nothing
    player.alienData._willDoubleOrNothing = true;
    ctx.log(`${player.name} (Will) declares double or nothing!`);
  },
};
