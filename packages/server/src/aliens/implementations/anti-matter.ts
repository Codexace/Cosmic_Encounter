import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const AntiMatterHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    // Anti-Matter wins when the lower total wins (inverse of normal rules).
    // The engine already computed the outcome as high-total-wins, so we flip it.
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    const phaseData = ctx.state.phaseData as { outcome?: EncounterOutcome };

    if (outcome.type === 'OFFENSE_WINS' || outcome.type === 'DEFENSE_WINS') {
      const flipped: EncounterOutcome =
        outcome.type === 'OFFENSE_WINS'
          ? { type: 'DEFENSE_WINS' }
          : { type: 'OFFENSE_WINS' };

      // Mutate the phaseData outcome so the engine uses the flipped result
      if (phaseData && 'outcome' in phaseData) {
        phaseData.outcome = flipped;
      }

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.ANTI_MATTER,
        description: 'Anti-Matter inverts the outcome: the lower total wins',
      });

      return { preventDefault: false };
    }
  },
};
