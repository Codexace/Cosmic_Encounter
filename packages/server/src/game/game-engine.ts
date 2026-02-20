import type {
  GameState,
  ClientGameState,
  ClientPlayerState,
  PlayerState,
  PhaseData,
  StartTurnData,
  RegroupData,
  DestinyData,
  LaunchData,
  AllianceData,
  PlanningData,
  RevealData,
  ResolutionData,
  PlayerId,
  PlayerColor,
  CardId,
  CosmicCard,
  DestinyCard,
  LobbyRoom,
  PlayerAction,
  PlanetState,
  ColonyState,
  EncounterOutcome,
  GameLogEntry,
  EncounterState,
} from '@cosmic/shared';
import {
  Phase,
  ALL_PLAYER_COLORS,
  GAME_CONFIG,
  CardType,
  isEncounterCard,
} from '@cosmic/shared';
import { DeckManager } from './deck-manager.js';
import { resolveEncounter } from './card-resolver.js';
import { AlienRegistry } from '../aliens/alien-registry.js';
import { ArtifactHandler } from './artifact-handler.js';
import { FlareHandler } from './flare-handler.js';
import type { ServerEvent } from '@cosmic/shared';

export interface ActionResult {
  success: boolean;
  error?: string;
  events?: ServerEvent[];
}

export class GameEngine {
  private state: GameState;
  private deckManager: DeckManager;
  private alienRegistry: AlienRegistry;
  private artifactHandler: ArtifactHandler;
  private flareHandler: FlareHandler;
  private pendingEvents: ServerEvent[] = [];

  constructor(room: LobbyRoom) {
    this.deckManager = new DeckManager();
    this.alienRegistry = new AlienRegistry(this.deckManager);
    this.artifactHandler = new ArtifactHandler(this.deckManager);
    this.flareHandler = new FlareHandler(this.alienRegistry);
    this.state = this.initializeState(room);
  }

  private initializeState(room: LobbyRoom): GameState {
    const playerColors = ALL_PLAYER_COLORS.slice(0, room.players.length);

    // Build cosmic deck
    const { allCards, cosmicDeck } = this.deckManager.buildCosmicDeck(
      room.players.map((p) => p.selectedAlien!),
      room.players.length
    );

    // Build destiny deck
    const { allDestinyCards, destinyDeck } = this.deckManager.buildDestinyDeck(
      playerColors
    );

    // Create players
    const players: Record<PlayerId, PlayerState> = {};
    const turnOrder: PlayerId[] = [];

    room.players.forEach((lobbyPlayer, index) => {
      const color = playerColors[index];
      const planets: PlanetState[] = [];

      for (let p = 0; p < GAME_CONFIG.PLANETS_PER_PLAYER; p++) {
        planets.push({
          id: `${color}_${p}`,
          ownerColor: color,
          colonies: [
            { playerColor: color, shipCount: GAME_CONFIG.SHIPS_PER_PLANET },
          ],
        });
      }

      // Initialize alien-specific data if the alien provides it
      let alienData: Record<string, unknown> = {};
      if (lobbyPlayer.selectedAlien) {
        const hooks = this.alienRegistry.getHooks(lobbyPlayer.selectedAlien);
        if (hooks?.initAlienData) {
          alienData = hooks.initAlienData();
        }
      }

      players[lobbyPlayer.id] = {
        id: lobbyPlayer.id,
        name: lobbyPlayer.name,
        color,
        alienId: lobbyPlayer.selectedAlien,
        alienActive: true,
        hand: [],
        planets,
        foreignColonies: 0,
        homeColonies: GAME_CONFIG.PLANETS_PER_PLAYER,
        alienData,
        connected: true,
        sessionToken: '', // Set externally
      };

      turnOrder.push(lobbyPlayer.id);
    });

    // Initialize warp
    const warp: Record<PlayerColor, number> = {} as Record<PlayerColor, number>;
    playerColors.forEach((c) => (warp[c] = 0));

    const state: GameState = {
      roomId: room.id,
      players,
      turnOrder,
      activePlayerId: turnOrder[0],
      encounterNumber: 1,
      phase: Phase.START_TURN,
      phaseData: { phase: Phase.START_TURN, mustDrawNewHand: false } as StartTurnData,
      encounterState: null,
      cosmicDeck: cosmicDeck,
      cosmicDiscard: [],
      destinyDeck: destinyDeck,
      destinyDiscard: [],
      warp,
      allCards,
      allDestinyCards,
      winners: null,
      gameLog: [],
    };

    // Deal starting hands
    for (const playerId of turnOrder) {
      this.dealCards(state, playerId, GAME_CONFIG.HAND_SIZE);
    }

    // Check if first player needs new hand
    this.checkStartTurnHand(state);

    return state;
  }

  private dealCards(state: GameState, playerId: PlayerId, count: number): void {
    const player = state.players[playerId];
    let drawn = 0;
    for (let i = 0; i < count; i++) {
      const cardId = this.deckManager.drawFromCosmicDeck(state);
      if (cardId) {
        player.hand.push(cardId);
        drawn++;
      }
    }
    // Notify alien hooks about cards drawn
    if (drawn > 0) {
      this.alienRegistry.dispatchCardsDrawn(state, playerId, drawn, this.pendingEvents);
    }
  }

  private checkStartTurnHand(state: GameState): void {
    const player = state.players[state.activePlayerId];
    const hasEncounterCard = player.hand.some((cardId) => {
      const card = state.allCards[cardId];
      return card && isEncounterCard(card);
    });

    if (!hasEncounterCard) {
      (state.phaseData as StartTurnData).mustDrawNewHand = true;
      // Discard all remaining cards and draw a fresh hand of 8
      for (const cardId of player.hand) {
        state.cosmicDiscard.push(cardId);
      }
      player.hand = [];
      this.dealCards(state, player.id, GAME_CONFIG.HAND_SIZE);
      // After redraw the flag stays true so client knows what happened,
      // but the hand is already refilled — clear the flag once done.
      (state.phaseData as StartTurnData).mustDrawNewHand = false;
    }
  }

