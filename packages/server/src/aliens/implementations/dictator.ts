import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const DictatorHooks: AlienHooks = {
  initAlienData() {
    return { _dictatorForbidden: [] as PlayerId[] };
  },

  onAllianceInvitation(ctx: AlienContext) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);

    // Choose up to 2 non-main players to forbid from allying
    const forbidden: PlayerId[] = [];
    for (const pid of ctx.state.turnOrder) {
      if (pid === ctx.alienOwnerId) continue;
      if (ctx.isMainPlayer(pid)) continue;
      if (forbidden.length >= 2) break;
      forbidden.push(pid);
    }

    owner.alienData._dictatorForbidden = forbidden;

    if (forbidden.length > 0) {
      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.DICTATOR,
        description: `Dictator forbids ${forbidden.length} player(s) from allying this encounter`,
      });
    }
  },

  onAllianceResponse(ctx: AlienContext, playerId: PlayerId, response: 'offense' | 'defense' | 'decline') {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const forbidden = (owner.alienData._dictatorForbidden as PlayerId[]) ?? [];

    if (forbidden.includes(playerId) && response !== 'decline') {
      // Force the forbidden player to decline
      ctx.log(`Dictator prevents ${ctx.getPlayer(playerId).name} from allying`);
      return { canceled: true };
    }
  },
};
