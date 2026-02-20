import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const GamblerHooks: AlienHooks = {
  initAlienData() {
    return { _gamblerActive: false };
  },

  onPlanningStart(ctx: AlienContext) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    // Mark that Gambler is playing face-up this encounter
    ctx.getPlayer(ctx.alienOwnerId).alienData._gamblerActive = true;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.GAMBLER,
      description: 'Gambler plays encounter card face-up for double-or-nothing rewards',
    });
  },

  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    if (!owner.alienData._gamblerActive) return;

    // Reset the flag
    owner.alienData._gamblerActive = false;

    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const won =
      (isOffense && outcome.type === 'OFFENSE_WINS') ||
      (!isOffense && outcome.type === 'DEFENSE_WINS');

    if (won) {
      // Double rewards: draw 2 extra cards as bonus
      for (let i = 0; i < 2; i++) {
        const cardId = ctx.drawCard();
        if (cardId) {
          owner.hand.push(cardId);
        }
      }

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.GAMBLER,
        description: 'Gambler wins the gamble and receives double rewards',
      });
    } else {
      ctx.log('Gambler lost the gamble — no extra penalty beyond normal loss');
    }
  },
};
