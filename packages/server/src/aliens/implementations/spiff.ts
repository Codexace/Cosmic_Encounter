import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const SpiffHooks: AlienHooks = {
  // Spiff can launch ships from any colony, not just the home system.
  // The engine already allows this by default, so Spiff's power is
  // essentially passive. We log it for clarity.
  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.LAUNCH) return;
    if (!ctx.isOffense(ctx.alienOwnerId)) return;
    const player = ctx.getPlayer(ctx.alienOwnerId);
    ctx.log(`${player.name} (Spiff) can launch ships from any colony in the galaxy`);
  },
};
