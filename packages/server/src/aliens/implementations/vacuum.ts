import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const VacuumHooks: AlienHooks = {
  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.LAUNCH) return;
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    const es = ctx.state.encounterState;
    if (!es) return;

    const defPlayer = ctx.getPlayer(es.defensePlayerId);
    const targetPlanetId = es.targetPlanetId;
    let pulled = 0;
    const maxPull = 3;

    // Pull up to 3 ships from defense's OTHER colonies onto the target planet
    for (const otherPlayer of Object.values(ctx.state.players)) {
      for (const planet of otherPlayer.planets) {
        if (pulled >= maxPull) break;
        if (planet.id === targetPlanetId) continue;

        const colony = planet.colonies.find((c) => c.playerColor === defPlayer.color);
        if (colony && colony.shipCount > 0) {
          const take = Math.min(colony.shipCount, maxPull - pulled);
          colony.shipCount -= take;
          pulled += take;

          if (colony.shipCount === 0) {
            planet.colonies = planet.colonies.filter((c) => c.playerColor !== defPlayer.color);
          }
        }
      }
      if (pulled >= maxPull) break;
    }

    if (pulled > 0) {
      // Add pulled ships to the target planet as defenders
      const targetPlanet = ctx.state.players[es.defensePlayerId]?.planets.find((p) => p.id === targetPlanetId)
        ?? Object.values(ctx.state.players).flatMap((p) => p.planets).find((p) => p.id === targetPlanetId);

      if (targetPlanet) {
        const defColony = targetPlanet.colonies.find((c) => c.playerColor === defPlayer.color);
        if (defColony) {
          defColony.shipCount += pulled;
        } else {
          targetPlanet.colonies.push({ playerColor: defPlayer.color, shipCount: pulled });
        }
      }

      const player = ctx.getPlayer(ctx.alienOwnerId);
      ctx.log(`${player.name} (Vacuum) pulls ${pulled} of ${defPlayer.name}'s ships onto the target planet`);
    }
  },
};
