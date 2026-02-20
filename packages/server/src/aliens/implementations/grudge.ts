import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { EncounterOutcome, PlayerId } from '@cosmic/shared';
import { AlienId } from '@cosmic/shared';

export const GrudgeHooks: AlienHooks = {
  initAlienData() {
    return { _grudgeTokens: {} as Record<PlayerId, number> };
  },

  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome) {
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const grudgeTokens = (owner.alienData._grudgeTokens as Record<string, number>) ?? {};

    const enc = ctx.state.encounterState;
    if (!enc) return;

    const isOffense = ctx.isOffense(ctx.alienOwnerId);
    const isDefense = ctx.isDefense(ctx.alienOwnerId);

    // Determine if Grudge lost in this encounter
    let responsiblePlayer: string | null = null;

    if (isOffense && (outcome.type === 'DEFENSE_WINS' || (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'defense'))) {
      responsiblePlayer = enc.defensePlayerId;
    } else if (isDefense && (outcome.type === 'OFFENSE_WINS' || (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'offense'))) {
      responsiblePlayer = ctx.state.activePlayerId;
    }

    if (!responsiblePlayer) return;

    grudgeTokens[responsiblePlayer] = (grudgeTokens[responsiblePlayer] ?? 0) + 1;
    owner.alienData._grudgeTokens = grudgeTokens;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.GRUDGE,
      description: `Grudge places a grudge token on ${ctx.getPlayer(responsiblePlayer).name} (total: ${grudgeTokens[responsiblePlayer]})`,
    });
  },

  onCardsDrawn(ctx: AlienContext, playerId: PlayerId, count: number) {
    // Grudge tokens reduce a player's card draw
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const grudgeTokens = (owner.alienData._grudgeTokens as Record<string, number>) ?? {};
    const tokens = grudgeTokens[playerId] ?? 0;

    if (tokens > 0 && count > 0) {
      // Remove cards that were just drawn as penalty
      const target = ctx.getPlayer(playerId);
      const toRemove = Math.min(tokens, target.hand.length);
      for (let i = 0; i < toRemove; i++) {
        const removedCard = target.hand.pop();
        if (removedCard) {
          ctx.state.cosmicDiscard.push(removedCard);
        }
      }

      if (toRemove > 0) {
        ctx.log(`Grudge tokens force ${target.name} to discard ${toRemove} drawn card(s)`);
      }
    }
  },
};
