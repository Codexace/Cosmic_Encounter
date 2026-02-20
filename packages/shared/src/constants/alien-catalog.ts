import { AlienId, AlienDefinition, SkillLevel, PowerType } from '../types/aliens.js';
import { PlayerPrerequisite } from '../types/cards.js';
import { Phase } from '../types/phases.js';

export const ALIEN_CATALOG: Record<AlienId, AlienDefinition> = {
  [AlienId.ANTI_MATTER]: {
    id: AlienId.ANTI_MATTER,
    name: 'Anti-Matter',
    shortDescription: 'Low encounter card total wins instead of high.',
    powerText:
      'As a main player, after cards are revealed, the side with the lower total wins the encounter. ' +
      'All other rules for winning (ships, allies, etc.) remain the same, but the comparison of totals is reversed. ' +
      'A Negotiate still counts as a Negotiate; this power only affects Attack card comparisons.',
    history: 'In a universe where less is more, the Anti-Matter beings thrive by inverting every expectation.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.CHOSEN]: {
    id: AlienId.CHOSEN,
    name: 'Chosen',
    shortDescription: 'Declare the result of an encounter before it happens.',
    powerText:
      'As the offense, before encounter cards are selected during the Planning phase, you may use this power to declare ' +
      'a specific outcome: either "I win" or "My opponent wins." If the declared outcome occurs naturally, you receive ' +
      'one free colony on any planet of your choice in addition to the normal rewards. If you declare and the outcome ' +
      'does not match, you lose three ships to the warp.',
    history: 'Destiny itself bends to the will of the Chosen, whose visions of the future are rarely wrong.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.CLONE]: {
    id: AlienId.CLONE,
    name: 'Clone',
    shortDescription: 'Keep your encounter card after winning an encounter.',
    powerText:
      'As a main player, after winning an encounter, you may use this power to retain the encounter card you played ' +
      'instead of discarding it to the discard pile. The card is returned to your hand and may be played again in a ' +
      'future encounter. You may only use this power when you are the winner; losing encounters still result in normal ' +
      'card discard.',
    history: 'The Clone species perfected self-replication, extending the life of every resource indefinitely.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.CUDGEL]: {
    id: AlienId.CUDGEL,
    name: 'Cudgel',
    shortDescription: 'Force your opponent to discard cards before encounter.',
    powerText:
      'As the offense at the start of your turn, before the Regroup phase, you may use this power to force the player ' +
      'you will encounter to discard any two cards of your choice from their hand. You must be able to see their hand ' +
      'to make this selection; ask them to reveal their hand briefly. This power may only be used once per turn.',
    history: 'The Cudgel people believe that weakening a foe before battle is simply good strategy.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.START_TURN],
  },

  [AlienId.DICTATOR]: {
    id: AlienId.DICTATOR,
    name: 'Dictator',
    shortDescription: 'Control who is allowed to ally in each encounter.',
    powerText:
      'As a main player, during the Alliance phase, you may use this power to restrict alliances. You may name up to ' +
      'two players who are forbidden from allying with either side in this encounter. Forbidden players must decline ' +
      'any invitation to ally and may not volunteer. All other players may still ally normally. This power is mandatory ' +
      'and must be used every encounter in which you are a main player.',
    history: 'Nothing happens in Dictator space without the Dictator\'s explicit permission.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.ALLIANCE],
  },

  [AlienId.FIDO]: {
    id: AlienId.FIDO,
    name: 'Fido',
    shortDescription: 'Retrieve all your ships from the warp at once.',
    powerText:
      'As the offense, during the Regroup phase, instead of retrieving one ship from the warp as normal, you may use ' +
      'this power to retrieve ALL of your ships currently in the warp at no cost. These ships are returned to your ' +
      'colonies and may be used in this turn\'s encounter.',
    history: 'The loyal Fido species never leaves a comrade behind, no matter how many have fallen.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.REGROUP],
  },

  [AlienId.FILCH]: {
    id: AlienId.FILCH,
    name: 'Filch',
    shortDescription: 'Steal a card from another player\'s hand.',
    powerText:
      'After the resolution of any encounter, you may use this power to steal one card at random from any other ' +
      'player\'s hand. The targeted player must hold their hand face-down and you draw one card blindly from it. ' +
      'That card is added to your hand. You may use this power once per encounter resolution.',
    history: 'What belongs to others is simply what the Filch haven\'t taken yet.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.FODDER]: {
    id: AlienId.FODDER,
    name: 'Fodder',
    shortDescription: 'Use ships from the warp as encounter card reinforcements.',
    powerText:
      'As a main player, after encounter cards are revealed, you may use this power to send any number of your ships ' +
      'from the warp directly out of the game (removed permanently) to add +1 to your total for each ship removed. ' +
      'These ships do not return from the warp; they are sacrificed for the bonus. Declare how many ships you are ' +
      'sacrificing before removing them.',
    history: 'The Fodder regard their warp-imprisoned kin as a resource waiting to be spent.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.GAMBLER]: {
    id: AlienId.GAMBLER,
    name: 'Gambler',
    shortDescription: 'Play encounter card face-up for a bonus reward if correct.',
    powerText:
      'As a main player, during the Planning phase, you may choose to play your encounter card face-up instead of ' +
      'face-down. If you win the encounter, you receive double the normal rewards (double colonies, double cards from ' +
      'compensation, etc.). If you lose the encounter, you lose double the normal ships to the warp. Declare your ' +
      'intent to gamble before both players select their cards.',
    history: 'Fortune favors the bold among the Gambler species, and they are always bold.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.GRUDGE]: {
    id: AlienId.GRUDGE,
    name: 'Grudge',
    shortDescription: 'Mark players with grudge tokens that penalize them.',
    powerText:
      'After the resolution of any encounter in which you lose ships to the warp or lose a colony, you must use this ' +
      'power to place a grudge token on the player responsible. Each grudge token on a player reduces their card-drawing ' +
      'total by one at the end of each turn. A player may have multiple grudge tokens. Grudge tokens are removed when ' +
      'that player successfully negotiates with you.',
    history: 'The Grudge species has a memory longer than the universe itself.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.HACKER]: {
    id: AlienId.HACKER,
    name: 'Hacker',
    shortDescription: 'Receive compensation even when winning as Negotiate.',
    powerText:
      'As the defense, after encounter cards are revealed and both players played Negotiate cards, instead of ' +
      'receiving nothing (as normally occurs in a mutual Negotiate), you receive compensation from the offense\'s ' +
      'hand as if you had lost. Additionally, if the offense wins the encounter for any reason, you still receive ' +
      'compensation equal to the number of ships you lost.',
    history: 'The Hacker species found a way to profit from every agreement, even ones that cost them.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.DEFENSE_ONLY,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.HATE]: {
    id: AlienId.HATE,
    name: 'Hate',
    shortDescription: 'Gain extra ships when encountering a targeted player.',
    powerText:
      'As the offense, during the Launch phase, you may designate one player as your hated enemy for this encounter. ' +
      'If that player is the defense in this encounter, you may place two additional ships on the hyperspace gate beyond ' +
      'the normal limit. If you win the encounter against your hated enemy, you may place a ship on any planet in their ' +
      'home system for free in addition to the normal rewards.',
    history: 'The Hate beings channel their ancient fury into overwhelming force against their chosen rivals.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.LAUNCH],
  },

  [AlienId.HEALER]: {
    id: AlienId.HEALER,
    name: 'Healer',
    shortDescription: 'Return other players\' ships from the warp.',
    powerText:
      'After the resolution of any encounter, you may use this power to return up to three ships belonging to any ' +
      'combination of other players from the warp to their owners\' colonies. The ships are returned to any colony ' +
      'of the owning player\'s choice. You choose which ships are returned, but you may not return your own ships ' +
      'with this power.',
    history: 'The Healer species believes that a galaxy in balance is a galaxy at peace.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.HUMAN]: {
    id: AlienId.HUMAN,
    name: 'Human',
    shortDescription: 'Draw an extra card and send an extra ship each encounter.',
    powerText:
      'As a main player, during the Alliance phase, you may use this power to draw one additional card from the deck ' +
      'and add one extra ship from any of your colonies to the encounter (either on the hyperspace gate as offense or ' +
      'on the defensive planet). These bonuses are in addition to your normal card draw and ship limits.',
    history: 'Unremarkable in every measurable way, Humans compensate with sheer persistence and adaptability.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.ALLIANCE],
  },

  [AlienId.KAMIKAZE]: {
    id: AlienId.KAMIKAZE,
    name: 'Kamikaze',
    shortDescription: 'Destroy all ships in the encounter, including your own.',
    powerText:
      'As a main player, after encounter cards are revealed, you may use this power to send ALL ships in the encounter ' +
      '(both sides, including allies) to the warp. No one wins or loses the encounter normally; instead, the encounter ' +
      'ends immediately after all ships are sent to the warp. No colonies are gained or lost, and no compensation is ' +
      'paid. This power destroys your own ships along with your opponent\'s.',
    history: 'Victory and defeat are meaningless distinctions to the Kamikaze; only the explosion matters.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.LOSER]: {
    id: AlienId.LOSER,
    name: 'Loser',
    shortDescription: 'Win encounters you lose and lose encounters you win.',
    powerText:
      'As a main player, after the resolution of the encounter, the result is reversed for you only. If you would ' +
      'normally win, you instead lose (your ships go to the warp, the colony is not established). If you would ' +
      'normally lose, you instead win (you establish or defend the colony, allies receive rewards). Negotiate cards ' +
      'and their deal-making are unaffected by this reversal.',
    history: 'The Losers discovered long ago that the universe rewards only those who expect the opposite of everything.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.MACRON]: {
    id: AlienId.MACRON,
    name: 'Macron',
    shortDescription: 'Each of your ships counts as four ships in encounters.',
    powerText:
      'As a main player, after encounter cards are revealed, each ship you have in the encounter counts as four ships ' +
      'instead of one when adding to your encounter total. For example, if you have three ships in the encounter, they ' +
      'contribute +12 rather than +3. This applies to ships on the hyperspace gate (offense) or defending planet ' +
      '(defense), but not to allied ships.',
    history: 'The colossal Macron beings dwarf entire fleets; even a single ship is an armada unto itself.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.MIND]: {
    id: AlienId.MIND,
    name: 'Mind',
    shortDescription: 'Predict opponent\'s card during planning to win automatically.',
    powerText:
      'As the defense, during the Planning phase, before either player selects their encounter card, you may declare ' +
      'the exact card (Attack value or Negotiate) you believe the offense will play. If your prediction is correct, ' +
      'you automatically win the encounter regardless of totals. If your prediction is wrong, the encounter resolves ' +
      'normally. You may only use this power once per encounter.',
    history: 'The Mind species reads thought-patterns as easily as others read text.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.DEFENSE_ONLY,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.MISER]: {
    id: AlienId.MISER,
    name: 'Miser',
    shortDescription: 'Store cards in a secret hidden hoard.',
    powerText:
      'At the start of any turn (yours or another player\'s), you may use this power to place any number of cards ' +
      'from your hand face-down into your secret hoard. Cards in the hoard are not part of your hand and cannot be ' +
      'targeted by powers or effects that affect your hand. You may retrieve any or all cards from your hoard at the ' +
      'start of your turn. Cards in the hoard count toward your hand limit only at the end of your turn.',
    history: 'Trust no one—this is the first lesson taught to every Miser hatchling.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.START_TURN],
  },

  [AlienId.MUTANT]: {
    id: AlienId.MUTANT,
    name: 'Mutant',
    shortDescription: 'Draw new cards from the deck after losing an encounter.',
    powerText:
      'As a main player, after losing an encounter, you must use this power to draw cards from the deck equal to the ' +
      'number of ships you lost to the warp in this encounter (minimum one card). These cards are added to your hand ' +
      'immediately. This power triggers after compensation (if any) has been paid.',
    history: 'Every defeat only makes the Mutant stronger, stranger, and more unpredictable.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.OBSERVER]: {
    id: AlienId.OBSERVER,
    name: 'Observer',
    shortDescription: 'Earn rewards when watching defense win without being an ally.',
    powerText:
      'When you are not a main player and did not ally in the current encounter, if the defense wins the encounter, ' +
      'you must use this power to collect a reward: draw one card from the deck. If the defense wins by a margin of ' +
      'ten or more, draw two cards instead. This power triggers after the encounter fully resolves.',
    history: 'The Observer people learned that watching carefully is often more profitable than participating.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.NOT_MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.ORACLE]: {
    id: AlienId.ORACLE,
    name: 'Oracle',
    shortDescription: 'See your opponent\'s encounter card before selecting your own.',
    powerText:
      'As the offense, during the Planning phase, before you select your own encounter card, you must use this power ' +
      'to ask the defense to reveal their encounter card to you. After seeing the defense\'s card, you then select ' +
      'your encounter card as normal. The defense\'s card remains face-up for the remainder of the Planning phase.',
    history: 'The Oracle beings gaze into the heart of every opponent before raising a hand against them.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.PACIFIST]: {
    id: AlienId.PACIFIST,
    name: 'Pacifist',
    shortDescription: 'Win automatically when playing Negotiate against an Attack.',
    powerText:
      'As a main player, after encounter cards are revealed, if you played a Negotiate card and your opponent played ' +
      'an Attack card, you automatically win the encounter. The normal rule (that Negotiate loses to Attack) does not ' +
      'apply to you. If both players play Negotiate, the encounter resolves normally as a failed deal. This power ' +
      'does not apply when you are an ally.',
    history: 'The Pacifist beings discovered that refusing to fight is itself the most devastating weapon.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.PARASITE]: {
    id: AlienId.PARASITE,
    name: 'Parasite',
    shortDescription: 'Must be invited to ally, or can ally uninvited as parasite.',
    powerText:
      'During the Alliance phase, you must use this power: if you are invited to ally, you must accept. Additionally, ' +
      'if you are not invited by either side, you may attach yourself as an uninvited ally to either the offense or ' +
      'defense, sending one ship to that side. The invited side may not refuse your uninvited alliance. You receive ' +
      'all normal ally rewards.',
    history: 'Where the Parasite attaches itself, it stays—whether welcome or not.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.ALLIANCE],
  },

  [AlienId.PHILANTHROPIST]: {
    id: AlienId.PHILANTHROPIST,
    name: 'Philanthropist',
    shortDescription: 'Must give cards to the player with the fewest cards.',
    powerText:
      'After the resolution of any encounter, you must use this power to give two cards from your hand to the player ' +
      'who currently has the fewest cards in their hand. If there is a tie for fewest cards, you choose among the ' +
      'tied players. You choose which two cards to give. If you have fewer than two cards, you give all you have.',
    history: 'The Philanthropist species is compelled by their nature to share, whether others deserve it or not.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.PICKPOCKET]: {
    id: AlienId.PICKPOCKET,
    name: 'Pickpocket',
    shortDescription: 'Steal compensation cards meant for another player.',
    powerText:
      'After the resolution of any encounter in which compensation is paid, you may use this power to intercept the ' +
      'compensation. Instead of the entitled player drawing compensation cards from the losing player\'s hand, you ' +
      'draw those cards instead and add them to your own hand. The entitled player receives nothing. You may use ' +
      'this power once per encounter resolution.',
    history: 'The Pickpocket species thrives in the chaos following every battle.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.REINCARNATOR]: {
    id: AlienId.REINCARNATOR,
    name: 'Reincarnator',
    shortDescription: 'Gain a new alien power when all home colonies are lost.',
    powerText:
      'Whenever you lose your last home colony (all five of your home planets are occupied by foreign ships), you ' +
      'must use this power immediately. Draw three alien cards from the unused alien deck, choose one, and become ' +
      'that alien for the rest of the game. Discard the other two. Your new power takes effect immediately. You may ' +
      'only reincarnate once per game.',
    history: 'Death for the Reincarnator is merely an opportunity to become something better.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.REMORA]: {
    id: AlienId.REMORA,
    name: 'Remora',
    shortDescription: 'Collect a card whenever any player draws cards.',
    powerText:
      'Whenever any player (including yourself) draws one or more cards from the cosmic deck for any reason, you ' +
      'must use this power to draw one additional card from the deck for yourself. This applies to card draws from ' +
      'all sources: normal hand replenishment, compensation, artifact effects, and alien powers. You do not receive ' +
      'a card when cards are drawn from sources other than the cosmic deck.',
    history: 'Attached to the great currents of cosmic commerce, the Remora takes its cut from every flow.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.START_TURN, Phase.REGROUP, Phase.DESTINY, Phase.LAUNCH, Phase.ALLIANCE, Phase.PLANNING, Phase.REVEAL, Phase.RESOLUTION],
  },

  [AlienId.RESERVE]: {
    id: AlienId.RESERVE,
    name: 'Reserve',
    shortDescription: 'Send additional ships to the encounter after cards are revealed.',
    powerText:
      'As the offense or as an offensive ally, after encounter cards are revealed but before totals are calculated, ' +
      'you may use this power to send up to four additional ships from any of your colonies to the hyperspace gate ' +
      'as reinforcements. These ships add to your side\'s total as normal. Ships sent this way are subject to normal ' +
      'warp rules if your side loses.',
    history: 'The Reserve species holds its finest warriors back until the exact moment they are needed.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSIVE_ALLY,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.SEEKER]: {
    id: AlienId.SEEKER,
    name: 'Seeker',
    shortDescription: 'Name a card value; opponent must play it if they have it.',
    powerText:
      'As a main player, during the Planning phase, before either player selects their encounter card, you may use ' +
      'this power to name a specific card (e.g., "Attack 20" or "Negotiate"). If your opponent has that card in their ' +
      'hand, they must play it as their encounter card. If they do not have that card, the encounter proceeds normally. ' +
      'Your opponent must honestly confirm whether they have the named card.',
    history: 'The Seeker species finds exactly what it is looking for—always.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.SHADOW]: {
    id: AlienId.SHADOW,
    name: 'Shadow',
    shortDescription: 'Your ships go to opponent\'s colonies instead of the warp when you lose.',
    powerText:
      'As a main player, after losing an encounter, instead of sending your ships to the warp as normal, your losing ' +
      'ships are placed on planets in the winner\'s home system (one ship per planet, filling planets with fewer ' +
      'foreign ships first). If there are no available planets in the winner\'s home system, excess ships go to ' +
      'the warp as normal.',
    history: 'Shadow ships slip through defeat and emerge behind enemy lines.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.SORCERER]: {
    id: AlienId.SORCERER,
    name: 'Sorcerer',
    shortDescription: 'Swap encounter cards with your opponent after both are revealed.',
    powerText:
      'As a main player, after both encounter cards are revealed, you may use this power to swap your encounter card ' +
      'with your opponent\'s encounter card. Each player now uses the other\'s card to calculate their total. The ' +
      'encounter then resolves using the swapped cards. This swap happens after revelation but before totals are ' +
      'calculated.',
    history: 'What you prepared becomes the Sorcerer\'s weapon; what they prepared becomes yours.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.SPIFF]: {
    id: AlienId.SPIFF,
    name: 'Spiff',
    shortDescription: 'Launch ships directly from any colony, not just home system.',
    powerText:
      'As the offense, during the Launch phase, you may use this power to load ships onto the hyperspace gate from ' +
      'any of your colonies anywhere in the galaxy, not just from your home system. You may combine ships from ' +
      'multiple colonies on different planets as long as the total does not exceed the normal ship limit. Colonies ' +
      'used for this launch must have at least one ship remaining after loading.',
    history: 'The Spiff never let geography limit their ambitions—any colony is a launching point.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.LAUNCH],
  },

  [AlienId.TICK_TOCK]: {
    id: AlienId.TICK_TOCK,
    name: 'Tick-Tock',
    shortDescription: 'Win the game when your timer token reaches a set value.',
    powerText:
      'At the start of each of your turns, during the Regroup phase, you must place one token on your alien sheet. ' +
      'When you have accumulated tokens equal to the number of players plus three (e.g., seven tokens in a four-player ' +
      'game), you immediately win the game, regardless of colony counts. Other players may attempt to eliminate you ' +
      'before this threshold is reached.',
    history: 'The Tick-Tock beings do not fight for colonies—they merely wait for time to deliver victory.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.REGROUP],
  },

  [AlienId.TRADER]: {
    id: AlienId.TRADER,
    name: 'Trader',
    shortDescription: 'Swap your entire hand with your opponent\'s hand.',
    powerText:
      'As a main player, after the resolution of an encounter, you may use this power to trade hands with your ' +
      'opponent (the other main player in the encounter). Both players simultaneously exchange their entire hands. ' +
      'Neither player may look at the other\'s hand before the trade. You may use this power regardless of whether ' +
      'you won or lost.',
    history: 'The Trader species built an empire not through conquest, but through the perfect exchange.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.TRIPLER]: {
    id: AlienId.TRIPLER,
    name: 'Tripler',
    shortDescription: 'Triple the value of your encounter card.',
    powerText:
      'As a main player, after encounter cards are revealed, you may use this power to triple the value of your ' +
      'encounter card (e.g., an Attack 10 becomes Attack 30). This tripling is applied before adding ships. If you ' +
      'played a Negotiate card, this power has no effect. The tripling applies only to your card value, not to ' +
      'your ships or reinforcements.',
    history: 'Three times the force. Three times the glory. Three times the enemies.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.VACUUM]: {
    id: AlienId.VACUUM,
    name: 'Vacuum',
    shortDescription: 'Pull ships from enemy colonies into the encounter as defenders.',
    powerText:
      'As the offense, during the Launch phase, you must use this power to pull up to three ships from any of the ' +
      'defense\'s colonies (other than the targeted planet) onto the targeted planet as additional defenders. These ' +
      'ships are added to the defense\'s side and are subject to normal warp rules if the defense loses. The defense ' +
      'does not choose which ships are pulled.',
    history: 'The Vacuum creates a battlefield gravity that no one can escape.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.LAUNCH],
  },

  [AlienId.VIRUS]: {
    id: AlienId.VIRUS,
    name: 'Virus',
    shortDescription: 'Multiply your card value by your number of ships instead of adding.',
    powerText:
      'As a main player, after encounter cards are revealed, instead of adding the number of your ships to your ' +
      'card value, you multiply your card value by the number of your ships in the encounter. For example, an ' +
      'Attack 8 with 4 ships yields a total of 32. If you play a Negotiate, this power has no effect. Ships from ' +
      'allies are not included in the multiplication.',
    history: 'The Virus spreads exponentially; so too does its power in battle.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.VOID]: {
    id: AlienId.VOID,
    name: 'Void',
    shortDescription: 'Remove offense ships from the game entirely rather than warp.',
    powerText:
      'As the defense, after winning an encounter, instead of sending the offense\'s losing ships to the warp, you ' +
      'must use this power to remove those ships from the game permanently. The ships are placed aside and do not ' +
      'return for any reason (including powers that retrieve from the warp). Allied ships on the offense\'s side ' +
      'are also removed permanently.',
    history: 'Those who attack Void space do not merely lose—they cease to exist.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.DEFENSE_ONLY,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.WARPISH]: {
    id: AlienId.WARPISH,
    name: 'Warpish',
    shortDescription: 'Retrieve extra ships from the warp each regroup phase.',
    powerText:
      'As a main player, during the Regroup phase, instead of retrieving one ship from the warp as normal, you may ' +
      'use this power to retrieve up to three ships from the warp. You choose which ships to retrieve. The retrieved ' +
      'ships are returned to any of your colonies. This power replaces the normal single-ship retrieval.',
    history: 'The Warpish species treat the warp not as a prison, but as a temporary waystation.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REGROUP],
  },

  [AlienId.WARRIOR]: {
    id: AlienId.WARRIOR,
    name: 'Warrior',
    shortDescription: 'Accumulate warrior tokens to add bonus to encounter totals.',
    powerText:
      'As a main player, after winning an encounter, you must place one warrior token on your alien sheet. Each ' +
      'warrior token adds +1 to your encounter total in all future encounters. Tokens are accumulated across ' +
      'multiple turns; they do not reset. When you lose an encounter as a main player, you lose all warrior tokens ' +
      'but immediately place one new one.',
    history: 'Each victory hardens the Warrior; each loss only tempers them for the next fight.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.WILL]: {
    id: AlienId.WILL,
    name: 'Will',
    shortDescription: 'Double or nothing: gamble after cards are revealed.',
    powerText:
      'As a main player, after encounter cards are revealed but before totals are finalized, you may use this power ' +
      'to declare "double or nothing." If you win the encounter, you establish two colonies on the targeted planet ' +
      '(or gain double cards from compensation), but if you lose, all of your ships in the encounter (including ' +
      'allies on your side) are sent to the warp and you gain no compensation.',
    history: 'The Will imposes its desires on the universe itself—the universe does not always comply.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },

  [AlienId.ZOMBIE]: {
    id: AlienId.ZOMBIE,
    name: 'Zombie',
    shortDescription: 'Your ships never go to the warp for any reason.',
    powerText:
      'Your ships never go to the warp. Whenever any of your ships would be sent to the warp due to losing an ' +
      'encounter, being affected by a power, or any other game effect, those ships are instead returned directly ' +
      'to any of your colonies. You choose where to place them. This power is always in effect and cannot be ' +
      'negated except by a Cosmic Zap.',
    history: 'The undying Zombie species cannot be destroyed—only inconvenienced.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.START_TURN, Phase.REGROUP, Phase.DESTINY, Phase.LAUNCH, Phase.ALLIANCE, Phase.PLANNING, Phase.REVEAL, Phase.RESOLUTION],
  },

  [AlienId.AMOEBA]: {
    id: AlienId.AMOEBA,
    name: 'Amoeba',
    shortDescription: 'Add unlimited ships to encounters beyond the normal limit.',
    powerText:
      'As the offense, during the Launch phase, you may use this power to load any number of ships onto the ' +
      'hyperspace gate, ignoring the normal four-ship limit. You may send as many ships as you wish from any ' +
      'of your home colonies. Each ship adds +1 to your encounter total as normal. All these ships are subject ' +
      'to normal warp rules if you lose.',
    history: 'The Amoeba divides and multiplies without limit, filling every available space.',
    skillLevel: SkillLevel.GREEN,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.OFFENSE,
    activePhases: [Phase.LAUNCH],
  },

  [AlienId.CITADEL]: {
    id: AlienId.CITADEL,
    name: 'Citadel',
    shortDescription: 'Protect one of your colonies from being lost in an encounter.',
    powerText:
      'As the defense, after losing an encounter, you may use this power to protect the targeted colony. Instead of ' +
      'losing the colony (handing it over to the offense), the colony remains yours. The offense\'s ships are ' +
      'returned to their colonies rather than establishing a new colony. You still lose any ships that were in ' +
      'the encounter to the warp. This power may only be used once per turn.',
    history: 'No fortress has ever fallen to an attacker while the Citadel chooses to stand firm.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.DEFENSE_ONLY,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.CHRYSALIS]: {
    id: AlienId.CHRYSALIS,
    name: 'Chrysalis',
    shortDescription: 'Transform into a more powerful alien after enough encounters.',
    powerText:
      'At the start of each of your turns, place one chrysalis token on your alien sheet. When you have accumulated ' +
      'five chrysalis tokens, you must use this power to transform: draw three alien cards from the unused alien ' +
      'deck, choose one to become, and discard the rest along with this alien sheet. Your new alien power takes ' +
      'effect immediately. Remove all chrysalis tokens.',
    history: 'What the Chrysalis becomes is always more terrible and magnificent than what it was.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.START_TURN],
  },

  [AlienId.ETHIC]: {
    id: AlienId.ETHIC,
    name: 'Ethic',
    shortDescription: 'Force negotiations by requiring Negotiate cards to be played.',
    powerText:
      'As a main player, during the Planning phase, you must use this power to announce that this encounter will be ' +
      'conducted ethically. Both you and your opponent must play Negotiate cards as your encounter cards. If either ' +
      'player does not have a Negotiate card, they must play their lowest-value Attack card instead. Deals made in ' +
      'ethical encounters must be honored or the violating player loses three ships to the warp.',
    history: 'The Ethic beings believe diplomacy is not optional—it is the only civilized path.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.PLANNING],
  },

  [AlienId.FURY]: {
    id: AlienId.FURY,
    name: 'Fury',
    shortDescription: 'Launch a free revenge encounter when you lose a home colony.',
    powerText:
      'As the defense, after losing an encounter that costs you a home colony, you must use this power immediately. ' +
      'You launch a free revenge encounter against the player who took your colony before any other game actions ' +
      'continue. This free encounter follows all normal rules. You may send up to four ships from any of your ' +
      'remaining colonies. Win or lose, normal consequences apply.',
    history: 'The Fury species answers every transgression with immediate, overwhelming retaliation.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.DEFENSE_ONLY,
    activePhases: [Phase.RESOLUTION],
  },

  [AlienId.PENTAFORM]: {
    id: AlienId.PENTAFORM,
    name: 'Pentaform',
    shortDescription: 'Change your alien power at the start of each encounter.',
    powerText:
      'At the start of each of your turns, you must use this power to switch your active alien form. You have five ' +
      'forms, each represented by a card placed face-down. Reveal the next form in sequence; that form\'s power is ' +
      'active for this turn. Each form has a different effect: Form 1 grants +4 to totals, Form 2 lets you draw ' +
      'two extra cards, Form 3 retrieves two ships from warp, Form 4 lets you ally on either side, Form 5 lets ' +
      'you steal one card from any player.',
    history: 'The Pentaform species never fights the same war twice.',
    skillLevel: SkillLevel.RED,
    powerType: PowerType.MANDATORY,
    playerPrerequisite: PlayerPrerequisite.ANY_PLAYER,
    activePhases: [Phase.START_TURN],
  },

  [AlienId.PHILANTHROPIST_2]: {
    id: AlienId.PHILANTHROPIST_2,
    name: 'Mirror',
    shortDescription: 'Reverse your opponent\'s encounter card value.',
    powerText:
      'As a main player, after encounter cards are revealed, you may use this power to reverse your opponent\'s ' +
      'Attack card value. The reversed value is calculated as 40 minus the card\'s printed value (e.g., an Attack ' +
      '30 becomes Attack 10, an Attack 06 becomes Attack 34). Negotiate cards cannot be reversed. After reversal, ' +
      'totals are calculated normally using the new reversed value for your opponent.',
    history: 'The Mirror beings reflect every strength back as weakness, and every weakness as strength.',
    skillLevel: SkillLevel.YELLOW,
    powerType: PowerType.OPTIONAL,
    playerPrerequisite: PlayerPrerequisite.MAIN_PLAYER,
    activePhases: [Phase.REVEAL],
  },
};
