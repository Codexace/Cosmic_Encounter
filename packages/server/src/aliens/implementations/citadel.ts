import type { AlienHooks, AlienContext, HookResult } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';

export const CitadelHooks: AlienHooks = {
  initAlienData() {
    return { _citadelUsedThisTurn: false };
  },

  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome): HookResult | void {
    if (!ctx.isDefense(ctx.alienOwnerId)) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);
    if (player.alienData._citadelUsedThisTurn) return;

    // Only activate when defense loses
    const defenseLoses =
      outcome.type === 'OFFENSE_WINS' ||
      (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'offense');

    if (!defenseLoses) return;

    // Protect the colony — the offense won't establish on this planet
    player.alienData._citadelUsedThisTurn = true;
    ctx.log(`${player.name} (Citadel) protects their colony from being taken!`);

    // The actual prevention of colony establishment would need engine support
    // For now, we flag it and the engine can check this flag
    player.alienData._citadelProtected = true;
  },
};
