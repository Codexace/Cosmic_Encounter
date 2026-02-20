import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const KamikazeHooks: AlienHooks = {
  initAlienData() {
    return { _kamikazeActivated: false };
  },

  onCombatResolved(ctx: AlienContext, _outcome: EncounterOutcome) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    owner.alienData._kamikazeActivated = true;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Send ALL ships from both sides to the warp
    const offensePlayer = ctx.getPlayer(ctx.state.activePlayerId);
    const defensePlayer = ctx.getPlayer(enc.defensePlayerId);

    // Offense ships to warp
    const offenseShips = enc.offenseShipCount;
    ctx.state.warp[offensePlayer.color] = (ctx.state.warp[offensePlayer.color] ?? 0) + offenseShips;

    // Defense ships on the targeted planet to warp
    for (const planet of defensePlayer.planets) {
      if (planet.id === enc.targetPlanetId) {
        for (const colony of planet.colonies) {
          if (colony.playerColor === defensePlayer.color) {
            const defenseShips = colony.shipCount;
            ctx.state.warp[defensePlayer.color] = (ctx.state.warp[defensePlayer.color] ?? 0) + defenseShips;
            colony.shipCount = 0;
            break;
          }
        }
      }
    }

    // Also send allied ships to warp
    for (const [allyId, allyData] of Object.entries(enc.offensiveAllies ?? {})) {
      const ally = ctx.getPlayer(allyId);
      ctx.state.warp[ally.color] = (ctx.state.warp[ally.color] ?? 0) + allyData.shipCount;
    }
    for (const [allyId, allyData] of Object.entries(enc.defensiveAllies ?? {})) {
      const ally = ctx.getPlayer(allyId);
      ctx.state.warp[ally.color] = (ctx.state.warp[ally.color] ?? 0) + allyData.shipCount;
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.KAMIKAZE,
      description: 'Kamikaze sends ALL ships from both sides to the warp',
    });

    return { preventDefault: true };
  },
};
