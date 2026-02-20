import type {
  GameState,
  PlayerState,
  PlayerId,
  PlayerColor,
  CardId,
  CosmicCard,
  EncounterOutcome,
} from '@cosmic/shared';
import { Phase, AlienId } from '@cosmic/shared';
import type { PlayerPrerequisite } from '@cosmic/shared';
import { ALIEN_CATALOG } from '@cosmic/shared';
import type { ServerEvent } from '@cosmic/shared';
import type { AlienHooks, AlienContext, HookResult } from './alien-base.js';
import { DeckManager } from '../game/deck-manager.js';

// Import all alien implementations
import { ZombieHooks } from './implementations/zombie.js';
import { AntiMatterHooks } from './implementations/anti-matter.js';
import { MacronHooks } from './implementations/macron.js';
import { VirusHooks } from './implementations/virus.js';
import { WarriorHooks } from './implementations/warrior.js';
import { CloneHooks } from './implementations/clone.js';
import { OracleHooks } from './implementations/oracle.js';
import { LoserHooks } from './implementations/loser.js';
import { PacifistHooks } from './implementations/pacifist.js';
import { ChosenHooks } from './implementations/chosen.js';
import { MutantHooks } from './implementations/mutant.js';
import { WarpishHooks } from './implementations/warpish.js';
import { FidoHooks } from './implementations/fido.js';
import { ShadowHooks } from './implementations/shadow.js';
import { VoidHooks } from './implementations/void.js';
import { HealerHooks } from './implementations/healer.js';
import { RemoraHooks } from './implementations/remora.js';
import { TraderHooks } from './implementations/trader.js';
import { ParasiteHooks } from './implementations/parasite.js';
import { PhilanthropistHooks } from './implementations/philanthropist.js';
import { SorcererHooks } from './implementations/sorcerer.js';
import { FodderHooks } from './implementations/fodder.js';
import { HumanHooks } from './implementations/human.js';
import { CudgelHooks } from './implementations/cudgel.js';
import { DictatorHooks } from './implementations/dictator.js';
import { FilchHooks } from './implementations/filch.js';
import { GamblerHooks } from './implementations/gambler.js';
import { GrudgeHooks } from './implementations/grudge.js';
import { HackerHooks } from './implementations/hacker.js';
import { HateHooks } from './implementations/hate.js';
import { KamikazeHooks } from './implementations/kamikaze.js';
import { MindHooks } from './implementations/mind.js';
import { MiserHooks } from './implementations/miser.js';
import { ObserverHooks } from './implementations/observer.js';
import { PickpocketHooks } from './implementations/pickpocket.js';
import { ReincarnatorHooks } from './implementations/reincarnator.js';
import { ReserveHooks } from './implementations/reserve.js';
import { SeekerHooks } from './implementations/seeker.js';
import { SpiffHooks } from './implementations/spiff.js';
import { TickTockHooks } from './implementations/tick-tock.js';
import { TriplerHooks } from './implementations/tripler.js';
import { VacuumHooks } from './implementations/vacuum.js';
import { WillHooks } from './implementations/will.js';
import { AmoebaHooks } from './implementations/amoeba.js';
import { CitadelHooks } from './implementations/citadel.js';
import { ChrysalisHooks } from './implementations/chrysalis.js';
import { EthicHooks } from './implementations/ethic.js';
import { FuryHooks } from './implementations/fury.js';
import { PentaformHooks } from './implementations/pentaform.js';
import { MirrorHooks } from './implementations/mirror.js';

/**
 * Registry that maps AlienId to their hook implementations.
 * Also provides the dispatching logic for calling hooks in the correct order.
 */
export class AlienRegistry {
  private implementations = new Map<AlienId, AlienHooks>();
  private deckManager: DeckManager;

  constructor(deckManager: DeckManager) {
    this.deckManager = deckManager;
    this.registerAll();
  }

