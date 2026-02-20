import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';
import { AlienId, CardType } from '@cosmic/shared';

export const PhilanthropistHooks: AlienHooks = {
  onCardsDrawn(ctx: AlienContext, playerId: PlayerId, _count: number) {
    // Only trigger when Philanthropist themselves draws cards
    if (playerId !== ctx.alienOwnerId) return;

    const philanthropist = ctx.getPlayer(ctx.alienOwnerId);
    if (philanthropist.hand.length === 0) return;

    // Find the player with the fewest cards (excluding Philanthropist)
    let poorestPlayerId: PlayerId | null = null;
    let fewestCards = Infinity;

    for (const [pid, player] of Object.entries(ctx.state.players)) {
      if (pid === ctx.alienOwnerId) continue;
      if (player.hand.length < fewestCards) {
        fewestCards = player.hand.length;
        poorestPlayerId = pid as PlayerId;
      }
    }

    if (!poorestPlayerId) return;

    // Give the lowest-value attack card (or first card if none)
    let cardToGiveId: string | null = null;
    let lowestValue = Infinity;

    for (const cardId of philanthropist.hand) {
      const card = ctx.state.allCards[cardId];
      if (!card) continue;
      if (card.type === CardType.ATTACK) {
        if (card.value < lowestValue) {
          lowestValue = card.value;
          cardToGiveId = cardId;
        }
      }
    }

    // Fall back to the first card in hand if no attack card found
    if (!cardToGiveId) {
      cardToGiveId = philanthropist.hand[0];
    }

    if (!cardToGiveId) return;

    // Transfer the card
    philanthropist.hand = philanthropist.hand.filter(id => id !== cardToGiveId);
    ctx.getPlayer(poorestPlayerId).hand.push(cardToGiveId);

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.PHILANTHROPIST,
      description: `Philanthropist gives a card to ${poorestPlayerId} (fewest cards: ${fewestCards})`,
    });
  },
};
