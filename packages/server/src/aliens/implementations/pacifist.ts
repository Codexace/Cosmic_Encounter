import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const PacifistHooks: AlienHooks = {
  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    if (outcome.type !== 'ATTACK_VS_NEGOTIATE') return;

    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    // Pacifist wins when they played Negotiate against an Attack card
    const pacifistWon =
      (isOffense && outcome.winner === 'defense') ||
      (isDefense && outcome.winner === 'offense');

    if (!pacifistWon) return;

    // Flip the outcome so Pacifist wins
    const newOutcome: EncounterOutcome = isOffense
      ? { type: 'OFFENSE_WINS' }
      : { type: 'DEFENSE_WINS' };

    const phaseData = ctx.state.phaseData as { outcome?: EncounterOutcome };
    if (phaseData && 'outcome' in phaseData) {
      phaseData.outcome = newOutcome;
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.PACIFIST,
      description: 'Pacifist wins by playing Negotiate against an Attack card',
    });
  },
};
