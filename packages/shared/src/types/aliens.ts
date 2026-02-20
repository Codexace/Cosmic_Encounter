import type { Phase } from './phases.js';
import type { PlayerPrerequisite } from './cards.js';

export enum AlienId {
  ANTI_MATTER = 'ANTI_MATTER',
  CHOSEN = 'CHOSEN',
  CLONE = 'CLONE',
  CUDGEL = 'CUDGEL',
  DICTATOR = 'DICTATOR',
  FIDO = 'FIDO',
  FILCH = 'FILCH',
  FODDER = 'FODDER',
  GAMBLER = 'GAMBLER',
  GRUDGE = 'GRUDGE',
  HACKER = 'HACKER',
  HATE = 'HATE',
  HEALER = 'HEALER',
  HUMAN = 'HUMAN',
  KAMIKAZE = 'KAMIKAZE',
  LOSER = 'LOSER',
  MACRON = 'MACRON',
  MIND = 'MIND',
  MISER = 'MISER',
  MUTANT = 'MUTANT',
  OBSERVER = 'OBSERVER',
  ORACLE = 'ORACLE',
  PACIFIST = 'PACIFIST',
  PARASITE = 'PARASITE',
  PHILANTHROPIST = 'PHILANTHROPIST',
  PICKPOCKET = 'PICKPOCKET',
  REINCARNATOR = 'REINCARNATOR',
  REMORA = 'REMORA',
  RESERVE = 'RESERVE',
  SEEKER = 'SEEKER',
  SHADOW = 'SHADOW',
  SORCERER = 'SORCERER',
  SPIFF = 'SPIFF',
  TICK_TOCK = 'TICK_TOCK',
  TRADER = 'TRADER',
  TRIPLER = 'TRIPLER',
  VACUUM = 'VACUUM',
  VIRUS = 'VIRUS',
  VOID = 'VOID',
  WARPISH = 'WARPISH',
  WARRIOR = 'WARRIOR',
  WILL = 'WILL',
  ZOMBIE = 'ZOMBIE',
  AMOEBA = 'AMOEBA',
  CITADEL = 'CITADEL',
  CHRYSALIS = 'CHRYSALIS',
  ETHIC = 'ETHIC',
  FURY = 'FURY',
  PENTAFORM = 'PENTAFORM',
  PHILANTHROPIST_2 = 'PHILANTHROPIST_2',
}

export enum SkillLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export enum PowerType {
  OPTIONAL = 'OPTIONAL',
  MANDATORY = 'MANDATORY',
}

export interface AlienDefinition {
  id: AlienId;
  name: string;
  shortDescription: string;
  powerText: string;
  history: string;
  skillLevel: SkillLevel;
  powerType: PowerType;
  playerPrerequisite: PlayerPrerequisite;
  activePhases: Phase[];
}
