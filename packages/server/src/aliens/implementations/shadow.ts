import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerColor } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const ShadowHooks: AlienHooks = {
  onShipsSentToWarp(ctx: AlienContext, playerColor: PlayerColor, count: number) {
    const shadowOwner = ctx.getPlayer(ctx.alienOwnerId);
    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Shadow must be a main player in this encounter to use the power
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    // Only intercept ships of Shadow's opponent going to warp
    if (playerColor === shadowOwner.color) return;

    // Determine if Shadow is the winning side (opponent is the loser sending ships to warp)
    // We place those ships onto one of Shadow's existing colonies as the opponent's color
    let placed = 0;
    const remaining = count;

    for (const planet of Object.values(ctx.state.players).flatMap(p => p.planets)) {
      const shadowColony = planet.colonies.find(c => c.playerColor === shadowOwner.color);
      if (!shadowColony || shadowColony.shipCount === 0) continue;

      // Place all opponent ships here (simplified: put them on the first available colony)
      const existingCol = planet.colonies.find(c => c.playerColor === playerColor);
      if (existingCol) {
        existingCol.shipCount += remaining;
      } else {
        planet.colonies.push({ playerColor, shipCount: remaining });
      }
      placed = remaining;
      break;
    }

    if (placed > 0) {
      // Reduce the warp intake: ships did not actually go to warp
      const currentWarp = ctx.state.warp[playerColor] ?? 0;
      ctx.state.warp[playerColor] = Math.max(0, currentWarp - placed) as typeof currentWarp;

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.SHADOW,
        description: `Shadow captures ${placed} ${playerColor} ship(s) to a colony instead of the warp`,
      });
    }
  },
};
