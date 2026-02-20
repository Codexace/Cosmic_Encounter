import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId, CardType } from '@cosmic/shared';

export const ChosenHooks: AlienHooks = {
  initAlienData() {
    return { chosenTotal: 0 };
  },

  onPlanningStart(ctx: AlienContext) {
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    // Auto-choose: pick a total slightly above average to be competitive.
    // Look at the cards in hand to estimate a good value.
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Estimate the defense's expected total: defense ships + median attack value
    const defensePlayer = ctx.getPlayer(enc.defensePlayerId);
    const defenseShips = defensePlayer.planets
      .flatMap(p => p.colonies)
      .filter(c => c.playerColor === defensePlayer.color)
      .reduce((sum, c) => sum + c.shipCount, 0);

    // Choose a total that should be competitive: offense ships + a good card value
    const offenseShips = enc.offenseShipCount;
    const autoChosenTotal = offenseShips + defenseShips + 8; // heuristic

    owner.alienData.chosenTotal = autoChosenTotal;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.CHOSEN,
      description: `Chosen declares a winning total of ${autoChosenTotal}`,
    });
  },

  modifyAttackTotal(ctx: AlienContext, side, currentTotal, _shipCount, _cardValue) {
    if (!ctx.isOffense(ctx.alienOwnerId)) return currentTotal;
    if (side !== 'offense') return currentTotal;

    const chosenTotal = (ctx.getPlayer(ctx.alienOwnerId).alienData.chosenTotal as number) ?? 0;
    if (chosenTotal === 0) return currentTotal;

    return chosenTotal;
  },
};