  applyAction(playerId: PlayerId, action: PlayerAction): ActionResult {
    if (this.state.winners) {
      return { success: false, error: 'Game is over' };
    }

    // TODO: Validate action for current phase and player role
    // TODO: Apply alien hooks before/after
    // For now, route to phase-specific handler

    try {
      this.pendingEvents = [];
      this.handleAction(playerId, action);
      const events = [...this.pendingEvents];
      this.pendingEvents = [];
      return { success: true, events };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  private handleAction(playerId: PlayerId, action: PlayerAction): void {
    switch (action.type) {
      case 'REGROUP_RETRIEVE':
        this.handleRegroup(playerId, action.destination);
        break;
      case 'DESTINY_DRAW':
        this.handleDestinyDraw(playerId);
        break;
      case 'DESTINY_CHOOSE_WILD':
        this.handleDestinyChooseWild(playerId, action.targetPlayerId);
        break;
      case 'DESTINY_DRIVE_OUT':
        this.handleDestinyDriveOut(playerId, action.targetPlayerId, action.targetPlanetId);
        break;
      case 'DESTINY_RECOLONIZE_EMPTY':
        this.handleDestinyRecolonize(playerId, action.targetPlanetId, action.shipSources);
        break;
      case 'LAUNCH_AIM':
        this.handleLaunchAim(playerId, action.targetPlanetId);
        break;
      case 'LAUNCH_COMMIT':
        this.handleLaunchCommit(playerId, action.ships);
        break;
      case 'ALLIANCE_INVITE_OFFENSE':
        this.handleAllianceInvite(playerId, 'offense', action.invitedPlayerIds);
        break;
      case 'ALLIANCE_INVITE_DEFENSE':
        this.handleAllianceInvite(playerId, 'defense', action.invitedPlayerIds);
        break;
      case 'ALLIANCE_RESPOND':
        this.handleAllianceRespond(playerId, action.response, action.shipCount, action.shipSources);
        break;
      case 'PLANNING_SELECT_CARD':
        this.handlePlanningSelectCard(playerId, action.cardId);
        break;
      case 'REVEAL_PLAY_REINFORCEMENT':
        this.handlePlayReinforcement(playerId, action.cardId, action.side);
        break;
      case 'REVEAL_PASS_REINFORCEMENT':
        this.handlePassReinforcement(playerId);
        break;
      case 'SECOND_ENCOUNTER_DECISION':
        this.handleSecondEncounterDecision(playerId, action.proceed);
        break;
      case 'NEGOTIATE_PROPOSE_DEAL':
        this.handleProposeDeal(playerId, action.deal);
        break;
      case 'NEGOTIATE_ACCEPT_DEAL':
        this.handleAcceptDeal(playerId);
        break;
      case 'NEGOTIATE_REJECT_DEAL':
        this.handleRejectDeal(playerId);
        break;
      case 'PLAY_ARTIFACT':
        this.handlePlayArtifact(playerId, action.cardId, action.target);
        break;
      case 'PLAY_FLARE':
        this.handlePlayFlare(playerId, action.cardId, action.mode);
        break;
      default:
        throw new Error(`Unhandled action type: ${(action as PlayerAction).type}`);
    }
  }

  // ---- Phase Handlers ----

  private handleRegroup(playerId: PlayerId, destination: string): void {
    if (this.state.phase !== Phase.REGROUP) throw new Error('Not in regroup phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const player = this.state.players[playerId];
    const shipsInWarp = this.state.warp[player.color] ?? 0;

    if (shipsInWarp > 0) {
      // Aliens may modify how many ships can be retrieved
      const regroupCount = this.alienRegistry.dispatchModifyRegroupCount(this.state, this.pendingEvents);
      const toRetrieve = Math.min(regroupCount, shipsInWarp);

      const planet = this.findPlanet(player, destination);
      if (!planet) throw new Error('Invalid destination planet');

      this.state.warp[player.color] -= toRetrieve;
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (colony) {
        colony.shipCount += toRetrieve;
      } else {
        planet.colonies.push({ playerColor: player.color, shipCount: toRetrieve });
      }

      this.addLog(`${player.name} retrieves ${toRetrieve} ship(s) from the warp`);
    }

    // Advance to destiny
    this.advanceToPhase(Phase.DESTINY);
  }

  private handleDestinyDraw(playerId: PlayerId): void {
    if (this.state.phase !== Phase.DESTINY) throw new Error('Not in destiny phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const cardId = this.deckManager.drawFromDestinyDeck(this.state);
    if (!cardId) throw new Error('Destiny deck empty');

    const card = this.state.allDestinyCards[cardId];
    this.state.destinyDiscard.push(cardId);

    const data = this.state.phaseData as DestinyData;
    data.drawnCard = card;

    if (card.destinyType === 'COLOR') {
      if (card.color === this.state.players[playerId].color) {
        // Drew own color — can redraw or drive out foreign colony
        data.mustRedraw = false;
        data.canDriveOut = this.hasForeignColoniesInHomeSystem(playerId);
        data.canRecolonizeEmpty = true;
        data.emptyHomePlanets = this.getEmptyHomePlanets(playerId);
        // Player must choose: redraw, drive out, or recolonize
        return;
      }
      // Normal color — set defense
      const defensePlayer = this.getPlayerByColor(card.color);
      if (defensePlayer) {
        data.defensePlayerId = defensePlayer.id;
        data.targetSystemColor = card.color;
        this.advanceToPhase(Phase.LAUNCH);
      }
    } else if (card.destinyType === 'WILD') {
      // Player must choose a target
      return;
    } else if (card.destinyType === 'SPECIAL') {
      // Special card — handle based on card text
      // For now, treat as wild
      return;
    }
  }

  private handleDestinyChooseWild(playerId: PlayerId, targetPlayerId: PlayerId): void {
    if (this.state.phase !== Phase.DESTINY) throw new Error('Not in destiny phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');
    if (targetPlayerId === playerId) throw new Error('Cannot target yourself');

    const data = this.state.phaseData as DestinyData;
    const target = this.state.players[targetPlayerId];
    if (!target) throw new Error('Invalid target');

    data.defensePlayerId = targetPlayerId;
    data.targetSystemColor = target.color;
    this.advanceToPhase(Phase.LAUNCH);
  }

  private handleDestinyDriveOut(playerId: PlayerId, targetPlayerId: PlayerId, targetPlanetId: string): void {
    if (this.state.phase !== Phase.DESTINY) throw new Error('Not in destiny phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const data = this.state.phaseData as DestinyData;
    data.defensePlayerId = targetPlayerId;
    data.targetSystemColor = this.state.players[playerId].color;

    // Advance to launch, offense will aim at their own system
    this.advanceToPhase(Phase.LAUNCH);
  }

  private handleDestinyRecolonize(playerId: PlayerId, targetPlanetId: string, shipSources: import('@cosmic/shared').ShipSource[]): void {
    if (this.state.phase !== Phase.DESTINY) throw new Error('Not in destiny phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const player = this.state.players[playerId];
    const planet = player.planets.find((p) => p.id === targetPlanetId);
    if (!planet) throw new Error('Invalid planet');

    // Move up to 4 ships to empty planet
    let totalShips = 0;
    for (const source of shipSources) {
      const srcPlanet = this.findPlanet(player, source.planetId);
      if (!srcPlanet) throw new Error('Invalid source planet');
      const colony = srcPlanet.colonies.find((c) => c.playerColor === player.color);
      if (!colony || colony.shipCount < source.count) throw new Error('Not enough ships');
      colony.shipCount -= source.count;
      totalShips += source.count;
      // Remove empty colonies
      if (colony.shipCount === 0) {
        srcPlanet.colonies = srcPlanet.colonies.filter((c) => c.playerColor !== player.color);
      }
    }

    if (totalShips > GAME_CONFIG.MAX_SHIPS_TO_RECOLONIZE || totalShips === 0) {
      throw new Error('Invalid number of ships');
    }

    planet.colonies.push({ playerColor: player.color, shipCount: totalShips });
    this.recalculateColonies(playerId);
    this.addLog(`${player.name} recolonizes an empty home planet`);

    // This counts as a successful encounter
    this.handleSuccessfulEncounter();
  }

  private handleLaunchAim(playerId: PlayerId, targetPlanetId: string): void {
    if (this.state.phase !== Phase.LAUNCH) throw new Error('Not in launch phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const data = this.state.phaseData as LaunchData;
    // Validate planet is in the target system
    data.targetPlanetId = targetPlanetId;

    // Also update encounterState with targetPlanetId once aimed
    if (this.state.encounterState) {
      this.state.encounterState.targetPlanetId = targetPlanetId;
    }
  }

  private handleLaunchCommit(playerId: PlayerId, ships: import('@cosmic/shared').ShipSource[]): void {
    if (this.state.phase !== Phase.LAUNCH) throw new Error('Not in launch phase');
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    const data = this.state.phaseData as LaunchData;
    if (!data.targetPlanetId) throw new Error('Must aim first');

    let totalShips = 0;
    const player = this.state.players[playerId];

    for (const source of ships) {
      const planet = this.findPlanet(player, source.planetId);
      if (!planet) throw new Error(`Invalid source planet: ${source.planetId}`);
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (!colony || colony.shipCount < source.count) throw new Error('Not enough ships');
      colony.shipCount -= source.count;
      totalShips += source.count;
      if (colony.shipCount === 0) {
        planet.colonies = planet.colonies.filter((c) => c.playerColor !== player.color);
      }
    }

    if (totalShips < 1 || totalShips > GAME_CONFIG.MAX_SHIPS_IN_GATE) {
      throw new Error('Must commit 1-4 ships');
    }

    data.shipsCommitted = ships;
    data.totalShipsOnGate = totalShips;
    this.recalculateColonies(playerId);

    // Persist ship info into encounterState
    if (this.state.encounterState) {
      this.state.encounterState.offenseShipCount = totalShips;
      this.state.encounterState.offenseShipSources = ships;
      this.state.encounterState.targetPlanetId = data.targetPlanetId;
    }

    this.addLog(`${player.name} launches ${totalShips} ship(s)`);
    this.advanceToPhase(Phase.ALLIANCE);
  }

  private handleAllianceInvite(playerId: PlayerId, side: 'offense' | 'defense', invitedPlayerIds: PlayerId[]): void {
    if (this.state.phase !== Phase.ALLIANCE) throw new Error('Not in alliance phase');
    const data = this.state.phaseData as AllianceData;

    if (side === 'offense') {
      if (playerId !== this.state.activePlayerId) throw new Error('Only offense can invite offense allies');
      data.offenseInvited = invitedPlayerIds.filter((id) => id !== data.defensePlayerId);
    } else {
      if (playerId !== data.defensePlayerId) throw new Error('Only defense can invite defense allies');
      data.defenseInvited = invitedPlayerIds.filter((id) => id !== this.state.activePlayerId);
    }

    // If both offense and defense have invited, start responses
    if (data.offenseInvited.length >= 0 && data.defenseInvited.length >= 0) {
      this.determineNextAllianceResponder();
    }
  }

  private handleAllianceRespond(
    playerId: PlayerId,
    response: 'offense' | 'defense' | 'decline',
    shipCount?: number,
    shipSources?: import('@cosmic/shared').ShipSource[]
  ): void {
    if (this.state.phase !== Phase.ALLIANCE) throw new Error('Not in alliance phase');
    const data = this.state.phaseData as AllianceData;
    if (data.currentResponderId !== playerId) throw new Error('Not your turn to respond');

    const player = this.state.players[playerId];
    data.responses[playerId] = response;

    if (response !== 'decline' && shipCount && shipSources) {
      if (shipCount < 1 || shipCount > GAME_CONFIG.MAX_ALLY_SHIPS) throw new Error('Must send 1-4 ships');

      // Remove ships from colonies
      for (const source of shipSources) {
        const planet = this.findPlanet(player, source.planetId);
        if (!planet) throw new Error('Invalid source');
        const colony = planet.colonies.find((c) => c.playerColor === player.color);
        if (!colony || colony.shipCount < source.count) throw new Error('Not enough ships');
        colony.shipCount -= source.count;
        if (colony.shipCount === 0) {
          planet.colonies = planet.colonies.filter((c) => c.playerColor !== player.color);
        }
      }
      this.recalculateColonies(playerId);

      if (response === 'offense') {
        data.offensiveAllies[playerId] = { shipCount, sources: shipSources };
      } else {
        data.defensiveAllies[playerId] = { shipCount, sources: shipSources };
      }
    }

    this.addLog(`${player.name} ${response === 'decline' ? 'declines' : `allies with the ${response}`}`);

    // Find next responder or advance
    this.determineNextAllianceResponder();
    if (!data.currentResponderId) {
      // Persist alliance results into encounterState before leaving alliance phase
      if (this.state.encounterState) {
        this.state.encounterState.offensiveAllies = { ...data.offensiveAllies };
        this.state.encounterState.defensiveAllies = { ...data.defensiveAllies };
      }
      this.advanceToPhase(Phase.PLANNING);
    }
  }

  private handlePlanningSelectCard(playerId: PlayerId, cardId: CardId): void {
    if (this.state.phase !== Phase.PLANNING) throw new Error('Not in planning phase');

    const data = this.state.phaseData as PlanningData;
    const player = this.state.players[playerId];

    // Validate card is in hand and is an encounter card
    if (!player.hand.includes(cardId)) throw new Error('Card not in hand');
    const card = this.state.allCards[cardId];
    if (!card || !isEncounterCard(card)) throw new Error('Must play an encounter card');

    if (playerId === this.state.activePlayerId) {
      data.offenseCardId = cardId;
      data.offenseReady = true;
    } else if (playerId === data.defensePlayerId) {
      data.defenseCardId = cardId;
      data.defenseReady = true;
    } else {
      throw new Error('Only main players select cards');
    }

    // Remove card from hand
    player.hand = player.hand.filter((id) => id !== cardId);

    if (data.offenseReady && data.defenseReady) {
      // Persist card selections into encounterState
      if (this.state.encounterState) {
        this.state.encounterState.offenseCardId = data.offenseCardId;
        this.state.encounterState.defenseCardId = data.defenseCardId;
      }
      this.advanceToPhase(Phase.REVEAL);
    }
  }

  private handlePlayReinforcement(playerId: PlayerId, cardId: CardId, side: 'offense' | 'defense'): void {
    if (this.state.phase !== Phase.REVEAL) throw new Error('Not in reveal phase');

    const data = this.state.phaseData as RevealData;
    const player = this.state.players[playerId];

    if (!player.hand.includes(cardId)) throw new Error('Card not in hand');
    const card = this.state.allCards[cardId];
    if (!card || card.type !== CardType.REINFORCEMENT) throw new Error('Must play a reinforcement card');

    player.hand = player.hand.filter((id) => id !== cardId);
    data.reinforcements.push({ playerId, cardId, value: card.value, side });

    // Recalculate totals
    this.recalculateRevealTotals();
    data.reinforcementPassCount = 0; // Reset pass count since someone played

    this.addLog(`${player.name} plays a +${card.value} reinforcement for the ${side}`);
  }

  private handlePassReinforcement(playerId: PlayerId): void {
    if (this.state.phase !== Phase.REVEAL) throw new Error('Not in reveal phase');
    const data = this.state.phaseData as RevealData;

    data.reinforcementPassCount++;

    // All players have passed
    const totalPlayers = this.state.turnOrder.length;
    if (data.reinforcementPassCount >= totalPlayers) {
      this.resolveEncounter();
    }
  }

  private handleSecondEncounterDecision(playerId: PlayerId, proceed: boolean): void {
    if (playerId !== this.state.activePlayerId) throw new Error('Not your turn');

    if (proceed) {
      // Clear zapped flags at end of encounter
      this.alienRegistry.clearZappedFlags(this.state);
      this.state.encounterNumber = 2;
      // Clear encounterState for the new encounter
      this.state.encounterState = null;
      this.advanceToPhase(Phase.REGROUP);
    } else {
      this.endTurn();
    }
  }

  private handleProposeDeal(playerId: PlayerId, deal: import('@cosmic/shared').DealProposal): void {
    const data = this.state.phaseData as ResolutionData;
    data.dealProposal = deal;
    this.addLog(`${this.state.players[playerId].name} proposes a deal`);
  }

  private handleAcceptDeal(playerId: PlayerId): void {
    const data = this.state.phaseData as ResolutionData;
    if (!data.dealProposal) throw new Error('No deal to accept');

    this.executeDeal(data.dealProposal);
    data.dealInProgress = false;
    this.addLog('Deal accepted!');
    this.handleSuccessfulEncounter();
  }

  private handleRejectDeal(_playerId: PlayerId): void {
    const data = this.state.phaseData as ResolutionData;
    data.dealProposal = null;
    this.addLog('Deal rejected, continue negotiating...');
  }

  // ---- Artifact and Flare handlers ----

  private handlePlayArtifact(playerId: PlayerId, cardId: CardId, target?: PlayerId | CardId): void {
    const result = this.artifactHandler.playArtifact(this.state, playerId, cardId, target);
    if (!result.success) throw new Error(result.error ?? 'Failed to play artifact');
    this.pendingEvents.push(...result.events);

    if (result.cancelEncounter) {
      // Ionic Gas — end the encounter without resolution
      this.state.encounterState = null;
      this.endTurn();
    }
  }

  private handlePlayFlare(playerId: PlayerId, cardId: CardId, mode: 'wild' | 'super'): void {
    const result = this.flareHandler.playFlare(this.state, playerId, cardId, mode);
    if (!result.success) throw new Error(result.error ?? 'Failed to play flare');
    this.pendingEvents.push(...result.events);
  }

  // ---- Helper methods ----

  private advanceToPhase(phase: Phase): void {
    this.state.phase = phase;

    switch (phase) {
      case Phase.START_TURN:
        // Clear encounterState when turn ends and a new turn begins
        this.state.encounterState = null;
        this.state.phaseData = { phase, mustDrawNewHand: false } as StartTurnData;
        this.checkStartTurnHand(this.state);
        break;
      case Phase.REGROUP:
        this.state.phaseData = { phase, retrievedShip: false } as RegroupData;
        break;
      case Phase.DESTINY: {
        this.state.phaseData = {
          phase,
          drawnCard: null,
          defensePlayerId: null,
          targetSystemColor: null,
          mustRedraw: false,
          canDriveOut: false,
          canRecolonizeEmpty: false,
          emptyHomePlanets: [],
        } as DestinyData;
        break;
      }
      case Phase.LAUNCH: {
        const prevData = this.state.phaseData as DestinyData;
        const defensePlayerId = prevData.defensePlayerId!;
        const targetSystemColor = prevData.targetSystemColor!;

        this.state.phaseData = {
          phase,
          defensePlayerId,
          targetSystemColor,
          targetPlanetId: null,
          shipsCommitted: [],
          totalShipsOnGate: 0,
        } as LaunchData;

        // Initialize encounterState when entering LAUNCH from DESTINY
        this.state.encounterState = {
          defensePlayerId,
          targetSystemColor,
          targetPlanetId: '',
          offenseShipCount: 0,
          offenseShipSources: [],
          offensiveAllies: {},
          defensiveAllies: {},
          offenseCardId: null,
          defenseCardId: null,
        };
        break;
      }
      case Phase.ALLIANCE: {
        const launchData = this.state.phaseData as LaunchData;
        this.state.phaseData = {
          phase,
          defensePlayerId: launchData.defensePlayerId,
          targetPlanetId: launchData.targetPlanetId!,
          offenseInvited: [],
          defenseInvited: [],
          responses: {},
          currentResponderId: null,
          offensiveAllies: {},
          defensiveAllies: {},
        } as AllianceData;

        // Initialize responses to null for all non-main players
        for (const pid of this.state.turnOrder) {
          if (pid !== this.state.activePlayerId && pid !== launchData.defensePlayerId) {
            (this.state.phaseData as AllianceData).responses[pid] = null;
          }
        }
        break;
      }
      case Phase.PLANNING: {
        const allianceData = this.state.phaseData as AllianceData;
        this.state.phaseData = {
          phase,
          defensePlayerId: allianceData.defensePlayerId,
          targetPlanetId: allianceData.targetPlanetId,
          offenseCardId: null,
          defenseCardId: null,
          offenseReady: false,
          defenseReady: false,
          defenseRedrew: false,
        } as PlanningData;

        // Check if defense needs new hand
        const defense = this.state.players[allianceData.defensePlayerId];
        const defHasEncounter = defense.hand.some((cid) => {
          const c = this.state.allCards[cid];
          return c && isEncounterCard(c);
        });
        if (!defHasEncounter) {
          // Discard remaining cards and draw new hand
          for (const cid of defense.hand) {
            this.state.cosmicDiscard.push(cid);
          }
          defense.hand = [];
          this.dealCards(this.state, defense.id, GAME_CONFIG.HAND_SIZE);
          (this.state.phaseData as PlanningData).defenseRedrew = true;
        }
        break;
      }
      case Phase.REVEAL: {
        const planningData = this.state.phaseData as PlanningData;
        const offCard = this.state.allCards[planningData.offenseCardId!];
        const defCard = this.state.allCards[planningData.defenseCardId!];

        // Count ships using encounterState
        const es = this.state.encounterState!;
        const offShips = es.offenseShipCount +
          Object.values(es.offensiveAllies).reduce((s, a) => s + a.shipCount, 0);

        const defPlanet = this.findPlanetById(planningData.targetPlanetId);
        const defOwnShips = defPlanet?.colonies.find(
          (c) => c.playerColor === this.state.players[planningData.defensePlayerId].color
        )?.shipCount ?? 0;
        const defAllyShips = Object.values(es.defensiveAllies).reduce(
          (s, a) => s + a.shipCount, 0
        );

        this.state.phaseData = {
          phase,
          defensePlayerId: planningData.defensePlayerId,
          targetPlanetId: planningData.targetPlanetId,
          offenseCard: offCard,
          defenseCard: defCard,
          reinforcements: [],
          awaitingReinforcements: true,
          reinforcementPassCount: 0,
          offenseTotal: 0,
          defenseTotal: 0,
          offenseShipCount: offShips,
          defenseShipCount: defOwnShips + defAllyShips,
        } as RevealData;

        this.recalculateRevealTotals();

        this.pendingEvents.push(
          { type: 'CARD_REVEALED', position: 'offense', card: offCard },
          { type: 'CARD_REVEALED', position: 'defense', card: defCard }
        );
        break;
      }
      case Phase.RESOLUTION:
        // Handled by resolveEncounter
        break;
    }

    this.pendingEvents.push({ type: 'PHASE_CHANGED', phase });

    // Dispatch alien hooks for phase start
    this.alienRegistry.dispatchPhaseStart(this.state, phase, this.pendingEvents);
  }

  private resolveEncounter(): void {
    const data = this.state.phaseData as RevealData;
    const offCard = data.offenseCard!;
    const defCard = data.defenseCard!;

    let result = resolveEncounter(offCard, defCard, data.offenseTotal, data.defenseTotal);

    // Let alien powers modify combat outcome
    result = this.alienRegistry.dispatchCombatResolved(this.state, result, this.pendingEvents);

    this.state.phase = Phase.RESOLUTION;

    const resData: ResolutionData = {
      phase: Phase.RESOLUTION,
      defensePlayerId: data.defensePlayerId,
      targetPlanetId: data.targetPlanetId,
      outcome: result,
      dealInProgress: false,
      dealProposal: null,
      dealTimerEnd: null,
      compensationCount: 0,
      compensationResolved: false,
      canHaveSecondEncounter: false,
      secondEncounterDecision: null,
    };

    // Discard encounter cards
    if (data.offenseCard) this.state.cosmicDiscard.push(data.offenseCard.id);
    if (data.defenseCard) this.state.cosmicDiscard.push(data.defenseCard.id);

    this.state.phaseData = resData;

    switch (result.type) {
      case 'OFFENSE_WINS':
        this.resolveOffenseWins(resData);
        break;
      case 'DEFENSE_WINS':
        this.resolveDefenseWins(resData);
        break;
      case 'ATTACK_VS_NEGOTIATE':
        if (result.winner === 'offense') {
          this.resolveOffenseWins(resData);
          resData.compensationCount = result.compensationShips;
          // Compensation: losing defender takes cards randomly from offense hand
          this.executeCompensation(resData.defensePlayerId, this.state.activePlayerId, result.compensationShips);
        } else {
          this.resolveDefenseWins(resData);
          resData.compensationCount = result.compensationShips;
          // Compensation: losing offense takes cards randomly from defense hand
          this.executeCompensation(this.state.activePlayerId, resData.defensePlayerId, result.compensationShips);
        }
        resData.compensationResolved = true;
        break;
      case 'DEAL_MAKING':
        resData.dealInProgress = true;
        resData.dealTimerEnd = Date.now() + GAME_CONFIG.NEGOTIATION_TIMER_SECONDS * 1000;
        this.addLog('Both players play Negotiate — a deal must be made!');
        break;
    }
  }

  private resolveOffenseWins(resData: ResolutionData): void {
    const offensePlayer = this.state.players[this.state.activePlayerId];
    const targetPlanet = this.findPlanetById(resData.targetPlanetId)!;
    const es = this.state.encounterState!;

    // Offense establishes colony
    const offColony = targetPlanet.colonies.find((c) => c.playerColor === offensePlayer.color);
    const gateShips = es.offenseShipCount;
    if (offColony) {
      offColony.shipCount += gateShips;
    } else {
      targetPlanet.colonies.push({ playerColor: offensePlayer.color, shipCount: gateShips });
    }

    // Offensive allies establish colonies
    for (const [allyId, allyData] of Object.entries(es.offensiveAllies)) {
      const allyPlayer = this.state.players[allyId];
      const allyColony = targetPlanet.colonies.find((c) => c.playerColor === allyPlayer.color);
      if (allyColony) {
        allyColony.shipCount += allyData.shipCount;
      } else {
        targetPlanet.colonies.push({ playerColor: allyPlayer.color, shipCount: allyData.shipCount });
      }
      this.recalculateColonies(allyId);
    }

    // Defense loses ships to warp (check alien powers first)
    const defPlayer = this.state.players[resData.defensePlayerId];
    const defColony = targetPlanet.colonies.find((c) => c.playerColor === defPlayer.color);
    if (defColony) {
      const defShipCount = defColony.shipCount;
      const canGoToWarp = this.alienRegistry.canShipsGoToWarp(
        this.state, defPlayer.color, defShipCount, this.pendingEvents
      );
      if (canGoToWarp) {
        this.state.warp[defPlayer.color] = (this.state.warp[defPlayer.color] ?? 0) + defShipCount;
        this.alienRegistry.dispatchShipsSentToWarp(this.state, defPlayer.color, defShipCount, this.pendingEvents);
      }
      targetPlanet.colonies = targetPlanet.colonies.filter((c) => c.playerColor !== defPlayer.color);
    }

    // Defensive allies lose ships to warp
    for (const [allyId, allyData] of Object.entries(es.defensiveAllies)) {
      const allyPlayer = this.state.players[allyId];
      const canGoToWarp = this.alienRegistry.canShipsGoToWarp(
        this.state, allyPlayer.color, allyData.shipCount, this.pendingEvents
      );
      if (canGoToWarp) {
        this.state.warp[allyPlayer.color] = (this.state.warp[allyPlayer.color] ?? 0) + allyData.shipCount;
        this.alienRegistry.dispatchShipsSentToWarp(this.state, allyPlayer.color, allyData.shipCount, this.pendingEvents);
      }
      this.recalculateColonies(allyId);
    }

    this.recalculateColonies(this.state.activePlayerId);
    this.recalculateColonies(resData.defensePlayerId);

    resData.canHaveSecondEncounter = this.state.encounterNumber === 1;
    this.addLog(`${offensePlayer.name} wins the encounter!`);
    this.checkWinCondition();
  }

  private resolveDefenseWins(resData: ResolutionData): void {
    const offensePlayer = this.state.players[this.state.activePlayerId];
    const es = this.state.encounterState!;

    // Offense ships go to warp (check alien powers first)
    const gateShips = es.offenseShipCount;
    const offCanGoToWarp = this.alienRegistry.canShipsGoToWarp(
      this.state, offensePlayer.color, gateShips, this.pendingEvents
    );
    if (offCanGoToWarp) {
      this.state.warp[offensePlayer.color] = (this.state.warp[offensePlayer.color] ?? 0) + gateShips;
      this.alienRegistry.dispatchShipsSentToWarp(this.state, offensePlayer.color, gateShips, this.pendingEvents);
    }

    // Offensive allies go to warp
    for (const [allyId, allyData] of Object.entries(es.offensiveAllies)) {
      const allyPlayer = this.state.players[allyId];
      const allyCanGoToWarp = this.alienRegistry.canShipsGoToWarp(
        this.state, allyPlayer.color, allyData.shipCount, this.pendingEvents
      );
      if (allyCanGoToWarp) {
        this.state.warp[allyPlayer.color] = (this.state.warp[allyPlayer.color] ?? 0) + allyData.shipCount;
        this.alienRegistry.dispatchShipsSentToWarp(this.state, allyPlayer.color, allyData.shipCount, this.pendingEvents);
      }
      this.recalculateColonies(allyId);
    }

    // Defensive allies return ships and get defender rewards
    for (const [allyId, allyData] of Object.entries(es.defensiveAllies)) {
      const allyPlayer = this.state.players[allyId];

      // Ships return to any colony
      const firstColony = this.getFirstColony(allyPlayer);
      if (firstColony) {
        firstColony.shipCount += allyData.shipCount;
      }
      this.recalculateColonies(allyId);

      // Defender reward: each defensive ally draws 1 card OR retrieves 1 ship from warp
      // If the ally has ships in warp, retrieve one; otherwise draw a card
      if ((this.state.warp[allyPlayer.color] ?? 0) > 0) {
        this.state.warp[allyPlayer.color]--;
        const rewardColony = this.getFirstColony(allyPlayer);
        if (rewardColony) {
          rewardColony.shipCount++;
        }
        this.addLog(`${allyPlayer.name} retrieves a ship from warp as defender reward`);
      } else {
        const drawnCardId = this.deckManager.drawFromCosmicDeck(this.state);
        if (drawnCardId) {
          allyPlayer.hand.push(drawnCardId);
          this.addLog(`${allyPlayer.name} draws a card as defender reward`);
        }
      }
    }

    this.recalculateColonies(this.state.activePlayerId);
    resData.canHaveSecondEncounter = false;
    this.addLog(`${this.state.players[resData.defensePlayerId].name} wins the defense!`);
  }

  /**
   * Compensation: when negotiate loses to attack, the losing player takes
   * a number of cards randomly from the winning player's hand.
   */
  private executeCompensation(losingPlayerId: PlayerId, winningPlayerId: PlayerId, count: number): void {
    const loser = this.state.players[losingPlayerId];
    const winner = this.state.players[winningPlayerId];

    if (winner.hand.length === 0 || count <= 0) return;

    const actualCount = Math.min(count, winner.hand.length);

    // Randomly pick cards from winner's hand
    const winnerHandCopy = [...winner.hand];
    for (let i = winnerHandCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [winnerHandCopy[i], winnerHandCopy[j]] = [winnerHandCopy[j], winnerHandCopy[i]];
    }

    const takenCardIds = winnerHandCopy.slice(0, actualCount);
    for (const cardId of takenCardIds) {
      winner.hand = winner.hand.filter((id) => id !== cardId);
      loser.hand.push(cardId);
    }

    this.addLog(
      `${loser.name} takes ${actualCount} card(s) as compensation from ${winner.name}`
    );
  }

  private executeDeal(deal: import('@cosmic/shared').DealProposal): void {
    const offense = this.state.players[this.state.activePlayerId];
    const defense = this.state.players[(this.state.phaseData as ResolutionData).defensePlayerId];

    // Move cards from offense to defense
    for (const cardId of deal.offenseGivesCards) {
      offense.hand = offense.hand.filter((id) => id !== cardId);
      defense.hand.push(cardId);
    }

    // Move cards from defense to offense
    for (const cardId of deal.defenseGivesCards) {
      defense.hand = defense.hand.filter((id) => id !== cardId);
      offense.hand.push(cardId);
    }

    // Handle colony grants
    if (deal.offenseGivesColony) {
      // Defense gets a colony on the specified planet in offense's system
      const planet = this.findPlanetById(deal.offenseGivesColony);
      if (planet && planet.ownerColor === offense.color) {
        // Place 1 ship for the defense player on that planet
        const existingColony = planet.colonies.find((c) => c.playerColor === defense.color);
        if (existingColony) {
          existingColony.shipCount++;
        } else {
          planet.colonies.push({ playerColor: defense.color, shipCount: 1 });
        }
        // Remove one ship from defense warp or first available colony as the "placed" ship
        const warpCount = this.state.warp[defense.color] ?? 0;
        if (warpCount > 0) {
          this.state.warp[defense.color]--;
        } else {
          const srcColony = this.getFirstColony(defense);
          if (srcColony && srcColony.shipCount > 1) {
            srcColony.shipCount--;
          }
        }
        this.recalculateColonies(defense.id);
        this.addLog(`${defense.name} gets a colony on ${deal.offenseGivesColony} as part of the deal`);
      }
    }

    if (deal.defenseGivesColony) {
      // Offense gets a colony on the specified planet in defense's system
      const planet = this.findPlanetById(deal.defenseGivesColony);
      if (planet && planet.ownerColor === defense.color) {
        const existingColony = planet.colonies.find((c) => c.playerColor === offense.color);
        if (existingColony) {
          existingColony.shipCount++;
        } else {
          planet.colonies.push({ playerColor: offense.color, shipCount: 1 });
        }
        // Remove one ship from offense warp or first available colony as the "placed" ship
        const warpCount = this.state.warp[offense.color] ?? 0;
        if (warpCount > 0) {
          this.state.warp[offense.color]--;
        } else {
          const srcColony = this.getFirstColony(offense);
          if (srcColony && srcColony.shipCount > 1) {
            srcColony.shipCount--;
          }
        }
        this.recalculateColonies(offense.id);
        this.addLog(`${offense.name} gets a colony on ${deal.defenseGivesColony} as part of the deal`);
      }
    }

    this.recalculateColonies(offense.id);
    this.recalculateColonies(defense.id);
  }

  private handleSuccessfulEncounter(): void {
    if (this.state.encounterNumber === 1) {
      // Offense can have a second encounter
      const resData = this.state.phaseData as ResolutionData;
      if (resData) {
        resData.canHaveSecondEncounter = true;
      }
    } else {
      this.endTurn();
    }
    this.checkWinCondition();
  }

  private endTurn(): void {
    // Clear zapped flags and flare-played flags at end of encounter
    this.alienRegistry.clearZappedFlags(this.state);
    for (const player of Object.values(this.state.players)) {
      delete player.alienData._flarePlayedThisEncounter;
      delete player.alienData._emotionControlled;
      delete player.alienData._citadelUsedThisTurn;
      delete player.alienData._cudgelUsedThisTurn;
    }

    const currentIndex = this.state.turnOrder.indexOf(this.state.activePlayerId);
    const nextIndex = (currentIndex + 1) % this.state.turnOrder.length;
    this.state.activePlayerId = this.state.turnOrder[nextIndex];
    this.state.encounterNumber = 1;
    // encounterState is cleared in advanceToPhase(START_TURN)

    this.pendingEvents.push({
      type: 'TURN_ENDED',
      nextPlayerId: this.state.activePlayerId,
    });

    this.advanceToPhase(Phase.START_TURN);
    this.addLog(`It is now ${this.state.players[this.state.activePlayerId].name}'s turn`);
  }

  private recalculateRevealTotals(): void {
    const data = this.state.phaseData as RevealData;
    if (!data.offenseCard || !data.defenseCard) return;

    let offBase = 0;
    let defBase = 0;

    if (data.offenseCard.type === CardType.ATTACK) offBase = data.offenseCard.value;
    if (data.defenseCard.type === CardType.ATTACK) defBase = data.defenseCard.value;

    // Handle morph
    if (data.offenseCard.type === CardType.MORPH) {
      if (data.defenseCard.type === CardType.ATTACK) offBase = data.defenseCard.value;
    }
    if (data.defenseCard.type === CardType.MORPH) {
      if (data.offenseCard.type === CardType.ATTACK) defBase = data.offenseCard.value;
    }

    const offReinforcements = data.reinforcements
      .filter((r) => r.side === 'offense')
      .reduce((sum, r) => sum + r.value, 0);
    const defReinforcements = data.reinforcements
      .filter((r) => r.side === 'defense')
      .reduce((sum, r) => sum + r.value, 0);

    let offTotal = offBase + data.offenseShipCount + offReinforcements;
    let defTotal = defBase + data.defenseShipCount + defReinforcements;

    // Let alien powers modify attack totals
    offTotal = this.alienRegistry.dispatchModifyAttackTotal(
      this.state, 'offense', offTotal, data.offenseShipCount, offBase, this.pendingEvents
    );
    defTotal = this.alienRegistry.dispatchModifyAttackTotal(
      this.state, 'defense', defTotal, data.defenseShipCount, defBase, this.pendingEvents
    );

    data.offenseTotal = offTotal;
    data.defenseTotal = defTotal;
  }

  private checkWinCondition(): void {
    const winners: PlayerId[] = [];
    for (const player of Object.values(this.state.players)) {
      if (player.foreignColonies >= GAME_CONFIG.FOREIGN_COLONIES_TO_WIN) {
        winners.push(player.id);
      }
    }
    if (winners.length > 0) {
      this.state.winners = winners;
      this.pendingEvents.push({
        type: 'GAME_OVER',
        winners,
      });
    }
  }

  private recalculateColonies(playerId: PlayerId): void {
    const player = this.state.players[playerId];
    let foreign = 0;
    let home = 0;

    // Count colonies across all planets in the game
    for (const otherPlayer of Object.values(this.state.players)) {
      for (const planet of otherPlayer.planets) {
        const colony = planet.colonies.find((c) => c.playerColor === player.color);
        if (colony && colony.shipCount > 0) {
          if (planet.ownerColor === player.color) {
            home++;
          } else {
            foreign++;
          }
        }
      }
    }

    player.foreignColonies = foreign;
    player.homeColonies = home;

    // Check alien power loss
    player.alienActive = home >= GAME_CONFIG.HOME_COLONIES_FOR_POWER;
  }

  // ---- Utility ----

  private findPlanet(player: PlayerState, planetId: string): PlanetState | null {
    // Search player's own planets first
    const own = player.planets.find((p) => p.id === planetId);
    if (own) return own;
    // Search all players' planets
    for (const p of Object.values(this.state.players)) {
      const found = p.planets.find((pl) => pl.id === planetId);
      if (found) return found;
    }
    return null;
  }

  private findPlanetById(planetId: string): PlanetState | null {
    for (const player of Object.values(this.state.players)) {
      const found = player.planets.find((p) => p.id === planetId);
      if (found) return found;
    }
    return null;
  }

  private getPlayerByColor(color: PlayerColor): PlayerState | null {
    for (const player of Object.values(this.state.players)) {
      if (player.color === color) return player;
    }
    return null;
  }

  private hasForeignColoniesInHomeSystem(playerId: PlayerId): boolean {
    const player = this.state.players[playerId];
    for (const planet of player.planets) {
      if (planet.colonies.some((c) => c.playerColor !== player.color)) {
        return true;
      }
    }
    return false;
  }

  private getEmptyHomePlanets(playerId: PlayerId): string[] {
    const player = this.state.players[playerId];
    return player.planets
      .filter((p) => p.colonies.length === 0)
      .map((p) => p.id);
  }

  private getFirstColony(player: PlayerState): ColonyState | null {
    for (const planet of player.planets) {
      const colony = planet.colonies.find((c) => c.playerColor === player.color);
      if (colony) return colony;
    }
    // Check foreign colonies
    for (const otherPlayer of Object.values(this.state.players)) {
      for (const planet of otherPlayer.planets) {
        const colony = planet.colonies.find((c) => c.playerColor === player.color);
        if (colony) return colony;
      }
    }
    return null;
  }

  private determineNextAllianceResponder(): void {
    const data = this.state.phaseData as AllianceData;
    const { turnOrder } = this.state;
    const offenseIndex = turnOrder.indexOf(this.state.activePlayerId);

    for (let i = 1; i < turnOrder.length; i++) {
      const idx = (offenseIndex + i) % turnOrder.length;
      const pid = turnOrder[idx];
      if (pid === this.state.activePlayerId || pid === data.defensePlayerId) continue;
      if (data.responses[pid] === null || data.responses[pid] === undefined) {
        // Check if this player was invited by either side
        const invitedByOffense = data.offenseInvited.includes(pid);
        const invitedByDefense = data.defenseInvited.includes(pid);
        if (!invitedByOffense && !invitedByDefense) {
          data.responses[pid] = 'decline';
          continue;
        }
        data.currentResponderId = pid;
        return;
      }
    }
    data.currentResponderId = null;
  }

  private addLog(message: string): void {
    const entry: GameLogEntry = {
      timestamp: Date.now(),
      message,
      phase: this.state.phase,
    };
    this.state.gameLog.push(entry);
    this.pendingEvents.push({ type: 'GAME_LOG', entry });
  }

  // ---- Public API ----

  getClientState(playerId: PlayerId): ClientGameState {
    const player = this.state.players[playerId];

    const clientPlayers: Record<PlayerId, ClientPlayerState> = {};
    for (const [pid, ps] of Object.entries(this.state.players)) {
      clientPlayers[pid] = {
        id: ps.id,
        name: ps.name,
        color: ps.color,
        alienId: ps.alienId,
        alienActive: ps.alienActive,
        handSize: ps.hand.length,
        planets: ps.planets,
        foreignColonies: ps.foreignColonies,
        homeColonies: ps.homeColonies,
        connected: ps.connected,
      };
    }

    // Resolve player's hand cards
    const yourHand: CosmicCard[] = player.hand
      .map((cardId) => this.state.allCards[cardId])
      .filter(Boolean);

    // Redact planning data
    let phaseData = { ...this.state.phaseData };
    if (this.state.phase === Phase.PLANNING) {
      const pd = phaseData as PlanningData;
      // Hide the card selections from opponents
      if (playerId !== this.state.activePlayerId) {
        pd.offenseCardId = pd.offenseReady ? ('hidden' as CardId) : null;
      }
      if (playerId !== pd.defensePlayerId) {
        pd.defenseCardId = pd.defenseReady ? ('hidden' as CardId) : null;
      }
    }

    return {
      roomId: this.state.roomId,
      players: clientPlayers,
      turnOrder: this.state.turnOrder,
      activePlayerId: this.state.activePlayerId,
      encounterNumber: this.state.encounterNumber,
      phase: this.state.phase,
      phaseData,
      encounterState: this.state.encounterState,
      cosmicDeckSize: this.state.cosmicDeck.length,
      cosmicDiscardSize: this.state.cosmicDiscard.length,
      destinyDeckSize: this.state.destinyDeck.length,
      warp: this.state.warp,
      winners: this.state.winners,
      gameLog: this.state.gameLog,
      yourPlayerId: playerId,
      yourHand,
    };
  }

  getPlayerIds(): PlayerId[] {
    return this.state.turnOrder;
  }
}
