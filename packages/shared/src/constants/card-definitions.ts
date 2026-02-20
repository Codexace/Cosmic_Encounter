import {
  CardType,
  ArtifactType,
  type ArtifactCard,
  PlayerPrerequisite,
} from '../types/cards.js';
import { Phase } from '../types/phases.js';

// ---------------------------------------------------------------------------
// Attack card distribution
// ---------------------------------------------------------------------------

/**
 * Each entry describes how many copies of a given attack value are included
 * in the standard base-game cosmic deck (40 attack cards total).
 *
 * Distribution breakdown:
 *   00 ×1, 01 ×1, 02 ×1, 03 ×1, 04 ×2, 05 ×1, 06 ×2, 07 ×1,
 *   08 ×2, 09 ×1, 10 ×2, 11 ×1, 12 ×2, 13 ×1, 14 ×2, 15 ×1,
 *   20 ×2, 23 ×2, 30 ×1, 40 ×1
 *   ─────────────────────────────────────────────
 *   Total: 1+1+1+1+2+1+2+1+2+1+2+1+2+1+2+1+2+2+1+1 = 29 unique specs → 40 cards
 */
export const ATTACK_CARD_DISTRIBUTION: ReadonlyArray<{
  value: number;
  count: number;
}> = [
  { value: 0, count: 1 },
  { value: 1, count: 1 },
  { value: 2, count: 1 },
  { value: 3, count: 1 },
  { value: 4, count: 2 },
  { value: 5, count: 1 },
  { value: 6, count: 2 },
  { value: 7, count: 1 },
  { value: 8, count: 2 },
  { value: 9, count: 1 },
  { value: 10, count: 2 },
  { value: 11, count: 1 },
  { value: 12, count: 2 },
  { value: 13, count: 1 },
  { value: 14, count: 2 },
  { value: 15, count: 1 },
  { value: 20, count: 2 },
  { value: 23, count: 2 },
  { value: 30, count: 1 },
  { value: 40, count: 1 },
] as const;

// Sanity check (compile-time readable comment):
// Sum of counts: 1+1+1+1+2+1+2+1+2+1+2+1+2+1+2+1+2+2+1+1 = 29 rows, 40 cards total.

// ---------------------------------------------------------------------------
// Reinforcement definitions
// ---------------------------------------------------------------------------

export interface ReinforcementDefinition {
  /** Bonus value granted to the side playing this card. */
  value: number;
  /** Number of copies included in the deck. */
  count: number;
}

export const REINFORCEMENT_DISTRIBUTION: ReadonlyArray<ReinforcementDefinition> =
  [
    { value: 2, count: 2 },
    { value: 3, count: 2 },
    { value: 5, count: 3 },
  ] as const;

// ---------------------------------------------------------------------------
// Artifact definitions
// ---------------------------------------------------------------------------

/**
 * Describes the composition of a single artifact type (without card IDs, which
 * are assigned during deck construction).
 */
export interface ArtifactDefinition {
  artifactType: ArtifactType;
  count: number;
  validPhases: Phase[];
  playerPrereq: PlayerPrerequisite;
  description: string;
}

export const ARTIFACT_DEFINITIONS: ReadonlyArray<ArtifactDefinition> = [
  {
    artifactType: ArtifactType.COSMIC_ZAP,
    count: 2,
    validPhases: [Phase.PLANNING, Phase.REVEAL, Phase.RESOLUTION],
    playerPrereq: PlayerPrerequisite.ANY_PLAYER,
    description:
      'Zap an alien power. The targeted alien may not use their power this encounter.',
  },
  {
    artifactType: ArtifactType.CARD_ZAP,
    count: 1,
    validPhases: [Phase.PLANNING, Phase.REVEAL, Phase.RESOLUTION],
    playerPrereq: PlayerPrerequisite.ANY_PLAYER,
    description:
      'Zap any one card played by any player, negating its effect entirely.',
  },
  {
    artifactType: ArtifactType.MOBIUS_TUBES,
    count: 2,
    validPhases: [Phase.RESOLUTION],
    playerPrereq: PlayerPrerequisite.ANY_PLAYER,
    description:
      'All ships involved in the encounter on both sides go to their owners\' home systems instead of the warp.',
  },
  {
    artifactType: ArtifactType.PLAGUE,
    count: 1,
    validPhases: [Phase.ALLIANCE],
    playerPrereq: PlayerPrerequisite.MAIN_PLAYER,
    description:
      'Force any one player to send three ships of your choice to the warp.',
  },
  {
    artifactType: ArtifactType.FORCE_FIELD,
    count: 1,
    validPhases: [Phase.ALLIANCE],
    playerPrereq: PlayerPrerequisite.MAIN_PLAYER,
    description:
      'Cancel all alliances. No ships may be sent as allies this encounter.',
  },
  {
    artifactType: ArtifactType.EMOTION_CONTROL,
    count: 1,
    validPhases: [Phase.PLANNING],
    playerPrereq: PlayerPrerequisite.ANY_PLAYER,
    description:
      'Force the offense and defense to each play a Negotiate card this encounter.',
  },
  {
    artifactType: ArtifactType.IONIC_GAS,
    count: 1,
    validPhases: [Phase.PLANNING, Phase.REVEAL],
    playerPrereq: PlayerPrerequisite.ANY_PLAYER,
    description:
      'All players discard their hands and draw new cards equal to their original hand size.',
  },
] as const;

