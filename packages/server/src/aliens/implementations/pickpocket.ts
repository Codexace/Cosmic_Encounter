import type { AlienHooks, AlienContext, HookResult } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';

export const PickpocketHooks: AlienHooks = {
  onCompensation(ctx: AlienContext, receiverId: PlayerId, giverId: PlayerId, count: number): HookResult | void {
    const ownerId = ctx.alienOwnerId;
    // Pickpocket intercepts compensation meant for anyone else
    if (receiverId === ownerId) return;

    const pickpocket = ctx.getPlayer(ownerId);
    const giver = ctx.getPlayer(giverId);

    if (giver.hand.length === 0 || count <= 0) return;

    const actualCount = Math.min(count, giver.hand.length);
    // Shuffle giver's hand and take cards
    const handCopy = [...giver.hand];
    for (let i = handCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [handCopy[i], handCopy[j]] = [handCopy[j], handCopy[i]];
    }

    const stolen = handCopy.slice(0, actualCount);
    for (const cardId of stolen) {
      giver.hand = giver.hand.filter((id) => id !== cardId);
      pickpocket.hand.push(cardId);
    }

    ctx.log(`${pickpocket.name} (Pickpocket) intercepts ${actualCount} compensation card(s)`);
    return { preventDefault: true };
  },
};
