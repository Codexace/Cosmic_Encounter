import type { AlienHooks, AlienContext } from '../alien-base.js';

export const SeekerHooks: AlienHooks = {
  initAlienData() {
    return { _seekerNamedCard: null as string | null };
  },

  onPlanningStart(ctx: AlienContext) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;
    const player = ctx.getPlayer(ctx.alienOwnerId);
    // Store the fact that Seeker may name a card — actual card naming
    // would require a UI decision prompt. For automated play, pick the
    // highest attack card the opponent might have.
    player.alienData._seekerNamedCard = null;
    ctx.log(`${player.name} (Seeker) may name a card for their opponent to play`);
  },
};
