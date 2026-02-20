import type { CardId, Phase } from './phases.js';
import type { AlienId } from './aliens.js';

export enum CardType {
  ATTACK = 'ATTACK',
  NEGOTIATE = 'NEGOTIATE',
  MORPH = 'MORPH',
  REINFORCEMENT = 'REINFORCEMENT',
  ARTIFACT = 'ARTIFACT',
  FLARE = 'FLARE',
}

export enum ArtifactType {
  COSMIC_ZAP = 'COSMIC_ZAP',
  CARD_ZAP = 'CARD_ZAP',
  MOBIUS_TUBES = 'MOBIUS_TUBES',
  PLAGUE = 'PLAGUE',
  FORCE_FIELD = 'FORCE_FIELD',
  EMOTION_CONTROL = 'EMOTION_CONTROL',
  IONIC_GAS = 'IONIC_GAS',
  QUASH = 'QUASH',
}

export enum PlayerPrerequisite {
  OFFENSE = 'OFFENSE',
  DEFENSE = 'DEFENSE',
  MAIN_PLAYER = 'MAIN_PLAYER',
  ALLY = 'ALLY',
  OFFENSIVE_ALLY = 'OFFENSIVE_ALLY',
  DEFENSIVE_ALLY = 'DEFENSIVE_ALLY',
  ANY_PLAYER = 'ANY_PLAYER',
  NOT_MAIN_PLAYER = 'NOT_MAIN_PLAYER',
  DEFENSE_ONLY = 'DEFENSE_ONLY',
}

export interface AttackCard {
  id: CardId;
  type: CardType.ATTACK;
  value: number; // 0-40
}

export interface NegotiateCard {
  id: CardId;
  type: CardType.NEGOTIATE;
}

export interface MorphCard {
  id: CardId;
  type: CardType.MORPH;
}

export interface ReinforcementCard {
  id: CardId;
  type: CardType.REINFORCEMENT;
  value: number; // 2-5
}

export interface ArtifactCard {
  id: CardId;
  type: CardType.ARTIFACT;
  artifactType: ArtifactType;
  validPhases: Phase[];
  playerPrereq: PlayerPrerequisite;
  description: string;
}

export interface FlareCard {
  id: CardId;
  type: CardType.FLARE;
  alienId: AlienId;
  wildText: string;
  superText: string;
}

export type CosmicCard =
  | AttackCard
  | NegotiateCard
  | MorphCard
  | ReinforcementCard
  | ArtifactCard
  | FlareCard;

export type EncounterCard = AttackCard | NegotiateCard | MorphCard;

export function isEncounterCard(card: CosmicCard): card is EncounterCard {
  return (
    card.type === CardType.ATTACK ||
    card.type === CardType.NEGOTIATE ||
    card.type === CardType.MORPH
  );
}

// Destiny cards
export enum DestinyCardType {
  COLOR = 'COLOR',
  WILD = 'WILD',
  SPECIAL = 'SPECIAL',
}

export interface ColorDestinyCard {
  id: CardId;
  destinyType: DestinyCardType.COLOR;
  color: import('./phases.js').PlayerColor;
  hazardWarning: boolean;
}

export interface WildDestinyCard {
  id: CardId;
  destinyType: DestinyCardType.WILD;
}

export interface SpecialDestinyCard {
  id: CardId;
  destinyType: DestinyCardType.SPECIAL;
  description: string;
}

export type DestinyCard = ColorDestinyCard | WildDestinyCard | SpecialDestinyCard;
