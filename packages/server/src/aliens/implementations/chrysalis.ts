import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const ChrysalisHooks: AlienHooks = {
  initAlienData() {
    return { _chrysalisTokens: 0 };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.START_TURN) return;
    if (ctx.alienOwnerId !== ctx.state.activePlayerId) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    const tokens = ((player.alienData._chrysalisTokens as number) ?? 0) + 1;
    player.alienData._chrysalisTokens = tokens;

    ctx.log(`${player.name} (Chrysalis) gains a chrysalis token (${tokens}/5)`);

    if (tokens >= 5) {
      // Transform! In a full implementation, draw from unused alien deck
      player.alienData._chrysalisTokens = 0;
      ctx.log(`${player.name} (Chrysalis) transforms into a new alien!`);
    }
  },
};