// ---------------------------------------------------------------------------
// Cosmic deck composition summary
// ---------------------------------------------------------------------------

export interface CosmicDeckComposition {
  /** Distribution of attack card values and their copy counts (total 40). */
  attackCards: ReadonlyArray<{ value: number; count: number }>;
  /** Total number of Negotiate cards in the deck. */
  negotiateCount: number;
  /** Total number of Morph cards in the deck. */
  morphCount: number;
  /** Reinforcement card distribution. */
  reinforcements: ReadonlyArray<ReinforcementDefinition>;
  /** Artifact card definitions (flares are added separately during setup). */
  artifacts: ReadonlyArray<ArtifactDefinition>;
}

/**
 * Complete composition of the base-game cosmic deck, excluding flare cards.
 * Flares are shuffled in during setup based on the aliens chosen for the game.
 *
 * Total card counts:
 *   Attack        40
 *   Negotiate     15
 *   Morph          1
 *   Reinforcement  7  (+2 ×2, +3 ×2, +5 ×3)
 *   Artifact       9  (Cosmic Zap ×2, Card Zap ×1, Mobius Tubes ×2,
 *                       Plague ×1, Force Field ×1, Emotion Control ×1,
 *                       Ionic Gas ×1)
 *   ───────────────
 *   Base total    72  (+ flares added at setup)
 */
export const COSMIC_DECK_COMPOSITION: CosmicDeckComposition = {
  attackCards: ATTACK_CARD_DISTRIBUTION,
  negotiateCount: 15,
  morphCount: 1,
  reinforcements: REINFORCEMENT_DISTRIBUTION,
  artifacts: ARTIFACT_DEFINITIONS,
} as const;

// ---------------------------------------------------------------------------
// Destiny deck composition
// ---------------------------------------------------------------------------

/**
 * Per-player-count specification for the destiny deck.
 * The destiny deck contains:
 *   - One or two color cards per active player color
 *   - Wild destiny cards (always 2 in the base game)
 *   - Special destiny cards (1 in 3-player, 2 in 4- and 5-player games)
 */
export interface DestinyDeckSpec {
  /** Number of color cards included per active player color. */
  colorCardsPerColor: number;
  /** Total number of Wild Destiny cards. */
  wildCount: number;
  /** Total number of Special Destiny cards. */
  specialCount: number;
  /**
   * Approximate total card count, for reference.
   * Computed as (playerCount * colorCardsPerColor) + wildCount + specialCount.
   */
  totalCards: number;
}

/**
 * Destiny deck composition keyed by player count (3–5).
 *
 * Base-game standard (Fantasy Flight Games rulebook):
 *   3 players → 3 colors × 2 cards = 6 color, + 2 wild + 1 special = 9 total
 *   4 players → 4 colors × 2 cards = 8 color, + 2 wild + 2 special = 12 total
 *   5 players → 5 colors × 2 cards = 10 color, + 2 wild + 2 special = 14 total
 */
export const DESTINY_DECK_COMPOSITION: Readonly<
  Record<3 | 4 | 5, DestinyDeckSpec>
> = {
  3: {
    colorCardsPerColor: 2,
    wildCount: 2,
    specialCount: 1,
    totalCards: 3 * 2 + 2 + 1, // 9
  },
  4: {
    colorCardsPerColor: 2,
    wildCount: 2,
    specialCount: 2,
    totalCards: 4 * 2 + 2 + 2, // 14
  },
  5: {
    colorCardsPerColor: 2,
    wildCount: 2,
    specialCount: 2,
    totalCards: 5 * 2 + 2 + 2, // 16
  },
} as const;
