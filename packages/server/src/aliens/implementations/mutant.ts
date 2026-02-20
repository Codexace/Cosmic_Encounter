import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const MutantHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    if (!isOffense && !isDefense) return;

    const mutantLost =
      (isOffense && outcome.type === 'DEFENSE_WINS') ||
      (isDefense && outcome.type === 'OFFENSE_WINS');

    if (!mutantLost) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Determine how many ships Mutant lost
    const shipsLost = isOffense
      ? enc.offenseShipCount
      : (() => {
          const defPlayer = ctx.getPlayer(ctx.alienOwnerId);
          const targetPlanet = defPlayer.planets.find(
            p => p.id === enc.targetPlanetId
          );
          if (!targetPlanet) return 1;
          const colony = targetPlanet.colonies.find(
            c => c.playerColor === defPlayer.color
          );
          return colony ? Math.min(colony.shipCount, 3) : 1;
        })();

    const cardsToDraw = Math.max(1, shipsLost);

    for (let i = 0; i < cardsToDraw; i++) {
      const cardId = ctx.drawCard();
      if (cardId) {
        ctx.getPlayer(ctx.alienOwnerId).hand.push(cardId);
      }
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.MUTANT,
      description: `Mutant draws ${cardsToDraw} card(s) after losing`,
    });
  },
};
