import type { CosmicCard, EncounterOutcome } from '@cosmic/shared';
import { CardType } from '@cosmic/shared';

/**
 * Resolves the encounter based on the revealed cards and totals.
 * This function handles morph resolution and all card type combinations.
 */
export function resolveEncounter(
  offenseCard: CosmicCard,
  defenseCard: CosmicCard,
  offenseTotal: number,
  defenseTotal: number
): EncounterOutcome {
  // Resolve morph cards to their effective types
  const effOffense = resolveMorph(offenseCard, defenseCard);
  const effDefense = resolveMorph(defenseCard, offenseCard);

  // Attack vs Attack
  if (effOffense.type === CardType.ATTACK && effDefense.type === CardType.ATTACK) {
    // Ties go to defense
    if (offenseTotal > defenseTotal) {
      return { type: 'OFFENSE_WINS' };
    } else {
      return { type: 'DEFENSE_WINS' };
    }
  }

  // Attack vs Negotiate
  if (effOffense.type === CardType.ATTACK && effDefense.type === CardType.NEGOTIATE) {
    return {
      type: 'ATTACK_VS_NEGOTIATE',
      winner: 'offense',
      compensationShips: 0, // Actual compensation calculated by engine based on ships lost
    };
  }

  // Negotiate vs Attack
  if (effOffense.type === CardType.NEGOTIATE && effDefense.type === CardType.ATTACK) {
    return {
      type: 'ATTACK_VS_NEGOTIATE',
      winner: 'defense',
      compensationShips: 0,
    };
  }

  // Negotiate vs Negotiate
  if (effOffense.type === CardType.NEGOTIATE && effDefense.type === CardType.NEGOTIATE) {
    return { type: 'DEAL_MAKING' };
  }

  // Shouldn't reach here with valid encounter cards
  return { type: 'OFFENSE_WINS' };
}

function resolveMorph(
  card: CosmicCard,
  opponentCard: CosmicCard
): CosmicCard {
  if (card.type === CardType.MORPH) {
    // Morph becomes a copy of the opponent's card
    return { ...opponentCard, id: card.id };
  }
  return card;
}
