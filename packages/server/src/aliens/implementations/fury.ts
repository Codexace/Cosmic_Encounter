import type { AlienHooks, AlienContext, HookResult } from '../alien-base.js';
import type { EncounterOutcome } from '@cosmic/shared';

export const FuryHooks: AlienHooks = {
  initAlienData() {
    return { _furyRevengeTriggered: false };
  },

  onCombatResolved(ctx: AlienContext, outcome: EncounterOutcome): HookResult | void {
    if (!ctx.isDefense(ctx.alienOwnerId)) return;

    const player = ctx.getPlayer(ctx.alienOwnerId);

    // Only triggers when defense loses
    const defenseLoses =
      outcome.type === 'OFFENSE_WINS' ||
      (outcome.type === 'ATTACK_VS_NEGOTIATE' && outcome.winner === 'offense');

    if (!defenseLoses) return;

    // Check if a home colony was lost
    const es = ctx.state.encounterState;
    if (!es) return;

    const targetPlanet = Object.values(ctx.state.players)
      .flatMap((p) => p.planets)
      .find((p) => p.id === es.targetPlanetId);

    if (!targetPlanet || targetPlanet.ownerColor !== player.color) return;

    // Home colony is being lost — trigger revenge
    player.alienData._furyRevengeTriggered = true;
    ctx.log(`${player.name} (Fury) is enraged by the loss of a home colony and demands revenge!`);
  },
};
