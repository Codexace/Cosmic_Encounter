import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { CosmicCard } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const SorcererHooks: AlienHooks = {
  onCardsRevealed(ctx: AlienContext, offenseCard: CosmicCard, defenseCard: CosmicCard) {
    if (!ctx.isMainPlayer(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Swap the offense and defense encounter cards
    const offenseCardId = enc.offenseCardId;
    const defenseCardId = enc.defenseCardId;

    enc.offenseCardId = defenseCardId;
    enc.defenseCardId = offenseCardId;

    // Also swap them in the phaseData
    const phaseData = ctx.state.phaseData as {
      offenseCard?: CosmicCard | null;
      defenseCard?: CosmicCard | null;
      offenseCardId?: string | null;
      defenseCardId?: string | null;
    };

    if (phaseData) {
      const tempCard = phaseData.offenseCard;
      phaseData.offenseCard = phaseData.defenseCard ?? null;
      phaseData.defenseCard = tempCard ?? null;

      const tempId = phaseData.offenseCardId;
      phaseData.offenseCardId = phaseData.defenseCardId ?? null;
      phaseData.defenseCardId = tempId ?? null;
    }

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.SORCERER,
      description: 'Sorcerer swaps the two encounter cards after both are selected',
    });
  },
};
