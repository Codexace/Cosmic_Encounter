import type { AlienHooks, AlienContext } from '../alien-base.js';
import { Phase } from '@cosmic/shared';

export const PentaformHooks: AlienHooks = {
  initAlienData() {
    return { _pentaformForm: 1 };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.START_TURN) return;
    if (ctx.alienOwnerId !== ctx.state.activePlayerId) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    const currentForm = ((player.alienData._pentaformForm as number) ?? 1);
    const nextForm = (currentForm % 5) + 1;
    player.alienData._pentaformForm = nextForm;

    const formNames = ['Attack +4', 'Draw 2 Cards', 'Retrieve 2 Ships', 'Ally Either Side', 'Steal a Card'];
    ctx.log(`${player.name} (Pentaform) shifts to Form ${nextForm}: ${formNames[nextForm - 1]}`);

    // Apply form effects
    switch (nextForm) {
      case 2: {
        // Draw 2 extra cards
        for (let i = 0; i < 2; i++) {
          const cardId = ctx.drawCard();
          if (cardId) player.hand.push(cardId);
        }
        ctx.log(`${player.name} draws 2 extra cards`);
        break;
      }
      case 3: {
        // Retrieve 2 ships from warp
        const inWarp = ctx.state.warp[player.color] ?? 0;
        const toRetrieve = Math.min(2, inWarp);
        if (toRetrieve > 0) {
          ctx.state.warp[player.color] -= toRetrieve;
          const firstPlanet = player.planets[0];
          if (firstPlanet) {
            const colony = firstPlanet.colonies.find((c) => c.playerColor === player.color);
            if (colony) {
              colony.shipCount += toRetrieve;
            } else {
              firstPlanet.colonies.push({ playerColor: player.color, shipCount: toRetrieve });
            }
          }
          ctx.log(`${player.name} retrieves ${toRetrieve} ship(s) from the warp`);
        }
        break;
      }
      case 5: {
        // Steal a card from the player with the most cards
        let maxCards = 0;
        let targetId: string | null = null;
        for (const [pid, ps] of Object.entries(ctx.state.players)) {
          if (pid === ctx.alienOwnerId) continue;
          if (ps.hand.length > maxCards) {
            maxCards = ps.hand.length;
            targetId = pid;
          }
        }
        if (targetId && maxCards > 0) {
          const target = ctx.getPlayer(targetId);
          const idx = Math.floor(Math.random() * target.hand.length);
          const stolen = target.hand.splice(idx, 1)[0];
          if (stolen) {
            player.hand.push(stolen);
            ctx.log(`${player.name} steals a card from ${target.name}`);
          }
        }
        break;
      }
    }
  },

  modifyAttackTotal(ctx: AlienContext, side: 'offense' | 'defense', currentTotal: number, _shipCount: number, _cardValue: number): number {
    const ownerId = ctx.alienOwnerId;
    const player = ctx.getPlayer(ownerId);
    const form = (player.alienData._pentaformForm as number) ?? 1;

    // Form 1: +4 to totals
    if (form !== 1) return currentTotal;

    const isOffense = ctx.isOffense(ownerId);
    const isDefense = ctx.isDefense(ownerId);
    if ((side === 'offense' && isOffense) || (side === 'defense' && isDefense)) {
      return currentTotal + 4;
    }
    return currentTotal;
  },
};