  private registerAll(): void {
    this.implementations.set(AlienId.ZOMBIE, ZombieHooks);
    this.implementations.set(AlienId.ANTI_MATTER, AntiMatterHooks);
    this.implementations.set(AlienId.MACRON, MacronHooks);
    this.implementations.set(AlienId.VIRUS, VirusHooks);
    this.implementations.set(AlienId.WARRIOR, WarriorHooks);
    this.implementations.set(AlienId.CLONE, CloneHooks);
    this.implementations.set(AlienId.ORACLE, OracleHooks);
    this.implementations.set(AlienId.LOSER, LoserHooks);
    this.implementations.set(AlienId.PACIFIST, PacifistHooks);
    this.implementations.set(AlienId.CHOSEN, ChosenHooks);
    this.implementations.set(AlienId.MUTANT, MutantHooks);
    this.implementations.set(AlienId.WARPISH, WarpishHooks);
    this.implementations.set(AlienId.FIDO, FidoHooks);
    this.implementations.set(AlienId.SHADOW, ShadowHooks);
    this.implementations.set(AlienId.VOID, VoidHooks);
    this.implementations.set(AlienId.HEALER, HealerHooks);
    this.implementations.set(AlienId.REMORA, RemoraHooks);
    this.implementations.set(AlienId.TRADER, TraderHooks);
    this.implementations.set(AlienId.PARASITE, ParasiteHooks);
    this.implementations.set(AlienId.PHILANTHROPIST, PhilanthropistHooks);
    this.implementations.set(AlienId.SORCERER, SorcererHooks);
    this.implementations.set(AlienId.FODDER, FodderHooks);
    this.implementations.set(AlienId.HUMAN, HumanHooks);
    this.implementations.set(AlienId.CUDGEL, CudgelHooks);
    this.implementations.set(AlienId.DICTATOR, DictatorHooks);
    this.implementations.set(AlienId.FILCH, FilchHooks);
    this.implementations.set(AlienId.GAMBLER, GamblerHooks);
    this.implementations.set(AlienId.GRUDGE, GrudgeHooks);
    this.implementations.set(AlienId.HACKER, HackerHooks);
    this.implementations.set(AlienId.HATE, HateHooks);
    this.implementations.set(AlienId.KAMIKAZE, KamikazeHooks);
    this.implementations.set(AlienId.MIND, MindHooks);
    this.implementations.set(AlienId.MISER, MiserHooks);
    this.implementations.set(AlienId.OBSERVER, ObserverHooks);
    this.implementations.set(AlienId.PICKPOCKET, PickpocketHooks);
    this.implementations.set(AlienId.REINCARNATOR, ReincarnatorHooks);
    this.implementations.set(AlienId.RESERVE, ReserveHooks);
    this.implementations.set(AlienId.SEEKER, SeekerHooks);
    this.implementations.set(AlienId.SPIFF, SpiffHooks);
    this.implementations.set(AlienId.TICK_TOCK, TickTockHooks);
    this.implementations.set(AlienId.TRIPLER, TriplerHooks);
    this.implementations.set(AlienId.VACUUM, VacuumHooks);
    this.implementations.set(AlienId.WILL, WillHooks);
    this.implementations.set(AlienId.AMOEBA, AmoebaHooks);
    this.implementations.set(AlienId.CITADEL, CitadelHooks);
    this.implementations.set(AlienId.CHRYSALIS, ChrysalisHooks);
    this.implementations.set(AlienId.ETHIC, EthicHooks);
    this.implementations.set(AlienId.FURY, FuryHooks);
    this.implementations.set(AlienId.PENTAFORM, PentaformHooks);
    this.implementations.set(AlienId.PHILANTHROPIST_2, MirrorHooks);
  }

  getHooks(alienId: AlienId): AlienHooks | undefined {
    return this.implementations.get(alienId);
  }

  /**
   * Get the ordered list of players for hook resolution.
   * Per rules: offense first, then defense, then clockwise from offense.
   */
  private getHookOrder(state: GameState): PlayerId[] {
    const { turnOrder, activePlayerId, encounterState } = state;
    const result: PlayerId[] = [activePlayerId];

    if (encounterState?.defensePlayerId && encounterState.defensePlayerId !== activePlayerId) {
      result.push(encounterState.defensePlayerId);
    }

    const offenseIndex = turnOrder.indexOf(activePlayerId);
    for (let i = 1; i < turnOrder.length; i++) {
      const idx = (offenseIndex + i) % turnOrder.length;
      const pid = turnOrder[idx];
      if (!result.includes(pid)) {
        result.push(pid);
      }
    }

    return result;
  }

