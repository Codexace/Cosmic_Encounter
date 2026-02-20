import type { PlayerId, CardId } from './phases.js';
import type { ShipSource } from './planets.js';
import type { DealProposal } from './game-state.js';
import type { AlienId } from './aliens.js';
import type { CardType } from './cards.js';

export type PlayerAction =
  // Regroup
  | { type: 'REGROUP_RETRIEVE'; destination: string }
  // Destiny
  | { type: 'DESTINY_DRAW' }
  | { type: 'DESTINY_REDRAW' }
  | { type: 'DESTINY_CHOOSE_WILD'; targetPlayerId: PlayerId }
  | { type: 'DESTINY_DRIVE_OUT'; targetPlayerId: PlayerId; targetPlanetId: string }
  | { type: 'DESTINY_RECOLONIZE_EMPTY'; targetPlanetId: string; shipSources: ShipSource[] }
  // Launch
  | { type: 'LAUNCH_AIM'; targetPlanetId: string }
  | { type: 'LAUNCH_COMMIT'; ships: ShipSource[] }
  // Alliance
  | { type: 'ALLIANCE_INVITE_OFFENSE'; invitedPlayerIds: PlayerId[] }
  | { type: 'ALLIANCE_INVITE_DEFENSE'; invitedPlayerIds: PlayerId[] }
  | { type: 'ALLIANCE_RESPOND'; response: 'offense' | 'defense' | 'decline'; shipCount?: number; shipSources?: ShipSource[] }
  // Planning
  | { type: 'PLANNING_SELECT_CARD'; cardId: CardId }
  // Reveal / Reinforcements
  | { type: 'REVEAL_PLAY_REINFORCEMENT'; cardId: CardId; side: 'offense' | 'defense' }
  | { type: 'REVEAL_PASS_REINFORCEMENT' }
  // Resolution / Negotiation
  | { type: 'NEGOTIATE_PROPOSE_DEAL'; deal: DealProposal }
  | { type: 'NEGOTIATE_ACCEPT_DEAL' }
  | { type: 'NEGOTIATE_REJECT_DEAL' }
  | { type: 'SECOND_ENCOUNTER_DECISION'; proceed: boolean }
  // Artifacts and Flares
  | { type: 'PLAY_ARTIFACT'; cardId: CardId; target?: PlayerId | CardId }
  | { type: 'PLAY_FLARE'; cardId: CardId; mode: 'wild' | 'super'; targets?: Record<string, unknown> }
  // Alien powers
  | { type: 'ALIEN_POWER_USE'; alienId: AlienId; params?: Record<string, unknown> }
  | { type: 'ALIEN_POWER_DECLINE' }
  // Compensation
  | { type: 'COMPENSATION_COLLECTED' }
  // Defender rewards
  | { type: 'DEFENDER_REWARD_CHOICE'; drawCards: number; retrieveShips: number; shipDestinations?: string[] }
  // Plague target
  | { type: 'PLAGUE_TARGET'; targetPlayerId: PlayerId; cardType: CardType };
