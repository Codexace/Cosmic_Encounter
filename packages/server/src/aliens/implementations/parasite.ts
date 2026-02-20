import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const ParasiteHooks: AlienHooks = {
  onAllianceInvitation(ctx: AlienContext) {
    // Parasite must be invited as an ally, or alliances are canceled.
    // Simplified: auto-invite Parasite to the side that did not invite them.
    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Parasite should not be a main player for this to trigger
    if (ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const phaseData = ctx.state.phaseData as {
      offenseInvited?: string[];
      defenseInvited?: string[];
    };

    if (!phaseData) return;

    const offenseInvited = phaseData.offenseInvited ?? [];
    const defenseInvited = phaseData.defenseInvited ?? [];

    const alreadyInvited =
      offenseInvited.includes(ctx.alienOwnerId) ||
      defenseInvited.includes(ctx.alienOwnerId);

    if (!alreadyInvited) {
      // Auto-invite Parasite to offense side (Parasite attaches to whoever is convenient)
      offenseInvited.push(ctx.alienOwnerId);
      if (phaseData.offenseInvited !== undefined) {
        phaseData.offenseInvited = offenseInvited;
      }

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.PARASITE,
        description: 'Parasite auto-invites itself as an offensive ally',
      });
    }
  },
};
