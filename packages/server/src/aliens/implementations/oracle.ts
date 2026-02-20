import type { AlienHooks, AlienContext } from '../alien-base.js';
import { AlienId } from '@cosmic/shared';

export const OracleHooks: AlienHooks = {
  initAlienData() {
    return { revealedDefenseCardId: null as string | null };
  },

  onPlanningStart(ctx: AlienContext) {
    // Oracle must be the offense to use this power
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // The defense card is selected during planning; peek at it if already chosen
    const phaseData = ctx.state.phaseData as { defenseCardId?: string | null };
    const defenseCardId = phaseData?.defenseCardId ?? null;

    if (defenseCardId) {
      ctx.getPlayer(ctx.alienOwnerId).alienData.revealedDefenseCardId = defenseCardId;

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.ORACLE,
        description: "Oracle sees the defense's encounter card before selecting their own",
      });
    }
  },

  onPlanningCardSelected(ctx: AlienContext, byPlayerId, cardId) {
    // When Oracle is offense and the defense selects their card, record it so Oracle can see it
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    if (byPlayerId === enc.defensePlayerId) {
      ctx.getPlayer(ctx.alienOwnerId).alienData.revealedDefenseCardId = cardId;

      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.ORACLE,
        description: "Oracle sees the defense's encounter card before selecting their own",
      });
    }
  },
};
