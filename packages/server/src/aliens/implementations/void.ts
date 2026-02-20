import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerColor } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const VoidHooks: AlienHooks = {
  canShipsGoToWarp(ctx: AlienContext, playerColor: PlayerColor, count: number) {
    const enc = ctx.state.encounterState;
    if (!enc) return true;

    // Void must be the defense to use the power
    if (!ctx.isDefense(ctx.alienOwnerId)) return true;

    const voidOwner = ctx.getPlayer(ctx.alienOwnerId);

    // Only affect the opponent's ships (offense)
    const offensePlayer = ctx.getPlayer(ctx.state.activePlayerId);
    if (playerColor !== offensePlayer.color) return true;

    // Void wins as defense: opponent's ships are removed from the game entirely
    // Find which player owns this color and reduce their total ship count across all planets
    let removed = 0;
    for (const planet of Object.values(ctx.state.players).flatMap(p => p.planets)) {
      for (const colony of planet.colonies) {
        if (colony.playerColor === playerColor && removed < count) {
          const canRemove = Math.min(colony.shipCount, count - removed);
          colony.shipCount -= canRemove;
          removed += canRemove;
        }
      }
    }

    // Also reduce from warp if the ships were already queued there
    // (ships going to warp haven't been added yet, so we just prevent warp entry)
    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.VOID,
      description: `Void removes ${count} ${playerColor} ship(s) from the game entirely`,
    });

    return false; // Ships do not go to warp
  },
};
