import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome, CardId } from '@cosmic/shared';
import { AlienId, CardType } from '@cosmic/shared';

export const MindHooks: AlienHooks = {
  initAlienData() {
    return { _mindPrediction: null as string | null };
  },

  onPlanningStart(ctx: AlienContext) {
    if (!ctx.isDefense(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Predict what the offense will play
    // As an AI heuristic, predict the most common card type: Attack 08
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    owner.alienData._mindPrediction = 'ATTACK_08';

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.MIND,
      description: 'Mind makes a prediction about the offense\'s encounter card',
    });
  },

  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    if (!ctx.isDefense(ctx.alienOwnerId)) return;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const prediction = owner.alienData._mindPrediction as string | null;
    if (!prediction) return;

    // Reset prediction
    owner.alienData._mindPrediction = null;

    const enc = ctx.state.encounterState;
    if (!enc || !enc.offenseCardId) return;

    // Check if the prediction was correct
    const offenseCard = ctx.state.allCards[enc.offenseCardId];
    if (!offenseCard) return;

    let cardIdentifier: string;
    if (offenseCard.type === CardType.ATTACK) {
      cardIdentifier = `ATTACK_${String(offenseCard.value).padStart(2, '0')}`;
    } else if (offenseCard.type === CardType.NEGOTIATE) {
      cardIdentifier = 'NEGOTIATE';
    } else {
      cardIdentifier = offenseCard.type;
    }

    if (cardIdentifier === prediction) {
      // Mind predicted correctly — defense auto-wins
      const phaseData = ctx.state.phaseData as { outcome?: EncounterOutcome };
      if (phaseData && 'outcome' in phaseData) {
        phaseData.outcome = { type: 'DEFENSE_WINS' };
      }

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.MIND,
        description: 'Mind predicted correctly! Defense automatically wins',
      });
    } else {
      ctx.log('Mind\'s prediction was incorrect; encounter resolves normally');
    }
  },
};
