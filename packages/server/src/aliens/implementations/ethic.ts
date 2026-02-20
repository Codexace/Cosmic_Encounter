import type { AlienHooks, AlienContext } from '../alien-base.js';

export const EthicHooks: AlienHooks = {
  onPlanningStart(ctx: AlienContext) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    ctx.log(`${player.name} (Ethic) declares this encounter must be conducted ethically — both players should play Negotiate`);
    // The actual enforcement (forcing Negotiate cards) would need UI/engine support.
    // For now we flag it so the engine can check
    ctx.state.players[ctx.alienOwnerId].alienData._ethicActive = true;
  },
};
