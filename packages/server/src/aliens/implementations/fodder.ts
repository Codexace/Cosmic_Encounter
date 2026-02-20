import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId, Phase } from '@cosmic/shared';

export const FodderHooks: AlienHooks = {
  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.REVEAL) return;
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const shipsInWarp = ctx.state.warp[owner.color] ?? 0;
    if (shipsInWarp === 0) return;

    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const side: 'offense' | 'defense' = isOffense ? 'offense' : 'defense';

    // Add ships-in-warp count to the relevant total in phaseData
    const phaseData = ctx.state.phaseData as {
      offenseTotal?: number;
      defenseTotal?: number;
    };

    if (phaseData) {
      if (side === 'offense') {
        phaseData.offenseTotal = (phaseData.offenseTotal ?? 0) + shipsInWarp;
      } else {
        phaseData.defenseTotal = (phaseData.defenseTotal ?? 0) + shipsInWarp;
      }
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.FODDER,
      description: `Fodder adds ${shipsInWarp} warp ship(s) as reinforcements to ${side} total`,
    });
  },
};