  /**
   * Check if a player meets the prerequisite for their alien power.
   */
  private meetsPrerequisite(
    playerId: PlayerId,
    state: GameState,
    prereq: PlayerPrerequisite
  ): boolean {
    const isOffense = playerId === state.activePlayerId;
    const isDefense = playerId === state.encounterState?.defensePlayerId;
    const isMainPlayer = isOffense || isDefense;
    const enc = state.encounterState;
    const isOffAlly = enc ? playerId in (enc.offensiveAllies ?? {}) : false;
    const isDefAlly = enc ? playerId in (enc.defensiveAllies ?? {}) : false;
    const isAlly = isOffAlly || isDefAlly;

    switch (prereq) {
      case 'OFFENSE': return isOffense;
      case 'DEFENSE': return isDefense;
      case 'DEFENSE_ONLY': return isDefense;
      case 'MAIN_PLAYER': return isMainPlayer;
      case 'ALLY': return isAlly;
      case 'OFFENSIVE_ALLY': return isOffAlly;
      case 'DEFENSIVE_ALLY': return isDefAlly;
      case 'ANY_PLAYER': return true;
      case 'NOT_MAIN_PLAYER': return !isMainPlayer;
      default: return true;
    }
  }

  /**
   * Build the AlienContext for a given player's alien.
   */
  buildContext(
    state: GameState,
    alienOwnerId: PlayerId,
    triggeringPlayerId: PlayerId,
    events: ServerEvent[]
  ): AlienContext {
    return {
      state,
      alienOwnerId,
      triggeringPlayerId,
      phase: state.phase as Phase,
      getPlayer: (pid: PlayerId) => state.players[pid],
      isOffense: (pid: PlayerId) => pid === state.activePlayerId,
      isDefense: (pid: PlayerId) => pid === state.encounterState?.defensePlayerId,
      isMainPlayer: (pid: PlayerId) =>
        pid === state.activePlayerId || pid === state.encounterState?.defensePlayerId,
      isAlly: (pid: PlayerId) => {
        const enc = state.encounterState;
        if (!enc) return false;
        return pid in (enc.offensiveAllies ?? {}) || pid in (enc.defensiveAllies ?? {});
      },
      emitEvent: (event: ServerEvent) => events.push(event),
      log: (message: string) => {
        const entry = { timestamp: Date.now(), message, phase: state.phase as Phase };
        state.gameLog.push(entry);
        events.push({ type: 'GAME_LOG', entry });
      },
      drawCard: () => this.deckManager.drawFromCosmicDeck(state),
    };
  }

  /**
   * Check if a player's alien is zapped for the current encounter.
   */
  private isZapped(state: GameState, playerId: PlayerId): boolean {
    const player = state.players[playerId];
    return player.alienData._zappedUntilEndOfEncounter === true;
  }

  // ---- Hook dispatch methods ----

