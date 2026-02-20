import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const HackerHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    if (!ctx.isDefense(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const offensePlayer = ctx.getPlayer(ctx.state.activePlayerId);

    // Hacker receives compensation in two scenarios:
    // 1. Both played Negotiate (mutual negotiate / deal making) — Hacker still gets compensation
    // 2. Offense wins — Hacker still draws cards equal to ships lost

    if (outcome.type === 'DEAL_MAKING' || outcome.type === 'DEAL_SUCCESS' || outcome.type === 'DEAL_FAILED') {
      // Mutual negotiate: Hacker draws compensation from offense hand
      const compensationCount = Math.min(2, offensePlayer.hand.length);
      for (let i = 0; i < compensationCount; i++) {
        if (offensePlayer.hand.length === 0) break;
        const randomIndex = Math.floor(Math.random() * offensePlayer.hand.length);
        const cardId = offensePlayer.hand.splice(randomIndex, 1)[0];
        owner.hand.push(cardId);
      }

      if (compensationCount > 0) {
        ctx.emitEvent({
          type: 'ALIEN_POWER_USED',
          playerId: ctx.alienOwnerId,
          alienId: AlienId.HACKER,
          description: `Hacker receives ${compensationCount} compensation card(s) during negotiate`,
        });
      }
    } else if (outcome.type === 'OFFENSE_WINS' || (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'offense')) {
      // Offense wins: Hacker draws cards from deck equal to ships lost
      const shipsLost = enc.offenseShipCount > 0 ? Math.min(enc.offenseShipCount, 4) : 2;
      for (let i = 0; i < shipsLost; i++) {
        const cardId = ctx.drawCard();
        if (cardId) {
          owner.hand.push(cardId);
        }
      }

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.HACKER,
        description: `Hacker draws ${shipsLost} compensation card(s) despite losing`,
      });
    }
  },
};
