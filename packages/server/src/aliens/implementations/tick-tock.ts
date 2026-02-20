import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const TickTockHooks: AlienHooks = {
  initAlienData() {
    return { _tickTockTokens: 0 };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.REGROUP) return;
    // Only on the Tick-Tock player's own turn
    if (ctx.alienOwnerId !== ctx.state.activePlayerId) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    const tokens = ((player.alienData._tickTockTokens as number) ?? 0) + 1;
    player.alienData._tickTockTokens = tokens;

    const threshold = ctx.state.turnOrder.length + 3;
    ctx.log(`${player.name} (Tick-Tock) places a token (${tokens}/${threshold})`);

    if (tokens >= threshold) {
      // Tick-Tock wins!
      ctx.state.winners = [ctx.alienOwnerId];
      ctx.log(`${player.name} (Tick-Tock) wins the game with ${tokens} tokens!`);
      ctx.emitEvent({ type: 'GAME_OVER', winners: [ctx.alienOwnerId] });
    }
  },
};
