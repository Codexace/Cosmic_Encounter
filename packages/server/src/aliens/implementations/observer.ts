import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';

export const ObserverHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    const ownerId = ctx.alienOwnerId;
    // Must NOT be a main player and must NOT be an ally
    if (ctx.isMainPlayer(ownerId) || ctx.isAlly(ownerId)) return;

    // Only triggers when defense wins
    const defenseWins =
      outcome.type === 'DEFENSE_WINS' ||
      (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'defense');

    if (!defenseWins) return;

    const player = ctx.getPlayer(ownerId);
    // Draw 1 card when defense wins
    const cardId = ctx.drawCard();
    if (cardId) {
      player.hand.push(cardId);
    }
    ctx.log(`${player.name} (Observer) draws a card from watching the defense win`);
  },
};
