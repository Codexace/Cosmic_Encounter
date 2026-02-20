import type { PlayerId, PlayerColor, Phase, CardId } from './phases.js';
import type { CosmicCard, DestinyCard, ArtifactCard, FlareCard } from './cards.js';
import type { AlienId } from './aliens.js';
import type { ClientGameState, DealProposal, GameLogEntry } from './game-state.js';

export type ServerEvent =
  | { type: 'GAME_STATE_UPDATE'; state: ClientGameState }
  | { type: 'PHASE_CHANGED'; phase: Phase }
  | { type: 'DESTINY_REVEALED'; card: DestinyCard }
  | { type: 'CARDS_DRAWN'; playerId: PlayerId; count: number }
  | { type: 'CARD_REVEALED'; position: 'offense' | 'defense'; card: CosmicCard }
  | { type: 'ALLIANCE_INVITATION'; from: 'offense' | 'defense'; invitedIds: PlayerId[] }
  | { type: 'ALLIANCE_RESPONSE'; playerId: PlayerId; response: 'offense' | 'defense' | 'decline'; shipCount: number }
  | { type: 'SHIPS_TO_WARP'; color: PlayerColor; count: number }
  | { type: 'SHIPS_RETRIEVED'; playerId: PlayerId; count: number; destination: string }
  | { type: 'COLONY_ESTABLISHED'; playerId: PlayerId; planetId: string; shipCount: number }
  | { type: 'COLONY_LOST'; playerId: PlayerId; planetId: string }
  | { type: 'ALIEN_POWER_USED'; playerId: PlayerId; alienId: AlienId; description: string }
  | { type: 'ALIEN_POWER_ZAPPED'; playerId: PlayerId; alienId: AlienId }
  | { type: 'ARTIFACT_PLAYED'; playerId: PlayerId; artifact: ArtifactCard }
  | { type: 'FLARE_PLAYED'; playerId: PlayerId; flare: FlareCard; mode: 'wild' | 'super' }
  | { type: 'REINFORCEMENT_PLAYED'; playerId: PlayerId; value: number; side: 'offense' | 'defense' }
  | { type: 'DEAL_PROPOSED'; proposal: DealProposal }
  | { type: 'DEAL_RESULT'; success: boolean }
  | { type: 'COMPENSATION_PAID'; fromPlayerId: PlayerId; toPlayerId: PlayerId; count: number }
  | { type: 'DEFENDER_REWARDS'; playerId: PlayerId; cardsDrawn: number; shipsRetrieved: number }
  | { type: 'TIMER_UPDATE'; secondsRemaining: number }
  | { type: 'TURN_ENDED'; nextPlayerId: PlayerId }
  | { type: 'GAME_OVER'; winners: PlayerId[] }
  | { type: 'GAME_LOG'; entry: GameLogEntry }
  | { type: 'ERROR'; message: string; code: string };
