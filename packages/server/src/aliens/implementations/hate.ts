import type { AlienHooks, AlienContext } from '../alien-base.js';
import type { PlayerId } from '@cosmic/shared';
import { AlienId, Phase } from '@cosmic/shared';

export const HateHooks: AlienHooks = {
  initAlienData() {
    return { _hatedEnemy: null as PlayerId | null };
  },

  onPhaseStart(ctx: AlienContext, phase: Phase) {
    if (phase !== Phase.LAUNCH) return;
    if (!ctx.isOffense(ctx.alienOwnerId)) return;

    const enc = ctx.state.encounterState;
    if (!enc) return;

    // Designate the defense as the hated enemy
    const owner = ctx.getPlayer(ctx.alienOwnerId);
    owner.alienData._hatedEnemy = enc.defensePlayerId;

    ctx.emitEvent({
      type: 'ALIEN_POWER_USED',
      playerId: ctx.alienOwnerId,
      alienId: AlienId.HATE,
      description: `Hate designates ${ctx.getPlayer(enc.defensePlayerId).name} as hated enemy`,
    });
  },

  modifyMaxShipsInGate(ctx: AlienContext) {
    if (!ctx.isOffense(ctx.alienOwnerId)) return 4;

    const owner = ctx.getPlayer(ctx.alienOwnerId);
    const hatedEnemy = owner.alienData._hatedEnemy as PlayerId | null;

    if (!hatedEnemy) return 4;

    const enc = ctx.state.encounterState;
    if (!enc) return 4;

    // If the defense is the hated enemy, allow 2 extra ships
    if (enc.defensePlayerId === hatedEnemy) {
      ctx.emitEvent({
        type: 'ALIEN_POWER_USED',
        playerId: ctx.alienOwnerId,
        alienId: AlienId.HATE,
        description: 'Hate gains +2 ship slots against hated enemy',
      });
      return 6;
    }

    return 4;
  },
};
