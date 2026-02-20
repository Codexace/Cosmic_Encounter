import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerColor } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const HealerHooks: AlienHooks = {
  onShipsSentToWarp(ctx: AlienContext, playerColor: PlayerColor, count: number) {
    const healerOwner = ctx.getPlayer(ctx.alienOwnerId);

    // Healer only returns ships for OTHER players (not its own)
    if (playerColor === healerOwner.color) return;

    // Return 1 ship from warp back to that player's colony per encounter
    const shipToReturn = 1;
    const currentWarp = ctx.state.warp[playerColor] ?? 0;
    if (currentWarp < shipToReturn) return;

    // Find a colony belonging to that player to return the ship to
    for (const planet of Object.values(ctx.state.players).flatMap(p => p.planets)) {
      const colony = planet.colonies.find(c => c.playerColor === playerColor);
      if (colony) {
        colony.shipCount += shipToReturn;
        ctx.state.warp[playerColor] = Math.max(
          0,
          currentWarp - shipToReturn
        ) as typeof currentWarp;

        ctx.emitEvent({
          type: 'ALIEN_POWER_USED',
          playerId: ctx.alienOwnerId,
          alienId: AlienId.HEALER,
          description: `Healer returns 1 ${playerColor} ship from the warp to a colony`,
        });

        return;
      }
    }
  },
};
