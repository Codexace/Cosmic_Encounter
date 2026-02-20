import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const ReserveHooks: AlienHooks = {
  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.REVEAL) return;
    // As offense or offensive ally, add extra ships
    const ownerId = ctx.alienOwnerId;
    if (!ctx.isOffense(ownerId) && !ctx.isAlly(ownerId)) return;

    const player = ctx.getPlayer(ownerId);
    const es = ctx.state.encounterState;
    if (!es) return;

    // Count available ships from colonies (up to 4 reinforcements)
    let available = 0;
    for (const planet of player.planets) {
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (colony && colony.shipCount > 1) {
        available += colony.shipCount - 1; // Leave at least 1
      }
    }

    const toSend = Math.min(4, available);
    if (toSend <= 0) return;

    // Add ships to offense count
    let sent = 0;
    for (const planet of player.planets) {
      if (sent >= toSend) break;
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (colony && colony.shipCount > 1) {
        const take = Math.min(colony.shipCount - 1, toSend - sent);
        colony.shipCount -= take;
        sent += take;
      }
    }

    if (ctx.isOffense(ownerId)) {
      es.offenseShipCount += sent;
    }
    ctx.log(`${player.name} (Reserve) sends ${sent} additional ship(s) as reinforcements`);
  },
};
