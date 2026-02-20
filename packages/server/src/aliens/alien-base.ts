import type {
  GameState,
  PlayerState,
  PlayerId,
  PlayerColor,
  CardId,
  CosmicCard,
  EncounterCard,
  EncounterOutcome,
  DealProposal,
  GameLogEntry,
  EncounterState,
} from '@cosmic/shared';
import { Phase } from '@cosmic/shared';
import type { ServerEvent } from '@cosmic/shared';

/**
 * Context object passed to alien hook functions.
 * Provides information about the game state and the current situation.
 */
export interface AlienContext {
  /** Full game state (mutable — hooks can modify it directly) */
  state: GameState;
  /** The player who owns this alien power */
  alienOwnerId: PlayerId;
  /** The player who triggered the current action (may differ from alienOwner) */
  triggeringPlayerId: PlayerId;
  /** Current game phase */
  phase: Phase;
  /** Helper to get player state */
  getPlayer(playerId: PlayerId): PlayerState;
  /** Helper to check roles */
  isOffense(playerId: PlayerId): boolean;
  isDefense(playerId: PlayerId): boolean;
  isMainPlayer(playerId: PlayerId): boolean;
  isAlly(playerId: PlayerId): boolean;
  /** Emit an event to be broadcast to all clients */
  emitEvent(event: ServerEvent): void;
  /** Add a message to the game log */
  log(message: string): void;
  /** Draw a card from the cosmic deck */
  drawCard(): CardId | null;
}

/**
 * Result returned from alien hooks.
 * Hooks can modify state, cancel actions, or skip default behavior.
 */
export interface HookResult {
  /** If true, the action that triggered this hook is canceled entirely */
  canceled?: boolean;
  /** If true, skip the default game logic for this action */
  preventDefault?: boolean;
  /** Additional events to broadcast */
  events?: ServerEvent[];
}

/**
 * The interface that each alien power implements.
 * All methods are optional — aliens only implement the hooks relevant to their power.
 */
export interface AlienHooks {
  // --- Phase lifecycle hooks ---
  /** Called when a phase begins */
  onPhaseStart?(ctx: AlienContext, phase: Phase): HookResult | void;
  /** Called when a phase ends */
  onPhaseEnd?(ctx: AlienContext, phase: Phase): HookResult | void;

  // --- Encounter resolution hooks ---
  /** Modify the attack total for a side. Return the new total. */
  modifyAttackTotal?(ctx: AlienContext, side: 'offense' | 'defense', currentTotal: number, shipCount: number, cardValue: number): number;
  /** Called after encounter cards are revealed but before totals are compared */
  onCardsRevealed?(ctx: AlienContext, offenseCard: CosmicCard, defenseCard: CosmicCard): HookResult | void;
  /** Called after combat is resolved (winner determined) but before effects applied */
  onCombatResolved?(ctx: AlienContext, outcome: EncounterOutcome): HookResult | void;

  // --- Ship movement hooks ---
  /** Return false to prevent this player's ships from going to the warp */
  canShipsGoToWarp?(ctx: AlienContext, playerColor: PlayerColor, count: number): boolean;
  /** Called when ships are about to go to the warp */
  onShipsSentToWarp?(ctx: AlienContext, playerColor: PlayerColor, count: number): HookResult | void;
  /** Called when ships are retrieved from the warp */
  onShipsRetrievedFromWarp?(ctx: AlienContext, playerId: PlayerId, count: number): HookResult | void;
  /** Modify how many ships the offense retrieves during regroup */
  modifyRegroupCount?(ctx: AlienContext): number;

  // --- Colony hooks ---
  /** Called when a colony is established */
  onColonyEstablished?(ctx: AlienContext, playerId: PlayerId, planetId: string): HookResult | void;
  /** Called when a colony is lost */
  onColonyLost?(ctx: AlienContext, playerId: PlayerId, planetId: string): HookResult | void;

  // --- Card hooks ---
  /** Called when a player draws cards */
  onCardsDrawn?(ctx: AlienContext, playerId: PlayerId, count: number): HookResult | void;
  /** Called during planning, before cards are locked in */
  onPlanningStart?(ctx: AlienContext): HookResult | void;
  /** Allows an alien to see/modify the opponent's selected card */
  onPlanningCardSelected?(ctx: AlienContext, byPlayerId: PlayerId, cardId: CardId): HookResult | void;

  // --- Alliance hooks ---
  /** Called when allies are being invited */
  onAllianceInvitation?(ctx: AlienContext): HookResult | void;
  /** Called when a player responds to an alliance invitation */
  onAllianceResponse?(ctx: AlienContext, playerId: PlayerId, response: 'offense' | 'defense' | 'decline'): HookResult | void;
  /** Modify the maximum number of ships a player can commit to the gate */
  modifyMaxShipsInGate?(ctx: AlienContext): number;

  // --- Compensation and rewards ---
  /** Called when compensation is about to be paid */
  onCompensation?(ctx: AlienContext, receiverId: PlayerId, giverId: PlayerId, count: number): HookResult | void;
  /** Called when defender rewards are about to be given */
  onDefenderRewards?(ctx: AlienContext, playerId: PlayerId, shipCount: number): HookResult | void;

  // --- Deal hooks ---
  /** Called when a deal is proposed */
  onDealProposed?(ctx: AlienContext, deal: DealProposal): HookResult | void;

  // --- Flare effects ---
  /** Wild flare effect (any player can use) */
  onFlareWild?(ctx: AlienContext, playerId: PlayerId): HookResult | void;
  /** Super flare effect (only the alien's owner can use) */
  onFlareSuper?(ctx: AlienContext, playerId: PlayerId): HookResult | void;

  // --- Decision hooks ---
  /** Does this power require a player decision at the given phase? */
  requiresDecision?(ctx: AlienContext, phase: Phase): boolean;
  /** Initialize alien-specific persistent data */
  initAlienData?(): Record<string, unknown>;
}
