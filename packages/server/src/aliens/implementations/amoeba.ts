import type { AlienHooks, AlienContext } from '../alien-base.js';

export const AmoebaHooks: AlienHooks = {
  modifyMaxShipsInGate(ctx: AlienContext): number {
    if (!ctx.isOffense(ctx.alienOwnerId)) return 4;
    const player = ctx.getPlayer(ctx.alienOwnerId);
    ctx.log(`${player.name} (Amoeba) can send unlimited ships to the gate`);
    return 20; // Effectively unlimited
  },
};
