import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const LoserHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    if (outcome.type !== 'OFFENSE_WINS' && outcome.type !== 'DEFENSE_WINS') return;

    // Loser wins when losing and loses when winning — flip the outcome
    const flipped: EncounterOutcome =
      outcome.type === 'OFFENSE_WINS' ? { type: 'DEFENSE_WINS' } : { type: 'OFFENSE_WINS' };

    const phaseData = ctx.state.phaseData as { outcome?: EncounterOutcome };
    if (phaseData && 'outcome' in phaseData) {
      phaseData.outcome = flipped;
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.LOSER,
      description: 'Loser inverts the outcome: losing becomes winning',
    });
  },
};
