import type { PlayerId, PlayerColor, Phase, CardId, RoomId } from './phases.js';
import type { CosmicCard, DestinyCard } from './cards.js';
import type { AlienId } from './aliens.js';
import type { PlanetState, ShipSource, ColonyState } from './planets.js';

// ---- Phase-specific data ----

export interface StartTurnData {
  phase: Phase.START_TURN;
  mustDrawNewHand: boolean;
}

export interface RegroupData {
  phase: Phase.REGROUP;
  retrievedShip: boolean;
}

export interface DestinyData {
  phase: Phase.DESTINY;
  drawnCard: DestinyCard | null;
  defensePlayerId: PlayerId | null;
  targetSystemColor: PlayerColor | null;
  mustRedraw: boolean;
  canDriveOut: boolean;
  canRecolonizeEmpty: boolean;
  emptyHomePlanets: string[];
}

export interface LaunchData {
  phase: Phase.LAUNCH;
  defensePlayerId: PlayerId;
  targetSystemColor: PlayerColor;
  targetPlanetId: string | null;
  shipsCommitted: ShipSource[];
  totalShipsOnGate: number;
}

export interface AllianceData {
  phase: Phase.ALLIANCE;
  defensePlayerId: PlayerId;
  targetPlanetId: string;
  offenseInvited: PlayerId[];
  defenseInvited: PlayerId[];
  responses: Record<PlayerId, 'offense' | 'defense' | 'decline' | null>;
  currentResponderId: PlayerId | null;
  offensiveAllies: Record<PlayerId, { shipCount: number; sources: ShipSource[] }>;
  defensiveAllies: Record<PlayerId, { shipCount: number; sources: ShipSource[] }>;
}

export interface PlanningData {
  phase: Phase.PLANNING;
  defensePlayerId: PlayerId;
  targetPlanetId: string;
  offenseCardId: CardId | null;
  defenseCardId: CardId | null;
  offenseReady: boolean;
  defenseReady: boolean;
  defenseRedrew: boolean;
}

export interface RevealData {
  phase: Phase.REVEAL;
  defensePlayerId: PlayerId;
  targetPlanetId: string;
  offenseCard: CosmicCard | null;
  defenseCard: CosmicCard | null;
  reinforcements: Array<{ playerId: PlayerId; cardId: CardId; value: number; side: 'offense' | 'defense' }>;
  awaitingReinforcements: boolean;
  reinforcementPassCount: number;
  offenseTotal: number;
  defenseTotal: number;
  offenseShipCount: number;
  defenseShipCount: number;
}

export interface ResolutionData {
  phase: Phase.RESOLUTION;
  defensePlayerId: PlayerId;
  targetPlanetId: string;
  outcome: EncounterOutcome;
  // For negotiate vs negotiate
  dealInProgress: boolean;
  dealProposal: DealProposal | null;
  dealTimerEnd: number | null;
  // For compensation
  compensationCount: number;
  compensationResolved: boolean;
  // Second encounter
  canHaveSecondEncounter: boolean;
  secondEncounterDecision: boolean | null;
}

export type PhaseData =
  | StartTurnData
  | RegroupData
  | DestinyData
  | LaunchData
  | AllianceData
  | PlanningData
  | RevealData
  | ResolutionData;

// ---- Encounter-scoped persistent data (survives phase transitions) ----

export interface EncounterState {
  defensePlayerId: PlayerId;
  targetSystemColor: PlayerColor;
  targetPlanetId: string;
  // Launch info
  offenseShipCount: number;
  offenseShipSources: ShipSource[];
  // Alliance info
  offensiveAllies: Record<PlayerId, { shipCount: number; sources: ShipSource[] }>;
  defensiveAllies: Record<PlayerId, { shipCount: number; sources: ShipSource[] }>;
  // Cards played
  offenseCardId: CardId | null;
  defenseCardId: CardId | null;
}

// ---- Encounter outcomes ----

export type EncounterOutcome =
  | { type: 'OFFENSE_WINS' }
  | { type: 'DEFENSE_WINS' }
  | { type: 'ATTACK_VS_NEGOTIATE'; winner: 'offense' | 'defense'; compensationShips: number }
  | { type: 'DEAL_MAKING' }
  | { type: 'DEAL_SUCCESS'; deal: DealProposal }
  | { type: 'DEAL_FAILED' };

export interface DealProposal {
  offenseGivesCards: CardId[];
  offenseGivesColony: string | null; // Planet ID for colony
  defenseGivesCards: CardId[];
  defenseGivesColony: string | null;
}

// ---- Player state ----

export interface PlayerState {
  id: PlayerId;
  name: string;
  color: PlayerColor;
  alienId: AlienId | null;
  alienActive: boolean;
  hand: CardId[];
  planets: PlanetState[];
  foreignColonies: number;
  homeColonies: number;
  alienData: Record<string, unknown>;
  connected: boolean;
  sessionToken: string;
}

// ---- Full game state (server-side) ----

export interface GameState {
  roomId: RoomId;
  players: Record<PlayerId, PlayerState>;
  turnOrder: PlayerId[];
  activePlayerId: PlayerId;
  encounterNumber: 1 | 2;
  phase: Phase;
  phaseData: PhaseData;
  encounterState: EncounterState | null;
  cosmicDeck: CardId[];
  cosmicDiscard: CardId[];
  destinyDeck: CardId[];
  destinyDiscard: CardId[];
  warp: Record<PlayerColor, number>;
  allCards: Record<CardId, CosmicCard>;
  allDestinyCards: Record<CardId, DestinyCard>;
  winners: PlayerId[] | null;
  gameLog: GameLogEntry[];
}

export interface GameLogEntry {
  timestamp: number;
  message: string;
  playerId?: PlayerId;
  phase?: Phase;
}

// ---- Client-visible state (redacted) ----

export interface ClientGameState {
  roomId: RoomId;
  players: Record<PlayerId, ClientPlayerState>;
  turnOrder: PlayerId[];
  activePlayerId: PlayerId;
  encounterNumber: 1 | 2;
  phase: Phase;
  phaseData: PhaseData;
  encounterState: EncounterState | null;
  cosmicDeckSize: number;
  cosmicDiscardSize: number;
  destinyDeckSize: number;
  warp: Record<PlayerColor, number>;
  winners: PlayerId[] | null;
  gameLog: GameLogEntry[];
  // This player's private info
  yourPlayerId: PlayerId;
  yourHand: CosmicCard[];
}

export interface ClientPlayerState {
  id: PlayerId;
  name: string;
  color: PlayerColor;
  alienId: AlienId | null;
  alienActive: boolean;
  handSize: number;
  planets: PlanetState[];
  foreignColonies: number;
  homeColonies: number;
  connected: boolean;
}
