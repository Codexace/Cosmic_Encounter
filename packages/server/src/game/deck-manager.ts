import { v4 as uuidv4 } from 'uuid';
import type {
  CardId,
  CosmicCard,
  DestinyCard,
  AlienId,
  PlayerColor,
  GameState,
} from '@cosmic/shared';
import {
  CardType,
  ArtifactType,
  DestinyCardType,
  COSMIC_DECK_COMPOSITION,
  DESTINY_DECK_COMPOSITION,
  ALIEN_CATALOG,
} from '@cosmic/shared';

export class DeckManager {
  buildCosmicDeck(
    chosenAliens: AlienId[],
    playerCount: number
  ): { allCards: Record<CardId, CosmicCard>; cosmicDeck: CardId[] } {
    const allCards: Record<CardId, CosmicCard> = {};
    const deck: CardId[] = [];

    // Attack cards
    for (const { value, count } of COSMIC_DECK_COMPOSITION.attackCards) {
      for (let i = 0; i < count; i++) {
        const id = uuidv4();
        allCards[id] = { id, type: CardType.ATTACK, value };
        deck.push(id);
      }
    }

    // Negotiate cards
    for (let i = 0; i < COSMIC_DECK_COMPOSITION.negotiateCount; i++) {
      const id = uuidv4();
      allCards[id] = { id, type: CardType.NEGOTIATE };
      deck.push(id);
    }

    // Morph card
    for (let i = 0; i < COSMIC_DECK_COMPOSITION.morphCount; i++) {
      const id = uuidv4();
      allCards[id] = { id, type: CardType.MORPH };
      deck.push(id);
    }

    // Reinforcement cards
    for (const { value, count } of COSMIC_DECK_COMPOSITION.reinforcements) {
      for (let i = 0; i < count; i++) {
        const id = uuidv4();
        allCards[id] = { id, type: CardType.REINFORCEMENT, value };
        deck.push(id);
      }
    }

    // Artifact cards
    for (const artDef of COSMIC_DECK_COMPOSITION.artifacts) {
      for (let i = 0; i < artDef.count; i++) {
        const id = uuidv4();
        allCards[id] = {
          id,
          type: CardType.ARTIFACT,
          artifactType: artDef.artifactType,
          validPhases: artDef.validPhases,
          playerPrereq: artDef.playerPrereq,
          description: artDef.description,
        };
        deck.push(id);
      }
    }

    // Flare cards — chosen aliens + extras to reach 10
    const flareAliens = [...chosenAliens];
    const allAlienIds = Object.keys(ALIEN_CATALOG) as AlienId[];
    const remainingAliens = allAlienIds.filter((a) => !chosenAliens.includes(a));
    const shuffledRemaining = shuffle(remainingAliens);

    const flaresNeeded = 10 - flareAliens.length;
    for (let i = 0; i < flaresNeeded && i < shuffledRemaining.length; i++) {
      flareAliens.push(shuffledRemaining[i]);
    }

    for (const alienId of flareAliens) {
      const alien = ALIEN_CATALOG[alienId];
      if (!alien) continue;
      const id = uuidv4();
      allCards[id] = {
        id,
        type: CardType.FLARE,
        alienId,
        wildText: `Wild: ${alien.shortDescription}`,
        superText: `Super: Enhanced ${alien.shortDescription}`,
      };
      deck.push(id);
    }

    // Shuffle
    return { allCards, cosmicDeck: shuffle(deck) };
  }

  buildDestinyDeck(
    playerColors: PlayerColor[]
  ): { allDestinyCards: Record<CardId, DestinyCard>; destinyDeck: CardId[] } {
    const allDestinyCards: Record<CardId, DestinyCard> = {};
    const deck: CardId[] = [];

    const spec = DESTINY_DECK_COMPOSITION[playerColors.length as 3 | 4 | 5];
    if (!spec) throw new Error(`Invalid player count: ${playerColors.length}`);

    // Color cards
    for (const color of playerColors) {
      for (let i = 0; i < spec.colorCardsPerColor; i++) {
        const id = uuidv4();
        allDestinyCards[id] = {
          id,
          destinyType: DestinyCardType.COLOR,
          color,
          hazardWarning: i > 0, // Second card has hazard warning
        };
        deck.push(id);
      }
    }

    // Wild cards
    for (let i = 0; i < spec.wildCount; i++) {
      const id = uuidv4();
      allDestinyCards[id] = {
        id,
        destinyType: DestinyCardType.WILD,
      };
      deck.push(id);
    }

    // Special cards
    for (let i = 0; i < spec.specialCount; i++) {
      const id = uuidv4();
      allDestinyCards[id] = {
        id,
        destinyType: DestinyCardType.SPECIAL,
        description: 'Have an encounter in any other player\'s system',
      };
      deck.push(id);
    }

    return { allDestinyCards, destinyDeck: shuffle(deck) };
  }

  drawFromCosmicDeck(state: GameState): CardId | null {
    if (state.cosmicDeck.length === 0) {
      // Reshuffle discard
      if (state.cosmicDiscard.length === 0) return null;
      state.cosmicDeck = shuffle([...state.cosmicDiscard]);
      state.cosmicDiscard = [];
    }
    return state.cosmicDeck.pop() ?? null;
  }

  drawFromDestinyDeck(state: GameState): CardId | null {
    if (state.destinyDeck.length <= 1) {
      // Per rules: don't draw last card, reshuffle with discard
      const remaining = [...state.destinyDeck, ...state.destinyDiscard];
      state.destinyDeck = shuffle(remaining);
      state.destinyDiscard = [];
    }
    return state.destinyDeck.pop() ?? null;
  }
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