  /**
   * Dispatch onPhaseStart hooks for all active aliens.
   */
  dispatchPhaseStart(state: GameState, phase: Phase, events: ServerEvent[]): void {
    const order = this.getHookOrder(state);
    for (const playerId of order) {
      const player = state.players[playerId];
      if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.onPhaseStart) continue;

      const alien = ALIEN_CATALOG[player.alienId];
      if (!alien.activePhases.includes(phase)) continue;
      if (!this.meetsPrerequisite(playerId, state, alien.playerPrerequisite)) continue;

      const ctx = this.buildContext(state, playerId, playerId, events);
      hooks.onPhaseStart(ctx, phase);
    }
  }

  /**
   * Dispatch modifyAttackTotal for all active aliens.
   */
  dispatchModifyAttackTotal(
    state: GameState,
    side: 'offense' | 'defense',
    currentTotal: number,
    shipCount: number,
    cardValue: number,
    events: ServerEvent[]
  ): number {
    let total = currentTotal;
    const order = this.getHookOrder(state);

    for (const playerId of order) {
      const player = state.players[playerId];
      if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.modifyAttackTotal) continue;

      const alien = ALIEN_CATALOG[player.alienId];
      if (!this.meetsPrerequisite(playerId, state, alien.playerPrerequisite)) continue;

      const ctx = this.buildContext(state, playerId, playerId, events);
      total = hooks.modifyAttackTotal(ctx, side, total, shipCount, cardValue);
    }

    return total;
  }

  /**
   * Dispatch onCombatResolved for all active aliens.
   * Returns modified outcome if any alien changes it.
   */
  dispatchCombatResolved(
    state: GameState,
    outcome: EncounterOutcome,
    events: ServerEvent[]
  ): EncounterOutcome {
    let currentOutcome = outcome;
    const order = this.getHookOrder(state);

    for (const playerId of order) {
      const player = state.players[playerId];
      if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.onCombatResolved) continue;

      const alien = ALIEN_CATALOG[player.alienId];
      if (!this.meetsPrerequisite(playerId, state, alien.playerPrerequisite)) continue;

      const ctx = this.buildContext(state, playerId, playerId, events);
      const result = hooks.onCombatResolved(ctx, currentOutcome);
      if (result?.preventDefault) {
        // The alien hook has modified the outcome via state manipulation
        // Check if it returned events
      }
    }

    return currentOutcome;
  }

  /**
   * Check if an alien prevents ships from going to the warp.
   */
  canShipsGoToWarp(state: GameState, playerColor: PlayerColor, count: number, events: ServerEvent[]): boolean {
    const order = this.getHookOrder(state);

    for (const playerId of order) {
      const player = state.players[playerId];
      if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) continue;
      // Only check if this alien's ships are the ones going to warp, or if the alien affects others
      if (player.color !== playerColor) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.canShipsGoToWarp) continue;

      const ctx = this.buildContext(state, playerId, playerId, events);
      if (!hooks.canShipsGoToWarp(ctx, playerColor, count)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Dispatch onShipsSentToWarp for all active aliens.
   */
  dispatchShipsSentToWarp(state: GameState, playerColor: PlayerColor, count: number, events: ServerEvent[]): HookResult | void {
    const order = this.getHookOrder(state);

    for (const playerId of order) {
      const player = state.players[playerId];
      if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.onShipsSentToWarp) continue;

      const ctx = this.buildContext(state, playerId, playerId, events);
      const result = hooks.onShipsSentToWarp(ctx, playerColor, count);
      if (result?.preventDefault) return result;
    }
  }

  /**
   * Dispatch onCardsDrawn for all active aliens.
   */
  dispatchCardsDrawn(state: GameState, playerId: PlayerId, count: number, events: ServerEvent[]): void {
    const order = this.getHookOrder(state);

    for (const pid of order) {
      const player = state.players[pid];
      if (!player.alienId || !player.alienActive || this.isZapped(state, pid)) continue;

      const hooks = this.implementations.get(player.alienId);
      if (!hooks?.onCardsDrawn) continue;

      const ctx = this.buildContext(state, pid, playerId, events);
      hooks.onCardsDrawn(ctx, playerId, count);
    }
  }

  /**
   * Dispatch modifyRegroupCount for the offense player.
   */
  dispatchModifyRegroupCount(state: GameState, events: ServerEvent[]): number {
    let count = 1; // Default: retrieve 1 ship
    const playerId = state.activePlayerId;
    const player = state.players[playerId];

    if (!player.alienId || !player.alienActive || this.isZapped(state, playerId)) return count;

    const hooks = this.implementations.get(player.alienId);
    if (!hooks?.modifyRegroupCount) return count;

    const alien = ALIEN_CATALOG[player.alienId];
    if (!this.meetsPrerequisite(playerId, state, alien.playerPrerequisite)) return count;

    const ctx = this.buildContext(state, playerId, playerId, events);
    return hooks.modifyRegroupCount(ctx);
  }

  /**
   * Clear the zapped flag at end of encounter for all players.
   */
  clearZappedFlags(state: GameState): void {
    for (const player of Object.values(state.players)) {
      delete player.alienData._zappedUntilEndOfEncounter;
    }
  }
}
