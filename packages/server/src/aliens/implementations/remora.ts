import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const RemoraHooks: AlienHooks = {
  onCardsDrawn(ctx: AlienContext, playerId: PlayerId, _count: number) {
    // Remora draws a card whenever any OTHER player draws cards
    if (playerId === ctx.alienOwnerId) return;

    const cardId = ctx.drawCard();
    if (!cardId) return;

    ctx.getPlayer(ctx.alienOwnerId).hand.push(cardId);

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.REMORA,
      description: `Remora draws 1 card when ${playerId} draws cards`,
    });
  },
};
