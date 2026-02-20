import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const FilchHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, _outcome: EncounterOutcome) {
    const owner = ctx.getPlayer(ctx.alienOwnerId);

    // Find the player with the most cards (excluding Filch owner)
    let targetId: string | null = null;
    let maxCards = 0;
    for (const [pid, player] of Object.entries(ctx.state.players)) {
      if (pid === ctx.alienOwnerId) continue;
      if (player.hand.length > maxCards) {
        maxCards = player.hand.length;
        targetId = pid;
      }
    }

    if (!targetId || maxCards === 0) return;

    const target = ctx.getPlayer(targetId);

    // Steal one random card from the target
    const randomIndex = Math.floor(Math.random() * target.hand.length);
    const stolenCardId = target.hand.splice(randomIndex, 1)[0];
    owner.hand.push(stolenCardId);

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.FILCH,
      description: `Filch steals a card from ${target.name}`,
    });
  },
};
